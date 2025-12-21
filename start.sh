#!/bin/bash

echo "=========================================="
echo "  HackerNews 中文热议榜 - 启动脚本"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "backend/package.json" ]; then
    echo "❌ 错误: 请在项目根目录 (hackernews-cn) 运行此脚本"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "backend/node_modules" ]; then
    echo "📦 正在安装依赖..."
    cd backend
    npm install
    cd ..
    echo "✅ 依赖安装完成"
    echo ""
fi

# 启动后端服务器
echo "🚀 正在启动后端服务器..."
echo "   服务器地址: http://localhost:3000"
echo ""
echo "⏰ 提示:"
echo "   - 首次启动会自动抓取 HackerNews 数据（约需 2-3 分钟）"
echo "   - 请耐心等待数据抓取完成"
echo "   - 看到 \"首次数据抓取完成\" 后即可使用"
echo ""
echo "📱 打开前端页面:"
echo "   方法 1: 直接双击 frontend/index.html"
echo "   方法 2: 在浏览器访问 file:///$(pwd)/frontend/index.html"
echo ""
echo "🛑 停止服务器: 按 Ctrl+C"
echo ""
echo "=========================================="
echo ""

cd backend
npm start
