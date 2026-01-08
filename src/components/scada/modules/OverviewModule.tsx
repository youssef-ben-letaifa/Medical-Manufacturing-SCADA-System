import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Factory,
  Zap,
  Box,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "../MetricCard";
import { Alarm, Batch, Equipment } from "@/types/scada";

interface OverviewModuleProps {
  alarms: Alarm[];
  batches: Batch[];
  equipment: Equipment[];
  trendData: { time: string; value: number }[];
}

export function OverviewModule({ alarms, batches, equipment, trendData }: OverviewModuleProps) {
  const activeAlarms = alarms.filter((a) => a.state === "active" || a.state === "acknowledged");
  const criticalAlarms = alarms.filter((a) => a.priority === "critical" && a.state === "active");
  const runningBatches = batches.filter((b) => b.status === "running");
  const runningEquipment = equipment.filter((e) => e.operationalStatus === "running");
  const faultEquipment = equipment.filter((e) => e.operationalStatus === "critical");

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Active Equipment"
          value={runningEquipment.length}
          unit={`/ ${equipment.length}`}
          status="running"
          icon={Factory}
        />
        <MetricCard
          title="Running Batches"
          value={runningBatches.length}
          unit="batches"
          status="running"
          icon={Box}
        />
        <MetricCard
          title="Production Rate"
          value={94.2}
          unit="%"
          status="normal"
          icon={TrendingUp}
          trend="up"
          trendValue="+2.1%"
        />
        <MetricCard
          title="OEE"
          value={89.5}
          unit="%"
          status="normal"
          icon={Activity}
        />
        <MetricCard
          title="Active Alarms"
          value={activeAlarms.length}
          unit="alarms"
          status={criticalAlarms.length > 0 ? "critical" : activeAlarms.length > 0 ? "warning" : "normal"}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Shift Output"
          value={2847}
          unit="units"
          status="normal"
          icon={Zap}
          trend="up"
          trendValue="+156"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Production Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Production Trend - Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { name: "Production Lines", status: "normal", value: "4/4 Active" },
                { name: "Cleanroom Status", status: "normal", value: "All In Spec" },
                { name: "Utilities", status: "warning", value: "1 Warning" },
                { name: "Quality", status: "normal", value: "98.5% Yield" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.status === "normal" && "bg-status-normal",
                      item.status === "warning" && "bg-status-warning",
                      item.status === "critical" && "bg-status-critical"
                    )} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Alarms */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Alarms</CardTitle>
              <Badge variant={criticalAlarms.length > 0 ? "destructive" : "secondary"}>
                {activeAlarms.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activeAlarms.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-status-normal" />
                <p>No active alarms</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlarms.slice(0, 5).map((alarm) => (
                  <div
                    key={alarm.id}
                    className={cn(
                      "p-3 rounded-lg border-l-4",
                      alarm.priority === "critical" && "border-l-destructive bg-destructive/5",
                      alarm.priority === "high" && "border-l-status-warning bg-status-warning/5",
                      alarm.priority === "medium" && "border-l-primary bg-primary/5",
                      alarm.priority === "low" && "border-l-muted-foreground bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono">{alarm.source}</span>
                      <Badge variant="outline" className={cn(
                        alarm.priority === "critical" && "text-destructive",
                        alarm.priority === "high" && "text-status-warning",
                        alarm.priority === "medium" && "text-primary"
                      )}>
                        {alarm.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alarm.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Equipment Status</CardTitle>
              <Badge className="bg-status-normal">
                {runningEquipment.length} Running
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipment.slice(0, 6).map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      eq.operationalStatus === "running" && "bg-status-normal status-pulse-normal",
                      eq.operationalStatus === "normal" && "bg-status-normal",
                      eq.operationalStatus === "warning" && "bg-status-warning status-pulse-warning",
                      eq.operationalStatus === "critical" && "bg-status-critical status-pulse-critical"
                    )} />
                    <span className="text-sm">{eq.name}</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {eq.operationalStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Running Batches */}
      {runningBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Running Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runningBatches.map((batch) => {
                const phases = batch.phases ?? [];
                const completedPhases = phases.filter((p) => p.status === "complete").length;
                const totalPhases = phases.length;
                const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : batch.overallProgress;
                return (
                  <div key={batch.id} className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-medium">{batch.batchNumber}</span>
                      <Badge className="bg-status-normal">Running</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{batch.productName}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="font-mono">{totalPhases > 0 ? `${completedPhases}/${totalPhases} phases` : `${Math.round(progress)}%`}</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}