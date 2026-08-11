import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart";
import { ClicksOverTimeChart } from "../components/ClicksOverTimeChart";
import { useAuth } from "../context/useAuth";
import { useLinkClicksSocket } from "../hooks/useLinkClicksSocket";
import { fetchClicks, fetchLink } from "../lib/api";
import { aggregateBy, aggregateByDevice, bucketByDay } from "../lib/clicksAggregation";
import { BACKEND_ORIGIN } from "../lib/config";
import { formatNumber } from "../lib/format";
import type { Click, LinkClickEvent } from "../types/click";
import type { Link } from "../types/link";

export function LinkDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { token } = useAuth();
  const [link, setLink] = useState<Link | null>(null);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !token) return;
    setIsLoading(true);
    Promise.all([fetchLink(token, code), fetchClicks(token, code)])
      .then(([linkData, clicksData]) => {
        setLink(linkData);
        setClicks(clicksData);
      })
      .catch(() => setError("No se pudo cargar este link."))
      .finally(() => setIsLoading(false));
  }, [code, token]);

  const isLive = useLinkClicksSocket(code, token, (raw) => {
    try {
      const event = JSON.parse(raw) as LinkClickEvent;
      setClicks((current) => [
        {
          id: event.id,
          clicked_at: event.clicked_at,
          country: event.country,
          city: event.city,
          device_type: event.device_type,
          browser: event.browser,
          os: event.os,
        },
        ...current,
      ]);
      setLink((current) => (current ? { ...current, click_count: event.click_count } : current));
    } catch {
      // ignore malformed events
    }
  });

  const deviceData = useMemo(() => aggregateByDevice(clicks), [clicks]);
  const browserData = useMemo(
    () => aggregateBy(clicks, (click) => click.browser),
    [clicks]
  );
  const countryData = useMemo(
    () => aggregateBy(clicks, (click) => click.country),
    [clicks]
  );
  const timeSeriesData = useMemo(() => bucketByDay(clicks), [clicks]);

  if (isLoading) return <p className="text-slate-500 text-sm text-center py-10">Cargando...</p>;
  if (error || !link)
    return <p className="text-sm text-red-400 text-center py-10">{error ?? "Link no encontrado."}</p>;

  const shortUrl = `${BACKEND_ORIGIN}/${link.short_code}`;

  return (
    <div className="space-y-6">
      <RouterLink to="/dashboard/links" className="text-sm text-slate-400 hover:text-slate-200">
        ← Mis links
      </RouterLink>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium break-all"
            >
              {shortUrl}
            </a>
            <p className="text-slate-500 text-sm truncate mt-1" title={link.target_url}>
              {link.target_url}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-slate-600"}`}
              />
              {isLive ? "En vivo" : "Desconectado"}
            </span>
            <span className="text-2xl font-semibold text-slate-100">
              {formatNumber(link.click_count)}
            </span>
            <span className="text-sm text-slate-400">clics</span>
          </div>
        </div>
      </div>

      {clicks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center py-16">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-700"
          >
            <path
              d="M12 3v4m0 10v4m9-9h-4M7 12H3m14.36-6.36-2.83 2.83M9.47 14.53l-2.83 2.83m0-10.72 2.83 2.83m7.06 7.06 2.83 2.83"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-slate-500 text-sm">
            Todavía no hay clics para este link. Compartilo para empezar a ver datos.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
            <h2 className="text-sm font-medium text-slate-300 mb-4">Clics por día</h2>
            <ClicksOverTimeChart data={timeSeriesData} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
              <h2 className="text-sm font-medium text-slate-300 mb-4">Dispositivo</h2>
              <CategoryBreakdownChart data={deviceData} />
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5">
              <h2 className="text-sm font-medium text-slate-300 mb-4">Navegador</h2>
              <CategoryBreakdownChart data={browserData} />
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a19] p-4 sm:p-5 sm:col-span-2">
              <h2 className="text-sm font-medium text-slate-300 mb-4">País</h2>
              <CategoryBreakdownChart data={countryData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
