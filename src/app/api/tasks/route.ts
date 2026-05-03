import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/tasks - 获取所有任务，按创建时间倒序
export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

// POST /api/tasks - 创建新任务
export async function POST(request: Request) {
  const body = await request.json();
  const { title, status } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      status: status || "todo",
    },
  });

  return NextResponse.json(task, { status: 201 });
}
