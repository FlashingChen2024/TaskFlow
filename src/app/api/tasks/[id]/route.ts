import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/tasks/[id] - 只能更新status，不能更新position！
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json(
      { error: "必须提供status字段" },
      { status: 400 }
    );
  }

  const validStatuses = ["todo", "inprogress", "done"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "无效的status值" },
      { status: 400 }
    );
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(task);
}

// DELETE /api/tasks/[id] - 删除任务
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.task.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
