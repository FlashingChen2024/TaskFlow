"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import Column from "./Column";
import NewTaskModal from "./NewTaskModal";

export interface Task {
  id: string;
  title: string;
  status: string;
  position: number;
  createdAt: string;
}

const COLUMNS = [
  { id: "todo", title: "待办", color: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-500" },
  { id: "inprogress", title: "进行中", color: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500" },
  { id: "done", title: "完成", color: "bg-green-50", border: "border-green-200", badge: "bg-green-500" },
];

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("todo");
  const tasksBeforeDrag = useRef<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    // 兼容：migrate 后旧数据 position 全为 0，按 createdAt 倒序保底
    if (data.length > 0 && data.every((t: Task) => t.position === 0)) {
      data.sort(
        (a: Task, b: Task) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const onDragStart = () => {
    document.body.classList.add("rfd-dragging");
    tasksBeforeDrag.current = [...tasks];
  };

  // 拖拽结束后计算各列 position 并批量 PATCH
  const onDragEnd = async (result: DropResult) => {
    document.body.classList.remove("rfd-dragging");
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // ── 1. 乐观更新本地 state ──
    let nextTasks: Task[];

    if (source.droppableId !== destination.droppableId) {
      // 跨列：先改 status，再插到目标列的 destination.index
      nextTasks = tasks.map((t) =>
        t.id === draggableId ? { ...t, status: destination.droppableId } : t
      );
      const destCol = nextTasks.filter((t) => t.status === destination.droppableId);
      const otherCols = nextTasks.filter((t) => t.status !== destination.droppableId);
      const moved = destCol.find((t) => t.id === draggableId)!;
      const destOthers = destCol.filter((t) => t.id !== draggableId);
      destOthers.splice(destination.index, 0, moved);
      nextTasks = [...otherCols, ...destOthers];
    } else {
      // 同列：reorder
      const col = tasks.filter((t) => t.status === source.droppableId);
      const other = tasks.filter((t) => t.status !== source.droppableId);
      const idx = col.findIndex((t) => t.id === draggableId);
      const [moved] = col.splice(idx, 1);
      col.splice(destination.index, 0, moved);
      nextTasks = [...other, ...col];
    }

    setTasks(nextTasks);

    // ── 2. 计算需要 PATCH 的变更 ──
    const byStatus: Record<string, Task[]> = {};
    for (const t of nextTasks) {
      if (!byStatus[t.status]) byStatus[t.status] = [];
      byStatus[t.status].push(t);
    }

    const patches: { id: string; body: { status?: string; position: number } }[] = [];
    for (const status of Object.keys(byStatus)) {
      const col = byStatus[status];
      for (let i = 0; i < col.length; i++) {
        const task = col[i];
        const isMoved = task.id === draggableId;
        const needStatus = isMoved && source.droppableId !== destination.droppableId;
        if (task.position !== i || needStatus) {
          patches.push({
            id: task.id,
            body: {
              ...(needStatus ? { status: destination.droppableId } : {}),
              position: i,
            },
          });
        }
      }
    }

    if (patches.length === 0) return;

    // ── 3. 批量 PATCH，任一失败则回滚 ──
    try {
      const results = await Promise.all(
        patches.map((p) =>
          fetch(`/api/tasks/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p.body),
          })
        )
      );

      if (!results.every((r) => r.ok)) {
        throw new Error("Some PATCH requests failed");
      }
    } catch (err) {
      setTasks(tasksBeforeDrag.current);
      console.error("保存排序失败，已自动回滚", err);
      // MVP 阶段先用 console.error，后续可接入 toast
    }
  };

  const handleAddTask = (status: string) => {
    setModalStatus(status);
    setModalOpen(true);
  };

  const handleCreateTask = async (title: string) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: modalStatus }),
    });
    if (!res.ok) {
      console.error("创建任务失败");
      return;
    }
    // 创建成功后重新拉取整列表，保证顺序一致
    await fetchTasks();
    setModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("删除任务失败");
      return;
    }
    // 删除后重新拉取，避免 position 出现空洞
    await fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={getTasksByStatus(col.id)}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTask}
        columnTitle={COLUMNS.find((c) => c.id === modalStatus)?.title || ""}
      />
    </>
  );
}
