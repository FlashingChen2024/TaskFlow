"use client";

import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import Column from "./Column";
import NewTaskModal from "./NewTaskModal";

export interface Task {
  id: string;
  title: string;
  status: string;
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

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    // 从数据库加载，按createdAt倒序
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
  };

  // 关键：onDragEnd 只更新前端 state，不保存顺序到后端！
  const onDragEnd = (result: DropResult) => {
    document.body.classList.remove("rfd-dragging");
    const { destination, source, draggableId } = result;

    // 没有目标位置，不做任何处理
    if (!destination) return;

    // 拖回原位置
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    // 跨列拖拽：更新 status（保存到后端）
    if (source.droppableId !== destination.droppableId) {
      // 先在本地更新
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        );
        // 把拖拽的任务放到目标列的最后
        const sourceTasks = updated.filter((t) => t.status === source.droppableId);
        const destTasks = updated.filter((t) => t.status === newStatus);
        const draggedTask = updated.find((t) => t.id === taskId)!;
        const otherTasks = updated.filter((t) => t.id !== taskId);

        // 重建目标列的顺序：拖拽的卡片在最后
        const newDestTasks = destTasks.filter((t) => t.id !== taskId);
        newDestTasks.push(draggedTask);

        return [
          ...otherTasks.filter((t) => t.status !== newStatus),
          ...sourceTasks,
          ...newDestTasks,
        ];
      });

      // 调用后端API更新status（注意：只更新status，不保存position！）
      fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } else {
      // 同列内拖拽：只更新前端 state，不调用后端！
      // 这就是 bug 所在：排序只在前端生效，刷新就恢复
      setTasks((prev) => {
        const columnTasks = prev.filter((t) => t.status === newStatus);
        const otherTasks = prev.filter((t) => t.status !== newStatus);

        const draggedIndex = columnTasks.findIndex((t) => t.id === taskId);
        const [draggedTask] = columnTasks.splice(draggedIndex, 1);
        columnTasks.splice(destination.index, 0, draggedTask);

        return [...otherTasks, ...columnTasks];
      });
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
    const newTask = await res.json();
    // 新任务加到对应列的最后
    setTasks((prev) => [...prev, newTask]);
    setModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
