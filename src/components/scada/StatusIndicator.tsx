import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusIndicatorProps {
  status: "normal" | "warning" | "critical" | "offline" | "running";
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
  label?: string;
}

const statusConfig = {
  normal: {
    color: "bg-status-normal",
    pulseClass: "status-pulse-normal",
    glow: "shadow-[0_0_8px_hsl(var(--status-normal)/0.6)]",
  },
  warning: {
    color: "bg-status-warning",
    pulseClass: "status-pulse-warning",
    glow: "shadow-[0_0_8px_hsl(var(--status-warning)/0.6)]",
  },
  critical: {
    color: "bg-status-critical",
    pulseClass: "status-pulse-critical",
    glow: "shadow-[0_0_12px_hsl(var(--status-critical)/0.8)]",
  },
  offline: {
    color: "bg-status-offline",
    pulseClass: "",
    glow: "",
  },
  running: {
    color: "bg-status-running",
    pulseClass: "status-pulse-normal",
    glow: "shadow-[0_0_8px_hsl(var(--status-running)/0.6)]",
  },
};

const sizeConfig = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function StatusIndicator({
  status,
  size = "md",
  showPulse = true,
  label,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "rounded-full",
          sizeConfig[size],
          config.color,
          config.glow,
          showPulse && config.pulseClass
        )}
      />
      {label && (
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}