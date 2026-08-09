import { useEffect, useState } from "react";
import { CreateLinkForm } from "../components/CreateLinkForm";
import { LinkList } from "../components/LinkList";
import { useAuth } from "../context/useAuth";
import { fetchLinks } from "../lib/api";
import type { Link } from "../types/link";

export function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks(token!)
      .then(setLinks)
      .catch(() => setError("No se pudieron cargar tus links."))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleCreated = (link: Link) => {
    setLinks((current) => [link, ...current]);
  };

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

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <CreateLinkForm onCreated={handleCreated} />

        {isLoading && <p className="text-slate-500 text-sm text-center py-10">Cargando...</p>}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {!isLoading && !error && <LinkList links={links} />}
      </main>
    </div>
  );
}
