import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusIndicator } from "./StatusIndicator";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: "normal" | "warning" | "critical" | "offline" | "running";
  icon?: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  status = "normal",
  icon: Icon,
  trend,
  trendValue,
  className,
}: MetricCardProps) {
  const statusGlowClass = {
    normal: "glow-text-green",
    warning: "glow-text-amber",
    critical: "glow-text-red",
    offline: "",
    running: "glow-text-cyan",
  };

  const statusTextClass = {
    normal: "text-status-normal",
    warning: "text-status-warning",
    critical: "text-status-critical",
    offline: "text-status-offline",
    running: "text-status-running",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("metric-card", className)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        <StatusIndicator status={status} size="sm" />
      </div>
      
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-3xl font-mono font-bold",
            statusTextClass[status],
            statusGlowClass[status]
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      {trend && trendValue && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-mono",
              trend === "up" && "text-status-normal",
              trend === "down" && "text-status-critical",
              trend === "stable" && "text-muted-foreground"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "stable" && "→"}
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
}