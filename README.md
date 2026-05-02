<div align="center">

# 📋 TaskFlow

**一个简洁优雅的团队任务看板**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ 功能特性

| 功能 | 描述 | 状态 |
|------|------|------|
| 🏗️ 三列看板 | 待办 · 进行中 · 完成，一目了然 | ✅ |
| ➕ 快速创建 | 每列均可新建任务，弹窗输入即创建 | ✅ |
| 🎯 拖拽换列 | 卡片跨列拖拽，状态自动更新并持久化 | ✅ |
| 🔀 列内排序 | 同列内可上下拖拽调整顺序 | ✅ |
| 🗑️ 删除任务 | 悬停显示删除按钮，一键移除 | ✅ |
| 📱 响应式布局 | 桌面端三列，移动端单列自适应 | ✅ |

---

## 🛠️ 技术栈

```
Frontend  →  Next.js 14 + React 18 + TypeScript
样式      →  Tailwind CSS
拖拽      →  react-beautiful-dnd
后端      →  Next.js API Routes
数据库    →  SQLite (Prisma ORM)
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** 或 **yarn**

### 一键启动

```bash
# 克隆项目
git clone https://github.com/FlashingChen2024/TaskFlow.git
cd TaskFlow

# 一键启动（自动安装依赖、初始化数据库、填充示例数据）
bash start.sh
```

打开浏览器访问 👉 **http://localhost:3000**

### 手动启动

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 填充示例数据
npx tsx prisma/seed.ts

# 启动开发服务器
npm run dev
```

---

## 📁 项目结构

```
TaskFlow/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   └── seed.ts                # 示例数据种子
├── src/
│   ├── app/
│   │   ├── api/tasks/
│   │   │   ├── route.ts       # GET / POST 任务接口
│   │   │   └── [id]/route.ts  # PATCH / DELETE 任务接口
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/
│   │   ├── Board.tsx          # 看板主组件（拖拽逻辑）
│   │   ├── Column.tsx         # 列组件
│   │   └── NewTaskModal.tsx   # 新建任务弹窗
│   └── lib/
│       └── prisma.ts          # Prisma 客户端实例
├── next.config.js
├── start.sh                   # 一键启动脚本
└── package.json
```

---

## 🌐 部署指南

### 方式一：Vercel 部署（推荐）

> 最简单的方式，零配置部署

1. **Fork 本仓库** 到你的 GitHub 账号

2. 前往 [Vercel](https://vercel.com/) 并使用 GitHub 登录

3. 点击 **"Add New Project"** → 选择你 Fork 的 TaskFlow 仓库

4. 配置环境变量（如需更改数据库路径）：
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `file:./dev.db` |

5. 点击 **"Deploy"**，等待部署完成 🎉

> ⚠️ **注意**：Vercel 的 Serverless 环境中 SQLite 文件不持久化，生产环境建议切换为 PostgreSQL 或 MySQL。只需修改 `prisma/schema.prisma` 中的 `datasource` 配置即可。

### 方式二：Docker 部署

```bash
# 构建镜像
docker build -t taskflow .

# 运行容器
docker run -p 3000:3000 -v taskflow-data:/app/prisma taskflow
```

### 方式三：VPS / 自有服务器

```bash
# 克隆项目
git clone https://github.com/FlashingChen2024/TaskFlow.git
cd TaskFlow

# 安装依赖
npm install

# 初始化数据库
npx prisma db push
npx tsx prisma/seed.ts

# 构建生产版本
npm run build

# 使用 PM2 守护进程启动
npm install -g pm2
pm2 start npm --name "taskflow" -- start
```

### 切换到 PostgreSQL（生产推荐）

1. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. 设置环境变量：

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
```

3. 重新推送数据库：

```bash
npx prisma db push
```

---

## 🎮 使用说明

| 操作 | 方式 |
|------|------|
| 新建任务 | 点击列底部的 **"+ 新建任务"** 按钮 |
| 拖拽换列 | 拖动卡片到另一列，状态自动更新 |
| 列内排序 | 在同一列内上下拖动卡片调整顺序 |
| 删除任务 | 鼠标悬停卡片，点击右上角 **✕** |

---

## 📄 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/tasks` | 获取所有任务（按创建时间倒序） |
| `POST` | `/api/tasks` | 创建新任务 `{ title, status }` |
| `PATCH` | `/api/tasks/:id` | 更新任务状态 `{ status }` |
| `DELETE` | `/api/tasks/:id` | 删除任务 |

---

## 📝 License

MIT License © 2024 TaskFlow
