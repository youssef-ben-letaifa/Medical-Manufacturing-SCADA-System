import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, X, Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alarm {
  id: string;
  timestamp: string;
  priority: "critical" | "high" | "medium" | "low";
  source: string;
  message: string;
  acknowledged: boolean;
}

interface AlarmPanelProps {
  alarms: Alarm[];
  onAcknowledge?: (id: string) => void;
  onAcknowledgeAll?: () => void;
  className?: string;
}

const priorityConfig = {
  critical: {
    icon: AlertCircle,
    bgColor: "bg-status-critical/10",
    borderColor: "border-l-status-critical",
    textColor: "text-status-critical",
    pulseClass: "status-pulse-critical",
  },
  high: {
    icon: AlertTriangle,
    bgColor: "bg-status-warning/10",
    borderColor: "border-l-status-warning",
    textColor: "text-status-warning",
    pulseClass: "status-pulse-warning",
  },
  medium: {
    icon: AlertTriangle,
    bgColor: "bg-status-info/10",
    borderColor: "border-l-status-info",
    textColor: "text-status-info",
    pulseClass: "",
  },
  low: {
    icon: Info,
    bgColor: "bg-muted/50",
    borderColor: "border-l-muted-foreground",
    textColor: "text-muted-foreground",
    pulseClass: "",
  },
};

export function AlarmPanel({
  alarms,
  onAcknowledge,
  onAcknowledgeAll,
  className,
}: AlarmPanelProps) {
  const activeAlarms = alarms.filter((a) => !a.acknowledged);
  const criticalCount = alarms.filter((a) => a.priority === "critical" && !a.acknowledged).length;
  const highCount = alarms.filter((a) => a.priority === "high" && !a.acknowledged).length;

  return (
    <div className={cn("scada-panel flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            criticalCount > 0 ? "bg-status-critical/20" : "bg-secondary"
          )}>
            <Bell className={cn(
              "w-4 h-4",
              criticalCount > 0 ? "text-status-critical status-pulse-critical" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Active Alarms</h3>
            <div className="flex items-center gap-2 text-xs">
              {criticalCount > 0 && (
                <span className="text-status-critical font-mono">{criticalCount} CRIT</span>
              )}
              {highCount > 0 && (
                <span className="text-status-warning font-mono">{highCount} HIGH</span>
              )}
              <span className="text-muted-foreground font-mono">{activeAlarms.length} total</span>
            </div>
          </div>
        </div>
        {activeAlarms.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAcknowledgeAll}
            className="text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            ACK ALL
          </Button>
        )}
      </div>

      {/* Alarm List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {alarms.map((alarm) => {
            const config = priorityConfig[alarm.priority];
            const Icon = config.icon;

            return (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "p-3 border-b border-border/50 border-l-2 transition-all",
                  config.bgColor,
                  config.borderColor,
                  alarm.acknowledged && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 mt-0.5 flex-shrink-0",
                      config.textColor,
                      !alarm.acknowledged && config.pulseClass
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {alarm.timestamp}
                      </span>
                      <span className={cn(
                        "text-xs font-mono uppercase px-1.5 py-0.5 rounded",
                        config.bgColor,
                        config.textColor
                      )}>
                        {alarm.priority}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">
                      {alarm.source}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {alarm.message}
                    </div>
                  </div>
                  {!alarm.acknowledged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAcknowledge?.(alarm.id)}
                      className="h-6 w-6 p-0 hover:bg-status-normal/20"
                    >
                      <Check className="w-3 h-3 text-status-normal" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {alarms.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alarms</p>
          </div>
        )}
      </div>
    </div>
  );
}