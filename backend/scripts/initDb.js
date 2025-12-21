const DatabaseManager = require('../database');
const fs = require('fs');
const path = require('path');

// 确保 data 目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 创建 data 目录');
}

// 初始化数据库
console.log('正在初始化数据库...');
const db = new DatabaseManager();

console.log('✅ 数据库初始化完成！');
console.log(`   数据库位置: ${path.join(dataDir, 'hackernews.db')}`);

db.close();
