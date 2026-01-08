import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Bell,
  Clock,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alarm, AlarmState, AlarmPriority } from "@/types/scada";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnhancedAlarmPanelProps {
  alarms: Alarm[];
  onAcknowledge: (id: string, comment?: string) => void;
  onAcknowledgeAll: () => void;
  onShelve: (id: string, duration: number, reason: string) => void;
  onClear: (id: string) => void;
  className?: string;
}

const priorityConfig: Record<AlarmPriority, {
  icon: typeof AlertCircle;
  bgColor: string;
  borderColor: string;
  textColor: string;
  pulseClass: string;
}> = {
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

const stateLabels: Record<AlarmState, string> = {
  active: "ACTIVE",
  acknowledged: "ACK",
  cleared: "CLEARED",
  shelved: "SHELVED",
};

export function EnhancedAlarmPanel({
  alarms,
  onAcknowledge,
  onAcknowledgeAll,
  onShelve,
  onClear,
  className,
}: EnhancedAlarmPanelProps) {
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [showAckDialog, setShowAckDialog] = useState(false);
  const [showShelveDialog, setShowShelveDialog] = useState(false);
  const [ackComment, setAckComment] = useState("");
  const [shelveReason, setShelveReason] = useState("");
  const [shelveDuration, setShelveDuration] = useState("30");

  const activeAlarms = alarms.filter((a) => a.state === "active");
  const acknowledgedAlarms = alarms.filter((a) => a.state === "acknowledged");
  const criticalCount = activeAlarms.filter((a) => a.priority === "critical").length;
  const highCount = activeAlarms.filter((a) => a.priority === "high").length;

  const handleAcknowledge = () => {
    if (selectedAlarm) {
      onAcknowledge(selectedAlarm.id, ackComment || undefined);
      setAckComment("");
      setShowAckDialog(false);
      setSelectedAlarm(null);
    }
  };

  const handleShelve = () => {
    if (selectedAlarm && shelveReason) {
      onShelve(selectedAlarm.id, parseInt(shelveDuration), shelveReason);
      setShelveReason("");
      setShelveDuration("30");
      setShowShelveDialog(false);
      setSelectedAlarm(null);
    }
  };

  const displayAlarms = [...activeAlarms, ...acknowledgedAlarms].slice(0, 15);

  return (
    <>
      <div className={cn("scada-panel flex flex-col h-full", className)}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                criticalCount > 0 ? "bg-status-critical/20" : "bg-secondary"
              )}
            >
              <Bell
                className={cn(
                  "w-4 h-4",
                  criticalCount > 0
                    ? "text-status-critical status-pulse-critical"
                    : "text-primary"
                )}
              />
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
                <span className="text-muted-foreground font-mono">
                  {activeAlarms.length} active
                </span>
              </div>
            </div>
          </div>
          {activeAlarms.length > 0 && (
            <Button variant="outline" size="sm" onClick={onAcknowledgeAll} className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              ACK ALL
            </Button>
          )}
        </div>

        {/* Alarm List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {displayAlarms.map((alarm) => {
              const config = priorityConfig[alarm.priority];
              const Icon = config.icon;
              const isActive = alarm.state === "active";

              return (
                <motion.div
                  key={alarm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "p-3 border-b border-border/50 border-l-2 transition-all cursor-pointer hover:bg-muted/30",
                    config.bgColor,
                    config.borderColor,
                    !isActive && "opacity-60"
                  )}
                  onClick={() => {
                    setSelectedAlarm(alarm);
                    if (isActive) setShowAckDialog(true);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        config.textColor,
                        isActive && config.pulseClass
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          {alarm.timestamp.toLocaleTimeString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs uppercase", config.bgColor, config.textColor)}
                        >
                          {alarm.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stateLabels[alarm.state]}
                        </Badge>
                        {alarm.escalationLevel > 0 && (
                          <Badge className="text-xs bg-status-critical/20 text-status-critical">
                            ESC-{alarm.escalationLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">
                        {alarm.source}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{alarm.message}</div>
                      {alarm.acknowledgedBy && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-status-normal" />
                          <span>
                            Ack by {alarm.acknowledgedBy} at{" "}
                            {alarm.acknowledgedAt?.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlarm(alarm);
                            setShowShelveDialog(true);
                          }}
                          className="h-6 w-6 p-0 hover:bg-status-warning/20"
                        >
                          <Clock className="w-3 h-3 text-status-warning" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcknowledge(alarm.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-status-normal/20"
                        >
                          <Check className="w-3 h-3 text-status-normal" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {displayAlarms.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active alarms</p>
            </div>
          )}
        </div>
      </div>

      {/* Acknowledge Dialog */}
      <Dialog open={showAckDialog} onOpenChange={setShowAckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Alarm</DialogTitle>
            <DialogDescription>
              {selectedAlarm && (
                <>
                  <span className="font-mono">{selectedAlarm.source}</span>
                  <br />
                  {selectedAlarm.message}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-xs text-muted-foreground">Comment (optional)</Label>
            <Textarea
              value={ackComment}
              onChange={(e) => setAckComment(e.target.value)}
              placeholder="Add a comment about this acknowledgment..."
              rows={2}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAckDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledge}>
              <Check className="w-4 h-4 mr-1" />
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shelve Dialog */}
      <Dialog open={showShelveDialog} onOpenChange={setShowShelveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shelve Alarm</DialogTitle>
            <DialogDescription>
              Temporarily suppress this alarm. It will reactivate after the selected duration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <Select value={shelveDuration} onValueChange={setShelveDuration}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reason (required)</Label>
              <Textarea
                value={shelveReason}
                onChange={(e) => setShelveReason(e.target.value)}
                placeholder="Why is this alarm being shelved?"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShelveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShelve} disabled={!shelveReason}>
              <Clock className="w-4 h-4 mr-1" />
              Shelve Alarm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
