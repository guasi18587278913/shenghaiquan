'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Lock, Phone, Zap, MessageCircle } from 'lucide-react';

const testAccounts = [
  { name: '亦仁', phone: '13800000001', level: 10, role: '创始人', color: 'from-purple-500 to-pink-500' },
  { name: '欢欢', phone: '13800000002', level: 7, role: '活跃学员', color: 'from-teal-500 to-cyan-500' },
  { name: '宝芙', phone: '13800000003', level: 8, role: '高级学员', color: 'from-blue-500 to-indigo-500' },
  { name: '瓜斯', phone: '13800000004', level: 2, role: '新手学员', color: 'from-green-500 to-emerald-500' },
  { name: '雪雪', phone: '13800000005', level: 9, role: '课程助教', color: 'from-amber-500 to-orange-500' },
  { name: '明德', phone: '13800000006', level: 5, role: '普通学员', color: 'from-cyan-500 to-blue-500' },
  { name: '梦吟', phone: '13800000007', level: 6, role: '创意设计', color: 'from-pink-500 to-rose-500' },
  { name: '桑桑', phone: '13800000008', level: 3, role: '认真学习', color: 'from-violet-500 to-purple-500' },
  { name: '沐阳', phone: '13800000009', level: 4, role: '独立开发', color: 'from-orange-500 to-red-500' },
  { name: '君潇', phone: '13800000010', level: 8, role: '技术大牛', color: 'from-emerald-500 to-teal-500' }
];

export default function TestAccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const defaultPassword = 'test123456';

  const handleQuickLogin = async (phone: string, name: string) => {
    setLoading(phone);
    try {
      const result = await signIn('credentials', {
        phone,
        password: defaultPassword,
        redirect: false
      });

      if (result?.ok) {
        router.push('/courses');
      } else {
        alert('登录失败，请确保已运行种子脚本创建测试用户');
      }
    } catch (error) {
      console.error('登录错误:', error);
      alert('登录出错');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">测试账号快速登录</h1>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm">
            <Lock className="w-4 h-4" />
            统一密码：test123456
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            快速开始
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">点击账号卡片</p>
                <p className="text-sm text-gray-600">选择你想要登录的测试账号</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">自动登录</p>
                <p className="text-sm text-gray-600">系统会使用默认密码自动登录</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">开始聊天</p>
                <p className="text-sm text-gray-600">登录后可以和其他用户聊天</p>
              </div>
            </div>
          </div>
        </div>

        {/* 账号列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {testAccounts.map((account) => (
            <button
              key={account.phone}
              onClick={() => handleQuickLogin(account.phone, account.name)}
              disabled={loading !== null}
              className="relative group"
            >
              <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 ${
                loading === account.phone ? 'scale-95 opacity-75' : 'hover:scale-105'
              }`}>
                {/* 等级标签 */}
                <div className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                  Lv.{account.level}
                </div>

                {/* 头像 */}
                <div className={`w-16 h-16 bg-gradient-to-br ${account.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 mx-auto`}>
                  {account.name[0]}
                </div>

                {/* 信息 */}
                <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{account.role}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>{account.phone}</span>
                </div>

                {/* 加载状态 */}
                {loading === account.phone && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">聊天测试提示：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>亦仁、欢欢、雪雪三人已经互相关注</li>
                <li>登录后点击右下角聊天按钮开始对话</li>
                <li>支持同时打开多个聊天窗口</li>
                <li>如果遇到问题，请先运行 <code className="bg-blue-100 px-1 rounded">npm run seed:test</code> 创建测试用户</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}