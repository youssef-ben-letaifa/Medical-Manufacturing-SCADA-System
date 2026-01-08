import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Factory,
  Play,
  Pause,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GaugeChart } from "../GaugeChart";

interface ProductionLine {
  id: string;
  name: string;
  status: "running" | "idle" | "fault" | "changeover" | "maintenance";
  product: string;
  target: number;
  actual: number;
  reject: number;
  oee: number;
  cycleTime: number;
  targetCycleTime: number;
  operator: string;
  shift: string;
}

interface WorkOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  completed: number;
  status: "pending" | "active" | "completed" | "on_hold";
  dueDate: Date;
  priority: "low" | "normal" | "high" | "urgent";
}

const mockProductionLines: ProductionLine[] = [
  {
    id: "line-1",
    name: "Injection Molding Line 1",
    status: "running",
    product: "Catheter Housing Type A",
    target: 1000,
    actual: 847,
    reject: 12,
    oee: 89.2,
    cycleTime: 12.4,
    targetCycleTime: 12.0,
    operator: "J. Smith",
    shift: "Day Shift",
  },
  {
    id: "line-2",
    name: "Assembly Line 1",
    status: "running",
    product: "Complete Catheter Assembly",
    target: 500,
    actual: 423,
    reject: 5,
    oee: 92.1,
    cycleTime: 28.5,
    targetCycleTime: 30.0,
    operator: "M. Johnson",
    shift: "Day Shift",
  },
  {
    id: "line-3",
    name: "Packaging Line 1",
    status: "changeover",
    product: "Sterile Pack - Type B",
    target: 800,
    actual: 0,
    reject: 0,
    oee: 0,
    cycleTime: 0,
    targetCycleTime: 8.0,
    operator: "R. Chen",
    shift: "Day Shift",
  },
  {
    id: "line-4",
    name: "Sterilization Unit 1",
    status: "running",
    product: "Batch Sterilization",
    target: 10,
    actual: 7,
    reject: 0,
    oee: 95.0,
    cycleTime: 45,
    targetCycleTime: 45,
    operator: "System Auto",
    shift: "Continuous",
  },
];

const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo-1",
    orderNumber: "WO-2024-0847",
    product: "Catheter Assembly Type A",
    quantity: 5000,
    completed: 2847,
    status: "active",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: "high",
  },
  {
    id: "wo-2",
    orderNumber: "WO-2024-0848",
    product: "Syringe Housing Type B",
    quantity: 10000,
    completed: 0,
    status: "pending",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: "normal",
  },
  {
    id: "wo-3",
    orderNumber: "WO-2024-0846",
    product: "Valve Component",
    quantity: 2000,
    completed: 2000,
    status: "completed",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: "normal",
  },
];

const statusConfig = {
  running: { color: "bg-status-normal", icon: Play, label: "Running" },
  idle: { color: "bg-muted-foreground", icon: Pause, label: "Idle" },
  fault: { color: "bg-status-critical", icon: AlertCircle, label: "Fault" },
  changeover: { color: "bg-status-warning", icon: Clock, label: "Changeover" },
  maintenance: { color: "bg-primary", icon: Wrench, label: "Maintenance" },
};

export function ProductionModule() {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  const totalProduction = mockProductionLines.reduce((sum, l) => sum + l.actual, 0);
  const totalTarget = mockProductionLines.reduce((sum, l) => sum + l.target, 0);
  const averageOEE = mockProductionLines.filter(l => l.oee > 0).reduce((sum, l) => sum + l.oee, 0) / mockProductionLines.filter(l => l.oee > 0).length;
  const totalRejects = mockProductionLines.reduce((sum, l) => sum + l.reject, 0);

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Production</p>
                <p className="text-2xl font-bold font-mono">{totalProduction.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Target: {totalTarget.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-normal">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall OEE</p>
                <p className="text-2xl font-bold font-mono">{averageOEE.toFixed(1)}%</p>
                <p className="text-xs text-status-normal flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2.1% vs yesterday
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-status-normal opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejects Today</p>
                <p className="text-2xl font-bold font-mono">{totalRejects}</p>
                <p className="text-xs text-muted-foreground">{((totalRejects / totalProduction) * 100).toFixed(2)}% reject rate</p>
              </div>
              <XCircle className="w-8 h-8 text-status-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-info">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Lines</p>
                <p className="text-2xl font-bold font-mono">
                  {mockProductionLines.filter((l) => l.status === "running").length}/{mockProductionLines.length}
                </p>
                <p className="text-xs text-muted-foreground">Day Shift</p>
              </div>
              <Factory className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lines">Production Lines</TabsTrigger>
          <TabsTrigger value="orders">Work Orders</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {mockProductionLines.map((line) => {
              const config = statusConfig[line.status];
              const StatusIcon = config.icon;
              const progress = line.target > 0 ? (line.actual / line.target) * 100 : 0;

              return (
                <motion.div
                  key={line.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedLine(line.id)}
                >
                  <Card className={cn("cursor-pointer transition-all", selectedLine === line.id && "ring-2 ring-primary")}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", config.color, line.status === "running" && "status-pulse-normal")} />
                          <CardTitle className="text-base">{line.name}</CardTitle>
                        </div>
                        <Badge variant={line.status === "running" ? "default" : "secondary"} className="gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{line.product}</p>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="font-mono">{line.actual} / {line.target}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-secondary rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">OEE</p>
                          <p className="font-bold font-mono text-sm">{line.oee}%</p>
                        </div>
                        <div className="bg-secondary rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Cycle</p>
                          <p className="font-bold font-mono text-sm">{line.cycleTime}s</p>
                        </div>
                        <div className="bg-secondary rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Rejects</p>
                          <p className="font-bold font-mono text-sm">{line.reject}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Operator: {line.operator}</span>
                        <span>{line.shift}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWorkOrders.map((order) => {
                  const progress = (order.completed / order.quantity) * 100;
                  const priorityColors = {
                    low: "bg-muted text-muted-foreground",
                    normal: "bg-secondary text-foreground",
                    high: "bg-status-warning/20 text-status-warning",
                    urgent: "bg-destructive/20 text-destructive",
                  };
                  const statusColors = {
                    pending: "bg-muted text-muted-foreground",
                    active: "bg-primary/20 text-primary",
                    completed: "bg-status-normal/20 text-status-normal",
                    on_hold: "bg-status-warning/20 text-status-warning",
                  };

                  return (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                          <Badge className={priorityColors[order.priority]} variant="secondary">
                            {order.priority}
                          </Badge>
                          <Badge className={statusColors[order.status]} variant="secondary">
                            {order.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.product}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <Progress value={progress} className="h-1.5" />
                          </div>
                          <span className="text-xs font-mono">
                            {order.completed.toLocaleString()} / {order.quantity.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Due: {order.dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Downtime Summary - Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold font-mono">2.4h</p>
                    <p className="text-xs text-muted-foreground">Total Downtime</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold font-mono">4</p>
                    <p className="text-xs text-muted-foreground">Incidents</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold font-mono">36m</p>
                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold font-mono">94.2%</p>
                    <p className="text-xs text-muted-foreground">Availability</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Downtime Events</h4>
                  {[
                    { time: "09:45", duration: "45m", reason: "Changeover - Product A to B", line: "Line 3" },
                    { time: "11:20", duration: "15m", reason: "Material Shortage", line: "Line 1" },
                    { time: "14:30", duration: "1h 20m", reason: "Equipment Fault - Heater Zone 3", line: "Line 2" },
                    { time: "16:00", duration: "20m", reason: "Quality Hold - Inspection", line: "Line 4" },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 border rounded-lg">
                      <span className="font-mono text-sm text-muted-foreground">{event.time}</span>
                      <span className="font-mono text-sm font-medium">{event.duration}</span>
                      <span className="flex-1 text-sm">{event.reason}</span>
                      <Badge variant="secondary">{event.line}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}