import type { Click } from "../types/click";

export interface BreakdownDatum {
  label: string;
  count: number;
}

/** Groups clicks by `key`, sorts descending, and folds anything past `topN` into "Otro". */
export function aggregateBy(
  clicks: Click[],
  key: (click: Click) => string | null,
  topN = 5
): BreakdownDatum[] {
  const counts = new Map<string, number>();
  for (const click of clicks) {
    const label = key(click) ?? "Desconocido";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length <= topN) {
    return sorted.map(([label, count]) => ({ label, count }));
  }

  const top = sorted.slice(0, topN).map(([label, count]) => ({ label, count }));
  const otherCount = sorted.slice(topN).reduce((sum, [, count]) => sum + count, 0);
  return [...top, { label: "Otro", count: otherCount }];
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Móvil",
  tablet: "Tablet",
  desktop: "Escritorio",
  other: "Otro dispositivo",
};

export function aggregateByDevice(clicks: Click[]): BreakdownDatum[] {
  return aggregateBy(clicks, (click) =>
    click.device_type ? (DEVICE_LABELS[click.device_type] ?? click.device_type) : null
  );
}

export interface DailyClicksDatum {
  date: string;
  count: number;
}

/** Buckets clicks by calendar day (UTC date), sorted chronologically. */
export function bucketByDay(clicks: Click[]): DailyClicksDatum[] {
  const counts = new Map<string, number>();
  for (const click of clicks) {
    const day = click.clicked_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
