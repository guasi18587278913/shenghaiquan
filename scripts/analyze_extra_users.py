#!/usr/bin/env python3
"""
分析CSV数据和数据库的差异，找出额外的22个用户
"""

import json
import csv
import os
import sqlite3
from datetime import datetime
from collections import defaultdict, Counter

def read_csv_users(csv_path):
    """读取CSV文件，获取所有有效的用户名列表"""
    users = []
    
    # 使用csv模块来正确处理包含换行符和引号的CSV文件
    with open(csv_path, 'r', encoding='utf-8-sig') as file:
        csv_reader = csv.reader(file)
        
        # 跳过标题行
        header = next(csv_reader, None)
        
        for i, row in enumerate(csv_reader, start=2):  # 从第2行开始（跳过标题）
            if len(row) >= 13 and row[0].isdigit():  # 确保是有效数据行
                try:
                    # 星球编号在第1列（索引0）
                    star_id = row[0].strip()
                    # 微信昵称在第2列（索引1）
                    wechat_name = row[1].strip()
                    # 星球昵称在第3列（索引2）
                    star_name = row[2].strip()
                    # 手机号在第12列（索引11）
                    phone = row[11].strip() if len(row) > 11 else ''
                    # 微信号在第13列（索引12）
                    wechat_id = row[12].strip() if len(row) > 12 else ''
                    
                    # 优先使用星球昵称，如果为空则使用微信昵称
                    name = star_name if star_name else wechat_name
                    
                    if name:
                        users.append({
                            'star_id': star_id,
                            'name': name,
                            'wechat_name': wechat_name,
                            'star_name': star_name,
                            'phone': phone,
                            'wechat_id': wechat_id,
                            'line_number': i,
                            'raw_line': ','.join(row[:5]) + '...' if len(','.join(row)) > 100 else ','.join(row)
                        })
                except Exception as e:
                    print(f"  警告: 第{i}行解析失败: {e}")
    
    return users

def get_db_users(db_path):
    """从数据库获取所有用户信息"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 获取所有用户
    cursor.execute("""
        SELECT id, email, name, phone, role, createdAt, updatedAt
        FROM User
        ORDER BY createdAt
    """)
    
    users = []
    for row in cursor.fetchall():
        users.append({
            'id': row[0],
            'email': row[1],
            'name': row[2],
            'phone': row[3],
            'role': row[4],
            'created_at': row[5],
            'updated_at': row[6]
        })
    
    conn.close()
    return users

def analyze_extra_users(csv_users, db_users):
    """分析在数据库中但不在CSV中的用户"""
    # 创建多个查找集合，提高匹配准确性
    csv_names = {user['name'].lower().strip() for user in csv_users}
    csv_wechat_names = {user['wechat_name'].lower().strip() for user in csv_users if user['wechat_name']}
    csv_star_names = {user['star_name'].lower().strip() for user in csv_users if user['star_name']}
    csv_phones = {user['phone'].strip() for user in csv_users if user['phone'] and user['phone'] != '无'}
    csv_wechat_ids = {user['wechat_id'].lower().strip() for user in csv_users if user['wechat_id']}
    
    # 合并所有名称集合
    all_csv_names = csv_names | csv_wechat_names | csv_star_names
    
    # 找出额外的用户
    extra_users = []
    seed_users = []  # 种子数据用户
    matched_users = []  # 匹配到的用户
    
    for db_user in db_users:
        name_lower = db_user['name'].lower().strip() if db_user['name'] else ''
        email_lower = db_user['email'].lower().strip() if db_user['email'] else ''
        phone = db_user['phone'].strip() if db_user['phone'] else ''
        
        # 检查是否在CSV中
        in_csv = False
        match_type = None
        
        # 1. 名称匹配（检查所有可能的名称）
        if name_lower in all_csv_names:
            in_csv = True
            match_type = 'name'
        # 2. 手机号匹配
        elif phone and phone in csv_phones:
            in_csv = True
            match_type = 'phone'
        # 3. 微信ID匹配（假设email可能包含微信ID）
        elif email_lower and any(wechat_id in email_lower for wechat_id in csv_wechat_ids if wechat_id):
            in_csv = True
            match_type = 'wechat_id'
        
        if in_csv:
            matched_users.append(db_user)
        else:
            # 判断是否是种子数据（系统内置用户）
            if ('student' in email_lower or 'admin' in email_lower or 
                'assistant' in email_lower or 'test' in email_lower or
                db_user['role'] != 'USER'):
                seed_users.append(db_user)
            else:
                extra_users.append(db_user)
    
    return extra_users, seed_users, matched_users

def analyze_user_patterns(users):
    """分析用户的特征模式"""
    patterns = {
        'total': len(users),
        'by_role': Counter(user['role'] for user in users),
        'by_email_domain': defaultdict(int),
        'by_creation_date': defaultdict(int),
        'email_patterns': defaultdict(int),
        'users': []
    }
    
    for user in users:
        # 分析邮箱域名
        if user['email'] and '@' in user['email']:
            domain = user['email'].split('@')[1]
            patterns['by_email_domain'][domain] += 1
        
        # 分析创建日期
        if user['created_at']:
            try:
                # 处理时间戳（毫秒）
                if isinstance(user['created_at'], (int, float)) or user['created_at'].isdigit():
                    timestamp = int(user['created_at']) / 1000  # 转换为秒
                    created_date = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
                else:
                    # 如果是日期字符串
                    created_date = user['created_at'].split()[0]
                patterns['by_creation_date'][created_date] += 1
            except:
                pass
        
        # 分析邮箱模式
        if user['email']:
            if user['email'].count('.') > 1:
                patterns['email_patterns']['multiple_dots'] += 1
            if any(char.isdigit() for char in user['email'].split('@')[0]):
                patterns['email_patterns']['contains_numbers'] += 1
            if user['email'].startswith('student'):
                patterns['email_patterns']['starts_with_student'] += 1
        
        # 保存用户详细信息
        patterns['users'].append({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'role': user['role'],
            'created_at': user['created_at']
        })
    
    # 转换Counter对象为字典
    patterns['by_role'] = dict(patterns['by_role'])
    patterns['by_email_domain'] = dict(patterns['by_email_domain'])
    patterns['by_creation_date'] = dict(patterns['by_creation_date'])
    patterns['email_patterns'] = dict(patterns['email_patterns'])
    
    return patterns

def main():
    # 设置路径
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'data', '海外AI产品 名单 .csv')
    db_path = os.path.join(base_dir, 'prisma', 'dev.db')
    output_path = os.path.join(base_dir, 'extra-users-analysis.json')
    
    print("🔍 开始分析CSV和数据库差异...")
    
    # 读取数据
    print("📄 读取CSV文件...")
    csv_users = read_csv_users(csv_path)
    print(f"  CSV中有效用户数: {len(csv_users)}")
    
    print("💾 读取数据库...")
    db_users = get_db_users(db_path)
    print(f"  数据库总用户数: {len(db_users)}")
    
    # 找出额外用户
    print("\n🔎 查找额外用户...")
    extra_users, seed_users, matched_users = analyze_extra_users(csv_users, db_users)
    
    print(f"  匹配到的用户: {len(matched_users)}")
    print(f"  种子数据用户: {len(seed_users)}")
    print(f"  额外用户数: {len(extra_users)}")
    
    # 分析额外用户特征
    print("\n📊 分析额外用户特征...")
    extra_analysis = analyze_user_patterns(extra_users)
    seed_analysis = analyze_user_patterns(seed_users)
    
    # 汇总结果
    result = {
        'summary': {
            'csv_users': len(csv_users),
            'db_users': len(db_users),
            'matched_users': len(matched_users),
            'seed_users': len(seed_users),
            'extra_users': len(extra_users),
            'expected_extra': len(db_users) - len(csv_users),
            'analysis_time': datetime.now().isoformat()
        },
        'extra_users': extra_analysis,
        'seed_users': seed_analysis,
        'csv_sample': {
            'first_5_users': csv_users[:5] if csv_users else [],
            'total': len(csv_users)
        },
        'verification': {
            'total_check': len(matched_users) + len(seed_users) + len(extra_users) == len(db_users),
            'expected_csv_imports': len(csv_users),
            'actual_matched': len(matched_users),
            'difference': len(csv_users) - len(matched_users)
        }
    }
    
    # 保存结果
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 分析完成，结果已保存到: {output_path}")
    
    # 打印摘要
    print("\n📋 分析摘要:")
    print(f"  CSV用户总数: {len(csv_users)}")
    print(f"  数据库用户总数: {len(db_users)}")
    print(f"  种子数据: {len(seed_users)}")
    print(f"  额外用户: {len(extra_users)}")
    print(f"\n  预期差异 (DB - CSV): {len(db_users) - len(csv_users)}")
    print(f"  实际额外用户: {len(extra_users)}")
    print(f"  差异解释: {len(seed_users)} 个种子用户 + {len(extra_users)} 个额外用户")
    
    if extra_analysis['by_role']:
        print(f"\n  额外用户角色分布:")
        for role, count in extra_analysis['by_role'].items():
            print(f"    {role}: {count}")
    
    if extra_analysis['by_email_domain']:
        print(f"\n  额外用户邮箱域名分布:")
        for domain, count in sorted(extra_analysis['by_email_domain'].items(), 
                                   key=lambda x: x[1], reverse=True)[:5]:
            print(f"    {domain}: {count}")

if __name__ == '__main__':
    main()