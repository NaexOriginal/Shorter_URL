import type { RecentClickItem } from "../types/analytics";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatRelativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (Math.abs(diffMinutes) < 60) return relativeTimeFormatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeTimeFormatter.format(diffHours, "hour");
  return relativeTimeFormatter.format(Math.round(diffHours / 24), "day");
}

export function RecentActivityFeed({ items }: { items: RecentClickItem[] }) {
  if (items.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">Todavía no hay actividad.</p>;
  }

  return (
    <ul className="divide-y divide-slate-800">
      {items.map((item) => (
        <li key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-300 truncate">
            Link <span className="text-indigo-400 font-medium">/{item.short_code}</span>{" "}
            clickeado desde{" "}
            <span className="text-slate-100">{item.country ?? "ubicación desconocida"}</span>
          </span>
          <span className="text-slate-500 text-xs shrink-0">
            {formatRelativeTime(item.clicked_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
