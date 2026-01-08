import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusIndicator } from "./StatusIndicator";
import { LucideIcon, Settings, Zap, Timer, AlertTriangle } from "lucide-react";

interface EquipmentStatusProps {
  id: string;
  name: string;
  status: "normal" | "warning" | "critical" | "offline" | "running";
  icon: LucideIcon;
  metrics?: {
    label: string;
    value: string;
  }[];
  lastUpdate?: string;
  className?: string;
}

export function EquipmentStatus({
  id,
  name,
  status,
  icon: Icon,
  metrics = [],
  lastUpdate,
  className,
}: EquipmentStatusProps) {
  const borderColorClass = {
    normal: "border-status-normal/30 hover:border-status-normal/50",
    warning: "border-status-warning/30 hover:border-status-warning/50",
    critical: "border-status-critical/50 hover:border-status-critical/70",
    offline: "border-status-offline/30 hover:border-status-offline/50",
    running: "border-status-running/30 hover:border-status-running/50",
  };

  const bgColorClass = {
    normal: "bg-status-normal/5",
    warning: "bg-status-warning/5",
    critical: "bg-status-critical/10",
    offline: "bg-status-offline/5",
    running: "bg-status-running/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "scada-panel p-4 cursor-pointer transition-all duration-200",
        "border-l-2",
        borderColorClass[status],
        bgColorClass[status],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            status === "critical" ? "bg-status-critical/20" : "bg-secondary"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              status === "critical" ? "text-status-critical" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{name}</h3>
            <span className="text-xs font-mono text-muted-foreground">{id}</span>
          </div>
        </div>
        <StatusIndicator status={status} size="md" />
      </div>

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {metrics.map((metric, index) => (
            <div key={index} className="text-sm">
              <span className="text-muted-foreground text-xs">{metric.label}</span>
              <div className="font-mono text-foreground">{metric.value}</div>
            </div>
          ))}
        </div>
      )}

      {lastUpdate && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground font-mono">
            Last update: {lastUpdate}
          </span>
        </div>
      )}
    </motion.div>
  );
}