"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MoodChartPoint } from "@/lib/dashboard";

type MoodChartProps = {
  data: MoodChartPoint[];
};

type TooltipPayload = {
  payload: MoodChartPoint;
};

function MoodTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{point.date}</p>
      <p className="text-muted-foreground">
        {point.avgMood === null
          ? "Belum ada entry"
          : `Rata-rata mood ${point.avgMood.toFixed(1)}`}
      </p>
      <p className="text-muted-foreground">{point.entries} entry</p>
    </div>
  );
}

export function MoodChart({ data }: MoodChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart
          data={data}
          margin={{ bottom: 0, left: -18, right: 8, top: 12 }}
        >
          <defs>
            <linearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            allowDecimals={false}
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip content={<MoodTooltip />} />
          <Area
            type="monotone"
            dataKey="avgMood"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#moodFill)"
            connectNulls={false}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
