"use client";

import { useState } from "react";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  columnTitle: string;
}

export default function NewTaskModal({
  open,
  onClose,
  onCreate,
  columnTitle,
}: NewTaskModalProps) {
  const [title, setTitle] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          在「{columnTitle}」新建任务
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入任务标题..."
            autoFocus
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              placeholder:text-gray-300"
          />
          <div className="flex gap-3 mt-4 justify-end">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                onClose();
              }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 
                hover:bg-gray-50 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 
                disabled:bg-gray-200 disabled:text-gray-400 rounded-lg transition-colors"
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
