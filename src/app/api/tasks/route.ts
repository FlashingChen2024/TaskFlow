import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/tasks - 获取所有任务，按 position 升序
export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(tasks);
}

// POST /api/tasks - 创建新任务，position 默认为该列最大 + 1
export async function POST(request: Request) {
  const body = await request.json();
  const { title, status } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const targetStatus = status || "todo";

  // 查询该列当前最大 position
  const lastTask = await prisma.task.findFirst({
    where: { status: targetStatus },
    orderBy: { position: "desc" },
  });
  const nextPosition = (lastTask?.position ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      status: targetStatus,
      position: nextPosition,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
