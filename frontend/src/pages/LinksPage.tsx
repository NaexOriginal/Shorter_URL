import { useEffect, useState } from "react";
import { LinkList } from "../components/LinkList";
import { useAuth } from "../context/useAuth";
import { fetchLinks } from "../lib/api";
import type { Link } from "../types/link";

export function LinksPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks(token!)
      .then(setLinks)
      .catch(() => setError("No se pudieron cargar tus links."))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Mis links</h1>
      {isLoading && <p className="text-slate-500 text-sm text-center py-10">Cargando...</p>}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {!isLoading && !error && <LinkList links={links} />}
    </div>
  );
}
