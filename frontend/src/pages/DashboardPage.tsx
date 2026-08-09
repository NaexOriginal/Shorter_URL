import { useAuth } from "../context/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold">Acortador de URLs</span>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{user?.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="p-6 text-slate-400">Dashboard en construcción.</main>
    </div>
  );
}
