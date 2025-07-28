const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📥 开始同步数据库...\n');

// 配置
const REMOTE_DB = 'postgresql://guasi:Scys-0418@111.231.19.162:5432/deepsea';
const LOCAL_DB = 'postgresql://postgres:postgres@localhost:5432/deepsea_dev';
const BACKUP_FILE = path.join(__dirname, '../data/deepsea-backup.sql');

// 步骤1：从远程数据库导出
console.log('1️⃣ 从服务器导出数据...');
const dumpCommand = `pg_dump "${REMOTE_DB}" > "${BACKUP_FILE}"`;

exec(dumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 导出失败:', error.message);
    console.log('\n💡 解决方案：');
    console.log('1. 安装 PostgreSQL 客户端工具：');
    console.log('   Mac: brew install postgresql');
    console.log('   Windows: 下载 PostgreSQL');
    console.log('2. 或者使用 Docker 方案（见文档）');
    return;
  }

  console.log('✅ 数据导出成功');
  console.log(`📦 备份文件：${BACKUP_FILE}`);
  
  // 步骤2：导入到本地数据库
  console.log('\n2️⃣ 导入到本地数据库...');
  console.log('⚠️  请确保本地PostgreSQL正在运行');
  console.log('   如果没有本地数据库，运行：');
  console.log('   createdb deepsea_dev');
  
  const importCommand = `psql "${LOCAL_DB}" < "${BACKUP_FILE}"`;
  
  exec(importCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ 导入失败:', error.message);
      return;
    }
    
    console.log('✅ 数据导入成功！');
    console.log('\n🎉 同步完成！');
    console.log('📌 现在修改 .env.local：');
    console.log('   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deepsea_dev"');
  });
});