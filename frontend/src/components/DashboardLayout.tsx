import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const navItems = [
  { to: "/dashboard", label: "Resumen", end: true },
  { to: "/dashboard/links", label: "Mis links", end: false },
  { to: "/dashboard/create", label: "Crear link", end: false },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-indigo-600/15 text-indigo-300"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ email, onLogout }: { email?: string; onLogout: () => void }) {
  return (
    <div className="px-3 py-4 border-t border-slate-800 space-y-2">
      <p className="px-3 text-xs text-slate-500 truncate">{email}</p>
      <button
        onClick={onLogout}
        className="w-full rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-900 transition-colors"
      >
        Salir
      </button>
    </div>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      {/* Mobile/tablet top bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <span className="font-semibold">Acortador de URLs</span>
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg border border-slate-700 p-2 hover:bg-slate-900 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Mobile/tablet drawer */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 max-w-[80vw] bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <span className="font-semibold">Acortador de URLs</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-1.5 hover:bg-slate-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
            <SidebarFooter email={user?.email} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 border-r border-slate-800 flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <span className="font-semibold">Acortador de URLs</span>
        </div>
        <SidebarNav />
        <SidebarFooter email={user?.email} onLogout={logout} />
      </aside>

      <main className="flex-1 p-4 sm:p-6 xl:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
