import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="h-14 border-b border-border flex items-center px-4">
        <span className="text-sm font-semibold tracking-tight">bangdori.kr admin</span>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
