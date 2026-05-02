import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.createMany({
    data: [
      { title: "设计数据库架构", status: "done" },
      { title: "搭建项目框架", status: "done" },
      { title: "实现看板页面", status: "inprogress" },
      { title: "实现拖拽功能", status: "inprogress" },
      { title: "编写API接口", status: "todo" },
      { title: "添加删除功能", status: "todo" },
      { title: "样式优化", status: "todo" },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
