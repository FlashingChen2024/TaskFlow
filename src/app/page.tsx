import Board from "@/components/Board";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📋 TaskFlow 任务看板
        </h1>
        <Board />
      </div>
    </main>
  );
}
