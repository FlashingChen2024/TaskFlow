import "@/app/globals.css";

export const metadata = {
  title: "TaskFlow 任务看板",
  description: "团队任务管理看板",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
