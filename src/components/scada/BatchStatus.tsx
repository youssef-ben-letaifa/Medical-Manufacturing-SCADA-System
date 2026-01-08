import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BatchInfo {
  batchNumber: string;
  productName: string;
  recipe: string;
  status: "running" | "complete" | "holding" | "idle";
  currentPhase: string;
  progress: number;
  startTime: string;
  operator: string;
}

interface BatchStatusProps {
  batch: BatchInfo;
  className?: string;
}

export function BatchStatus({ batch, className }: BatchStatusProps) {
  const statusConfig = {
    running: {
      color: "text-status-running",
      bg: "bg-status-running/10",
      border: "border-status-running/30",
      label: "RUNNING",
    },
    complete: {
      color: "text-status-normal",
      bg: "bg-status-normal/10",
      border: "border-status-normal/30",
      label: "COMPLETE",
    },
    holding: {
      color: "text-status-warning",
      bg: "bg-status-warning/10",
      border: "border-status-warning/30",
      label: "HOLDING",
    },
    idle: {
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      border: "border-muted",
      label: "IDLE",
    },
  };

  const config = statusConfig[batch.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("scada-panel p-4", className)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-mono font-bold text-foreground">
              {batch.batchNumber}
            </h3>
            <span className={cn(
              "px-2 py-0.5 text-xs font-mono uppercase rounded",
              config.bg,
              config.color
            )}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{batch.productName}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Recipe</span>
            <div className="font-mono text-foreground">{batch.recipe}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Current Phase</span>
            <div className="font-mono text-primary">{batch.currentPhase}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Start Time</span>
            <div className="font-mono text-foreground">{batch.startTime}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Operator</span>
            <div className="font-mono text-foreground">{batch.operator}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-muted-foreground">Batch Progress</span>
            <span className={config.color}>{batch.progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${batch.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                batch.status === "running" && "bg-status-running animate-pulse-glow",
                batch.status === "complete" && "bg-status-normal",
                batch.status === "holding" && "bg-status-warning",
                batch.status === "idle" && "bg-muted-foreground"
              )}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}