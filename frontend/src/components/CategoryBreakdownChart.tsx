import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { useCategoryColorMap } from "../hooks/useCategoryColorMap";
import { formatNumber } from "../lib/format";
import type { BreakdownDatum } from "../lib/clicksAggregation";

const GRIDLINE = "#2c2c2a";
const AXIS_LINE = "#383835";
const MUTED_INK = "#898781";
const SECONDARY_INK = "#c3c2b7";

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a19] px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-300">{label}</p>
      <p className="font-medium text-slate-100">
        {formatNumber(Number(payload[0].value ?? 0))} clics
      </p>
    </div>
  );
}

export function CategoryBreakdownChart({ data }: { data: BreakdownDatum[] }) {
  const colorMap = useCategoryColorMap(data.map((d) => d.label));

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 100)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke={GRIDLINE} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: MUTED_INK, fontSize: 12 }}
          axisLine={{ stroke: AXIS_LINE }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: SECONDARY_INK, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={ChartTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={colorMap.get(entry.label)} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            fill={SECONDARY_INK}
            fontSize={12}
            formatter={(label: number | string | boolean | null | undefined) =>
              typeof label === "number" ? formatNumber(label) : label
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
