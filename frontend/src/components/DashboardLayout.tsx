import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const navItems = [
  { to: "/dashboard", label: "Resumen", end: true },
  { to: "/dashboard/links", label: "Mis links", end: false },
  { to: "/dashboard/create", label: "Crear link", end: false },
  { to: "/dashboard/settings", label: "Ajustes", end: false },
];

const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4.5h14M2 9h14M2 13.5h14" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d={direction === "left" ? "M7.5 2.5L3.5 6l4 3.5" : "M4.5 2.5L8.5 6l-4 3.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
            `block rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap ${
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
        className="w-full rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-900 transition-colors whitespace-nowrap"
      >
        Salir
      </button>
    </div>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  );

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      {/* Mobile/tablet top bar */}
      <header className="lg:hidden flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg border border-slate-700 p-2 hover:bg-slate-900 transition-colors"
        >
          <HamburgerIcon />
        </button>
        <span className="font-semibold">Acortador de URLs</span>
      </header>

      {/* Mobile/tablet drawer (always mounted so the slide transition can run both ways) */}
      <div className="lg:hidden">
        <button
          aria-label="Cerrar menú"
          tabIndex={isMenuOpen ? 0 : -1}
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <aside
          className={`fixed left-0 top-0 z-50 h-full w-64 max-w-[80vw] bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <span className="font-semibold">Acortador de URLs</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
              className="rounded-lg p-1.5 hover:bg-slate-900 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
          <SidebarFooter email={user?.email} onLogout={logout} />
        </aside>
      </div>

      {/* Desktop sidebar, collapsible, pinned to the viewport while main scrolls */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:shrink-0">
        <aside
          className={`h-full border-slate-800 bg-slate-950 flex flex-col overflow-hidden transition-[width] duration-200 ease-in-out ${
            isCollapsed ? "w-0" : "w-60 border-r"
          }`}
        >
          <div className="w-60 h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800">
              <span className="font-semibold whitespace-nowrap">Acortador de URLs</span>
            </div>
            <SidebarNav />
            <SidebarFooter email={user?.email} onLogout={logout} />
          </div>
        </aside>
        <button
          onClick={() => setIsCollapsed((current) => !current)}
          aria-label={isCollapsed ? "Expandir menú" : "Retraer menú"}
          className="absolute top-4 -right-3 z-10 h-6 w-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <ChevronIcon direction={isCollapsed ? "right" : "left"} />
        </button>
      </div>

      <main className="flex-1 p-4 sm:p-6 xl:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
