import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings,
  Package,
  Bell,
  FileEdit,
} from "lucide-react";
import { AuditEntry } from "@/types/scada";
import { Badge } from "@/components/ui/badge";

interface AuditTrailPanelProps {
  entries: AuditEntry[];
  className?: string;
}

const targetIcons: Record<AuditEntry["targetType"], typeof User> = {
  alarm: Bell,
  batch: Package,
  equipment: Settings,
  recipe: FileText,
  change: FileEdit,
  user: User,
  system: Settings,
};

const actionColors: Record<string, string> = {
  "Alarm Acknowledged": "text-status-normal",
  "Alarm Generated": "text-status-warning",
  "Alarm Cleared": "text-muted-foreground",
  "Batch Started": "text-status-running",
  "Batch Completed": "text-status-normal",
  "Batch Aborted": "text-status-critical",
  "Batch Hold": "text-status-warning",
  "Change Approved": "text-status-normal",
  "Change Rejected": "text-status-critical",
  "Change Record Closed": "text-primary",
};

export function AuditTrailPanel({ entries, className }: AuditTrailPanelProps) {
  return (
    <div className={cn("scada-panel flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Audit Trail</h3>
          <span className="text-xs text-muted-foreground font-mono">
            {entries.length} entries
          </span>
        </div>
      </div>

      {/* Entries */}
      <ScrollArea className="flex-1 max-h-[350px]">
        <div className="divide-y divide-border/50">
          {entries.slice(0, 50).map((entry) => {
            const Icon = targetIcons[entry.targetType] || FileText;
            const actionColor = actionColors[entry.action] || "text-foreground";

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-muted/50 mt-0.5">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-sm font-medium", actionColor)}>
                        {entry.action}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {entry.targetName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{entry.userName}</span>
                      <span>•</span>
                      <span className="font-mono">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {(entry.oldValue || entry.newValue) && (
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        {entry.oldValue && (
                          <span className="text-muted-foreground line-through">
                            {entry.oldValue}
                          </span>
                        )}
                        {entry.oldValue && entry.newValue && (
                          <span className="text-muted-foreground">→</span>
                        )}
                        {entry.newValue && (
                          <span className="text-foreground">{entry.newValue}</span>
                        )}
                      </div>
                    )}
                    {entry.comment && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{entry.comment}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No audit entries</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
