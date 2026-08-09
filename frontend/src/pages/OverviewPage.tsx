import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { StatTile } from "../components/StatTile";
import { TopLinksChart } from "../components/TopLinksChart";
import { useAuth } from "../context/useAuth";
import { fetchLinks } from "../lib/api";
import { formatNumber } from "../lib/format";
import type { Link } from "../types/link";

export function OverviewPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks(token!)
      .then(setLinks)
      .catch(() => setError("No se pudo cargar el resumen."))
      .finally(() => setIsLoading(false));
  }, [token]);

  const totalClicks = useMemo(
    () => links.reduce((sum, link) => sum + link.click_count, 0),
    [links]
  );
  const topLinks = useMemo(
    () => [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 8),
    [links]
  );

  if (isLoading) return <p className="text-slate-500 text-sm text-center py-10">Cargando...</p>;
  if (error) return <p className="text-sm text-red-400 text-center py-10">{error}</p>;

  if (links.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">Todavía no tenés links.</p>
        <RouterLink
          to="/dashboard/create"
          className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          Creá el primero →
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile label="Links creados" value={formatNumber(links.length)} />
        <StatTile label="Clics totales" value={formatNumber(totalClicks)} />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">Links con más clics</h2>
        <TopLinksChart data={topLinks} />
      </div>
    </div>
  );
}
