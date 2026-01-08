import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Volume2,
  VolumeX,
  Eye,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alarm } from "@/types/scada";

interface AlarmsModuleProps {
  alarms: Alarm[];
  onAcknowledge: (alarmId: string, comment?: string) => void;
  onShelve: (alarmId: string, duration: number, reason: string) => void;
  onAcknowledgeAll: () => void;
}

const priorityConfig = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive" },
  high: { icon: AlertCircle, color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning" },
  medium: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary" },
  low: { icon: Info, color: "text-muted-foreground", bg: "bg-muted", border: "border-muted-foreground" },
};

export function AlarmsModule({ alarms, onAcknowledge, onShelve, onAcknowledgeAll }: AlarmsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [showAckDialog, setShowAckDialog] = useState(false);
  const [showShelveDialog, setShowShelveDialog] = useState(false);
  const [ackComment, setAckComment] = useState("");
  const [shelveReason, setShelveReason] = useState("");
  const [shelveDuration, setShelveDuration] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeAlarms = alarms.filter((a) => a.state === "active" || a.state === "acknowledged");
  const criticalCount = alarms.filter((a) => a.priority === "critical" && a.state === "active").length;
  const highCount = alarms.filter((a) => a.priority === "high" && a.state === "active").length;
  const mediumCount = alarms.filter((a) => a.priority === "medium" && a.state === "active").length;
  const lowCount = alarms.filter((a) => a.priority === "low" && a.state === "active").length;

  const filteredAlarms = activeAlarms.filter((alarm) => {
    const matchesSearch =
      alarm.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || alarm.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleAcknowledge = () => {
    if (selectedAlarm) {
      onAcknowledge(selectedAlarm.id, ackComment);
      setShowAckDialog(false);
      setAckComment("");
      setSelectedAlarm(null);
    }
  };

  const handleShelve = () => {
    if (selectedAlarm) {
      onShelve(selectedAlarm.id, shelveDuration, shelveReason);
      setShowShelveDialog(false);
      setShelveReason("");
      setSelectedAlarm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alarm Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold font-mono">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-status-warning">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-status-warning" />
            <div>
              <p className="text-2xl font-bold font-mono">{highCount}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4 flex items-center gap-3">
            <Info className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold font-mono">{mediumCount}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-4 flex items-center gap-3">
            <Info className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold font-mono">{lowCount}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-status-normal">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-status-normal" />
            <div>
              <p className="text-2xl font-bold font-mono">{alarms.filter((a) => a.state === "acknowledged").length}</p>
              <p className="text-xs text-muted-foreground">Acknowledged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Alarms</TabsTrigger>
            <TabsTrigger value="history">Alarm History</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button
              size="sm"
              onClick={onAcknowledgeAll}
              disabled={activeAlarms.filter((a) => a.state === "active").length === 0}
              className="gap-2"
            >
              <Check className="w-4 h-4" /> Ack All
            </Button>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alarms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {["all", "critical", "high", "medium", "low"].map((priority) => (
                <Button
                  key={priority}
                  variant={priorityFilter === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter(priority)}
                  className="capitalize"
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {/* Alarm List */}
          <Card>
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="p-4 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredAlarms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active alarms</p>
                    </div>
                  ) : (
                    filteredAlarms.map((alarm) => {
                      const config = priorityConfig[alarm.priority];
                      const PriorityIcon = config.icon;

                      return (
                        <motion.div
                          key={alarm.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={cn(
                            "p-4 rounded-lg border-l-4 bg-card",
                            config.border,
                            alarm.state === "active" && alarm.priority === "critical" && "status-pulse-critical"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <PriorityIcon className={cn("w-5 h-5 mt-0.5", config.color)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-medium">{alarm.source}</span>
                                <Badge variant="outline" className={config.color}>
                                  {alarm.priority}
                                </Badge>
                                <Badge variant={alarm.state === "active" ? "destructive" : "secondary"}>
                                  {alarm.state}
                                </Badge>
                              </div>
                              <p className="text-sm text-foreground mb-1">{alarm.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {alarm.timestamp.toLocaleTimeString()}
                                </span>
                                {alarm.value !== undefined && (
                                  <span>Value: {alarm.value}</span>
                                )}
                                {alarm.limitValue !== undefined && (
                                  <span>Limit: {alarm.limitValue}</span>
                                )}
                                {alarm.acknowledgedBy && (
                                  <span>Ack by: {alarm.acknowledgedBy}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAlarm(alarm);
                                  setShowAckDialog(true);
                                }}
                                disabled={alarm.state === "acknowledged"}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAlarm(alarm);
                                  setShowShelveDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alarm History - Last 24 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { time: "16:45", source: "MOLDING.PRESS01", message: "Temperature returned to normal", type: "cleared", priority: "high" },
                  { time: "16:30", source: "MOLDING.PRESS01", message: "Temperature exceeded high limit", type: "occurred", priority: "high" },
                  { time: "14:20", source: "CLEANROOM.ZONE_A", message: "Pressure differential alarm acknowledged", type: "acknowledged", priority: "medium" },
                  { time: "12:15", source: "STERILIZER.UNIT_01", message: "Cycle completed successfully", type: "cleared", priority: "low" },
                  { time: "10:00", source: "PACKAGING.LINE_2", message: "Sensor calibration reminder", type: "occurred", priority: "low" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                    <span className="font-mono text-sm text-muted-foreground w-14">{entry.time}</span>
                    <Badge variant="secondary" className={cn(
                      entry.type === "occurred" && "bg-status-warning/20 text-status-warning",
                      entry.type === "acknowledged" && "bg-primary/20 text-primary",
                      entry.type === "cleared" && "bg-status-normal/20 text-status-normal"
                    )}>
                      {entry.type}
                    </Badge>
                    <span className="font-mono text-sm">{entry.source}</span>
                    <span className="flex-1 text-sm text-muted-foreground">{entry.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alarm Statistics - Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Alarms</span>
                    <span className="font-mono font-bold">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-mono font-bold">2m 34s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alarms per Hour</span>
                    <span className="font-mono font-bold">5.9</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Standing Alarms (&gt;1hr)</span>
                    <span className="font-mono font-bold text-status-warning">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Alarm Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { source: "MOLDING.PRESS01", count: 12 },
                    { source: "CLEANROOM.ZONE_A", count: 8 },
                    { source: "STERILIZER.UNIT_01", count: 6 },
                    { source: "PACKAGING.LINE_2", count: 5 },
                    { source: "ASSEMBLY.STATION_04", count: 4 },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm font-mono">{item.source}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Acknowledge Dialog */}
      <Dialog open={showAckDialog} onOpenChange={setShowAckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Alarm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAlarm && (
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono text-sm">{selectedAlarm.source}</p>
                <p className="text-sm text-muted-foreground">{selectedAlarm.message}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                value={ackComment}
                onChange={(e) => setAckComment(e.target.value)}
                placeholder="Enter corrective action taken..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAckDialog(false)}>Cancel</Button>
            <Button onClick={handleAcknowledge}>Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shelve Dialog */}
      <Dialog open={showShelveDialog} onOpenChange={setShowShelveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shelve Alarm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAlarm && (
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono text-sm">{selectedAlarm.source}</p>
                <p className="text-sm text-muted-foreground">{selectedAlarm.message}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                value={shelveReason}
                onChange={(e) => setShelveReason(e.target.value)}
                placeholder="Enter reason for shelving..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={shelveDuration}
                onChange={(e) => setShelveDuration(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShelveDialog(false)}>Cancel</Button>
            <Button onClick={handleShelve}>Shelve Alarm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}