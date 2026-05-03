import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/tasks/[id] - 支持更新 status 和/或 position
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status, position } = body;

  if (status === undefined && position === undefined) {
    return NextResponse.json(
      { error: "必须提供 status 或 position 字段" },
      { status: 400 }
    );
  }

  const data: { status?: string; position?: number } = {};

  if (status !== undefined) {
    const validStatuses = ["todo", "inprogress", "done"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "无效的 status 值" },
        { status: 400 }
      );
    }
    data.status = status;
  }

  if (position !== undefined) {
    if (typeof position !== "number") {
      return NextResponse.json(
        { error: "position 必须是数字" },
        { status: 400 }
      );
    }
    data.position = position;
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
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
