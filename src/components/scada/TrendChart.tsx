import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";

interface DataPoint {
  time: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  label: string;
  unit?: string;
  color?: "primary" | "secondary" | "tertiary" | "quaternary";
  showArea?: boolean;
  limits?: {
    high?: number;
    low?: number;
    highHigh?: number;
    lowLow?: number;
  };
  className?: string;
}

const colorConfig = {
  primary: {
    stroke: "hsl(var(--data-primary))",
    fill: "hsl(var(--data-primary) / 0.2)",
  },
  secondary: {
    stroke: "hsl(var(--data-secondary))",
    fill: "hsl(var(--data-secondary) / 0.2)",
  },
  tertiary: {
    stroke: "hsl(var(--data-tertiary))",
    fill: "hsl(var(--data-tertiary) / 0.2)",
  },
  quaternary: {
    stroke: "hsl(var(--data-quaternary))",
    fill: "hsl(var(--data-quaternary) / 0.2)",
  },
};

export function TrendChart({
  data,
  label,
  unit = "",
  color = "primary",
  showArea = true,
  limits,
  className,
}: TrendChartProps) {
  const colors = colorConfig[color];
  const latestValue = data[data.length - 1]?.value ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("metric-card", className)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-mono font-bold text-primary glow-text-cyan">
            {latestValue.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-muted-foreground">{unit}</span>
        </div>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              width={30}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            
            {/* Limit lines */}
            {limits?.highHigh && (
              <ReferenceLine
                y={limits.highHigh}
                stroke="hsl(var(--status-critical))"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}
            {limits?.high && (
              <ReferenceLine
                y={limits.high}
                stroke="hsl(var(--status-warning))"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}
            {limits?.low && (
              <ReferenceLine
                y={limits.low}
                stroke="hsl(var(--status-warning))"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}
            {limits?.lowLow && (
              <ReferenceLine
                y={limits.lowLow}
                stroke="hsl(var(--status-critical))"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}

            {showArea && (
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#gradient-${color})`}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: colors.stroke }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}