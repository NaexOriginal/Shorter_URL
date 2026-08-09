import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ClicksOverTimeChart } from "../components/ClicksOverTimeChart";
import { RecentActivityFeed } from "../components/RecentActivityFeed";
import { StatTile } from "../components/StatTile";
import { TopLinksChart } from "../components/TopLinksChart";
import { useAuth } from "../context/useAuth";
import { useMyClicksSocket } from "../hooks/useMyClicksSocket";
import { fetchAnalyticsOverview, fetchLinks } from "../lib/api";
import { formatNumber } from "../lib/format";
import type { AnalyticsOverview } from "../types/analytics";
import type { Link } from "../types/link";

export function OverviewPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    const [linksData, overviewData] = await Promise.all([
      fetchLinks(token),
      fetchAnalyticsOverview(token),
    ]);
    setLinks(linksData);
    setOverview(overviewData);
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    loadAll()
      .catch(() => setError("No se pudo cargar el resumen."))
      .finally(() => setIsLoading(false));
  }, [loadAll]);

  // A click anywhere among the user's links landed: the server is the
  // source of truth for every aggregate here, so just refetch everything
  // rather than trying to patch totals/rankings incrementally client-side.
  const isLive = useMyClicksSocket(token, () => {
    loadAll().catch(() => {
      /* keep showing the last good snapshot if a live refresh fails */
    });
  });

  const totalClicks = useMemo(
    () => links.reduce((sum, link) => sum + link.click_count, 0),
    [links]
  );
  const topLinks = useMemo(
    () => [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 8),
    [links]
  );

  if (isLoading) return <p className="text-slate-500 text-sm text-center py-10">Cargando...</p>;
  if (error || !overview)
    return <p className="text-sm text-red-400 text-center py-10">{error ?? "Error"}</p>;

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
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 flex-1">
          <StatTile label="Links creados" value={formatNumber(links.length)} />
          <StatTile label="Clics totales" value={formatNumber(totalClicks)} />
          <StatTile
            label="Link más popular (30d)"
            value={overview.top_link ? `/${overview.top_link.short_code}` : "—"}
          />
          <StatTile
            label="País principal (30d)"
            value={overview.top_country ? overview.top_country.country : "—"}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-300">Clics en los últimos 30 días</h2>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-slate-600"}`}
            />
            {isLive ? "En vivo" : "Desconectado"}
          </span>
        </div>
        {overview.clicks_by_day.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">
            Sin clics en los últimos 30 días.
          </p>
        ) : (
          <ClicksOverTimeChart data={overview.clicks_by_day} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Links con más clics</h2>
          <TopLinksChart data={topLinks} />
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-2">Actividad reciente</h2>
          <RecentActivityFeed items={overview.recent_clicks} />
        </div>
      </div>
    </div>
  );
}
