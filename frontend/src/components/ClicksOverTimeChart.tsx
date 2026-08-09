import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatNumber } from "../lib/format";
import type { DailyClicksDatum } from "../lib/clicksAggregation";

const SEQUENTIAL_BLUE = "#3987e5";
const GRIDLINE = "#2c2c2a";
const AXIS_LINE = "#383835";
const MUTED_INK = "#898781";

function formatDayLabel(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a19] px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-300">{formatDayLabel(String(label))}</p>
      <p className="font-medium text-slate-100">
        {formatNumber(Number(payload[0].value ?? 0))} clics
      </p>
    </div>
  );
}

export function ClicksOverTimeChart({ data }: { data: DailyClicksDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke={GRIDLINE} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayLabel}
          tick={{ fill: MUTED_INK, fontSize: 12 }}
          axisLine={{ stroke: AXIS_LINE }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: MUTED_INK, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={ChartTooltip} cursor={{ stroke: AXIS_LINE }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={SEQUENTIAL_BLUE}
          strokeWidth={2}
          fill={SEQUENTIAL_BLUE}
          fillOpacity={0.1}
          dot={{ r: 4, fill: SEQUENTIAL_BLUE, stroke: "#1a1a19", strokeWidth: 2 }}
          activeDot={{ r: 5, fill: SEQUENTIAL_BLUE, stroke: "#1a1a19", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
