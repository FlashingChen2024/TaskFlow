"use client";

import { Droppable, Draggable } from "react-beautiful-dnd";
import { Task } from "./Board";

interface ColumnProps {
  column: { id: string; title: string; color: string; border: string; badge: string };
  tasks: Task[];
  onAddTask: (status: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function Column({ column, tasks, onAddTask, onDeleteTask }: ColumnProps) {
  return (
    <div className={`rounded-xl border ${column.border} ${column.color} flex flex-col h-[calc(100vh-160px)]`}>
      {/* 列头 */}
      <div className="px-4 py-3 border-b border-gray-200/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.badge}`}></span>
          <h2 className="font-semibold text-gray-700">{column.title}</h2>
          <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          title="新建任务"
        >
          +
        </button>
      </div>

      {/* 任务列表（可拖拽区域） */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 space-y-2 transition-colors ${
              snapshot.isDraggingOver ? "bg-white/60" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 select-none
                      hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing
                      ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-300" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {task.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 
                          transition-all text-xs shrink-0 mt-0.5 p-1"
                        title="删除任务"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-300 text-sm">
                暂无任务
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* 底部新建按钮 */}
      <div className="p-3 border-t border-gray-200/50">
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-white/50 
            rounded-lg transition-colors border border-dashed border-gray-200 hover:border-gray-300"
        >
          + 新建任务
        </button>
      </div>
    </div>
  );
}
