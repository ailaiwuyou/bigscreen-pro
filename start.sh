#!/bin/bash

echo "🚀 启动 BigScreen Pro..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p uploads

# 启动服务
echo "📦 正在构建和启动服务..."
docker-compose up --build -d

echo ""
echo "✅ 服务启动成功！"
echo ""
echo "📊 访问地址："
echo "   前端: http://localhost:8080"
echo "   后端 API: http://localhost:3000"
echo ""
echo "📋 常用命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""
echo "⏳ 等待数据库初始化完成..."
sleep 5

docker-compose ps