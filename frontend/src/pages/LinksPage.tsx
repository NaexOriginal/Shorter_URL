import { useEffect, useMemo, useState } from "react";
import { LinkList } from "../components/LinkList";
import { useAuth } from "../context/useAuth";
import { fetchLinks } from "../lib/api";
import type { Link } from "../types/link";

export function LinksPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLinks(token!)
      .then(setLinks)
      .catch(() => setError("No se pudieron cargar tus links."))
      .finally(() => setIsLoading(false));
  }, [token]);

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return links;
    return links.filter(
      (link) =>
        link.short_code.toLowerCase().includes(query) ||
        link.target_url.toLowerCase().includes(query)
    );
  }, [links, search]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Mis links</h1>

      {!isLoading && !error && links.length > 0 && (
        <input
          type="text"
          placeholder="Buscar por alias o URL destino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {isLoading && <p className="text-slate-500 text-sm text-center py-10">Cargando...</p>}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {!isLoading && !error && links.length > 0 && filteredLinks.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-10">
          No encontramos links que coincidan con "{search}".
        </p>
      )}
      {!isLoading && !error && (links.length === 0 || filteredLinks.length > 0) && (
        <LinkList links={filteredLinks} />
      )}
    </div>
  );
}
