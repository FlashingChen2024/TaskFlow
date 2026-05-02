#!/bin/bash
set -e

echo "🚀 TaskFlow 任务看板 - 一键启动"
echo "================================"

cd "$(dirname "$0")"

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 未检测到 Node.js，请先安装 Node.js (>=18)"
  exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
else
  echo "✅ 依赖已安装"
fi

# 初始化数据库
if [ ! -f "prisma/dev.db" ]; then
  echo "🗄️  初始化数据库..."
  npx prisma db push
  echo "🌱 填充示例数据..."
  npx tsx prisma/seed.ts
else
  echo "✅ 数据库已就绪"
fi

# 启动开发服务器
echo ""
echo "🎉 启动开发服务器..."
echo "📝 访问 http://localhost:3000"
echo ""
npm run dev
