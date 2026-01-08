import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Package, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";

interface ProductionStatsProps {
  totalUnits: number;
  goodUnits: number;
  rejectedUnits: number;
  targetUnits: number;
  oee: number;
  cycleTime: number;
  className?: string;
}

export function ProductionStats({
  totalUnits,
  goodUnits,
  rejectedUnits,
  targetUnits,
  oee,
  cycleTime,
  className,
}: ProductionStatsProps) {
  const progressPercentage = (totalUnits / targetUnits) * 100;
  const yieldPercentage = totalUnits > 0 ? (goodUnits / totalUnits) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("scada-panel p-4", className)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Production Statistics</h3>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono mb-1">
          <span className="text-muted-foreground">Progress to Target</span>
          <span className="text-foreground">{totalUnits.toLocaleString()} / {targetUnits.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              progressPercentage >= 100 ? "bg-status-normal" : "bg-primary"
            )}
          />
        </div>
        <div className="text-xs font-mono text-right mt-1">
          <span className={cn(
            progressPercentage >= 100 ? "text-status-normal" : "text-primary"
          )}>
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-3 h-3 text-status-normal" />
            <span className="text-xs text-muted-foreground">Good Units</span>
          </div>
          <div className="text-xl font-mono font-bold text-status-normal glow-text-green">
            {goodUnits.toLocaleString()}
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-3 h-3 text-status-critical" />
            <span className="text-xs text-muted-foreground">Rejected</span>
          </div>
          <div className="text-xl font-mono font-bold text-status-critical">
            {rejectedUnits.toLocaleString()}
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-status-info" />
            <span className="text-xs text-muted-foreground">OEE</span>
          </div>
          <div className={cn(
            "text-xl font-mono font-bold",
            oee >= 85 ? "text-status-normal glow-text-green" : 
            oee >= 70 ? "text-status-warning glow-text-amber" : 
            "text-status-critical glow-text-red"
          )}>
            {oee.toFixed(1)}%
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cycle Time</span>
          </div>
          <div className="text-xl font-mono font-bold text-foreground">
            {cycleTime.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Yield indicator */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">First Pass Yield</span>
          <span className={cn(
            "text-sm font-mono font-bold",
            yieldPercentage >= 98 ? "text-status-normal" :
            yieldPercentage >= 95 ? "text-status-warning" :
            "text-status-critical"
          )}>
            {yieldPercentage.toFixed(2)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}