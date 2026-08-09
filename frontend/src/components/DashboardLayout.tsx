import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const navItems = [
  { to: "/dashboard", label: "Resumen", end: true },
  { to: "/dashboard/links", label: "Mis links", end: false },
  { to: "/dashboard/create", label: "Crear link", end: false },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-60 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <span className="font-semibold">Acortador de URLs</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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

        <div className="px-3 py-4 border-t border-slate-800 space-y-2">
          <p className="px-3 text-xs text-slate-500 truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-900 transition-colors"
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
}
