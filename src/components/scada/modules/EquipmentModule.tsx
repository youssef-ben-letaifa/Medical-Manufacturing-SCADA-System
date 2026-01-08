import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  Thermometer,
  Gauge,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Play,
  Pause,
  RotateCcw,
  Power,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Equipment } from "@/types/scada";

interface EquipmentDetail {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "running" | "idle" | "fault" | "maintenance" | "offline";
  mode: "auto" | "manual" | "setup";
  runtime: number;
  cycleCount: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  calibrationDue: Date;
  maintenanceDue: Date;
  lastMaintenance: Date;
  parameters: { name: string; value: string; unit: string; status: "normal" | "warning" | "critical" }[];
}

const mockEquipment: EquipmentDetail[] = [
  {
    id: "eq-1",
    name: "Injection Press #1",
    type: "Injection Molding",
    location: "Building A - Bay 1",
    status: "running",
    mode: "auto",
    runtime: 2847,
    cycleCount: 124500,
    oee: 89.2,
    availability: 94.5,
    performance: 96.2,
    quality: 98.1,
    calibrationDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maintenanceDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    lastMaintenance: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    parameters: [
      { name: "Barrel Zone 1", value: "248", unit: "°C", status: "normal" },
      { name: "Barrel Zone 2", value: "252", unit: "°C", status: "normal" },
      { name: "Barrel Zone 3", value: "265", unit: "°C", status: "warning" },
      { name: "Clamp Force", value: "85", unit: "tons", status: "normal" },
      { name: "Injection Pressure", value: "1420", unit: "bar", status: "normal" },
      { name: "Cycle Time", value: "12.4", unit: "s", status: "normal" },
    ],
  },
  {
    id: "eq-2",
    name: "Injection Press #2",
    type: "Injection Molding",
    location: "Building A - Bay 2",
    status: "fault",
    mode: "manual",
    runtime: 3124,
    cycleCount: 138200,
    oee: 0,
    availability: 0,
    performance: 0,
    quality: 0,
    calibrationDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maintenanceDue: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastMaintenance: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
    parameters: [
      { name: "Barrel Zone 1", value: "---", unit: "°C", status: "critical" },
      { name: "Barrel Zone 2", value: "---", unit: "°C", status: "critical" },
      { name: "Barrel Zone 3", value: "---", unit: "°C", status: "critical" },
      { name: "Clamp Force", value: "0", unit: "tons", status: "critical" },
      { name: "Injection Pressure", value: "0", unit: "bar", status: "critical" },
      { name: "Cycle Time", value: "---", unit: "s", status: "critical" },
    ],
  },
  {
    id: "eq-3",
    name: "CNC Machine Center",
    type: "CNC Machining",
    location: "Building A - Bay 3",
    status: "idle",
    mode: "auto",
    runtime: 1567,
    cycleCount: 45200,
    oee: 0,
    availability: 100,
    performance: 0,
    quality: 0,
    calibrationDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    maintenanceDue: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    lastMaintenance: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    parameters: [
      { name: "Spindle Speed", value: "0", unit: "RPM", status: "normal" },
      { name: "Feed Rate", value: "0", unit: "mm/min", status: "normal" },
      { name: "Tool Position X", value: "0.000", unit: "mm", status: "normal" },
      { name: "Tool Position Y", value: "0.000", unit: "mm", status: "normal" },
      { name: "Tool Position Z", value: "50.000", unit: "mm", status: "normal" },
      { name: "Coolant Flow", value: "0", unit: "L/min", status: "normal" },
    ],
  },
  {
    id: "eq-4",
    name: "Assembly Robot #1",
    type: "6-Axis Robot",
    location: "Building B - Cell 1",
    status: "running",
    mode: "auto",
    runtime: 892,
    cycleCount: 89400,
    oee: 92.1,
    availability: 96.8,
    performance: 97.5,
    quality: 97.6,
    calibrationDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    maintenanceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    parameters: [
      { name: "Joint 1", value: "45.2", unit: "°", status: "normal" },
      { name: "Joint 2", value: "-12.8", unit: "°", status: "normal" },
      { name: "Joint 3", value: "89.5", unit: "°", status: "normal" },
      { name: "Gripper Force", value: "25", unit: "N", status: "normal" },
      { name: "Cycle Time", value: "8.2", unit: "s", status: "normal" },
      { name: "Program", value: "ASSY_001", unit: "", status: "normal" },
    ],
  },
];

const statusConfig = {
  running: { color: "bg-status-normal", textColor: "text-status-normal", label: "Running" },
  idle: { color: "bg-muted-foreground", textColor: "text-muted-foreground", label: "Idle" },
  fault: { color: "bg-status-critical", textColor: "text-status-critical", label: "Fault" },
  maintenance: { color: "bg-status-warning", textColor: "text-status-warning", label: "Maintenance" },
  offline: { color: "bg-muted", textColor: "text-muted-foreground", label: "Offline" },
};

export function EquipmentModule() {
  const [selectedEquipment, setSelectedEquipment] = useState<string>(mockEquipment[0].id);
  const equipment = mockEquipment.find((e) => e.id === selectedEquipment)!;

  const runningCount = mockEquipment.filter((e) => e.status === "running").length;
  const faultCount = mockEquipment.filter((e) => e.status === "fault").length;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Equipment List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Equipment Registry</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-status-normal/20 text-status-normal">
                {runningCount} Running
              </Badge>
              {faultCount > 0 && (
                <Badge variant="destructive">{faultCount} Fault</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-2">
              {mockEquipment.map((eq) => {
                const config = statusConfig[eq.status];
                return (
                  <motion.div
                    key={eq.id}
                    whileHover={{ x: 2 }}
                    onClick={() => setSelectedEquipment(eq.id)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer border transition-all",
                      selectedEquipment === eq.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", config.color, eq.status === "running" && "status-pulse-normal", eq.status === "fault" && "status-pulse-critical")} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{eq.name}</p>
                        <p className="text-xs text-muted-foreground">{eq.location}</p>
                      </div>
                      <Badge variant="secondary" className={cn("text-xs", config.textColor)}>
                        {config.label}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Equipment Detail */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full", statusConfig[equipment.status].color)} />
              <div>
                <CardTitle className="text-lg">{equipment.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{equipment.type} • {equipment.location}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono">
                Mode: {equipment.mode.toUpperCase()}
              </Badge>
              <Badge className={statusConfig[equipment.status].color}>
                {statusConfig[equipment.status].label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* OEE Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">OEE</p>
                    <p className="text-2xl font-bold font-mono">{equipment.oee}%</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-status-info">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="text-2xl font-bold font-mono">{equipment.availability}%</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-status-normal">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Performance</p>
                    <p className="text-2xl font-bold font-mono">{equipment.performance}%</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-data-tertiary">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Quality</p>
                    <p className="text-2xl font-bold font-mono">{equipment.quality}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Runtime Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Runtime</p>
                        <p className="text-xl font-bold font-mono">{equipment.runtime.toLocaleString()} hrs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cycles</p>
                        <p className="text-xl font-bold font-mono">{equipment.cycleCount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipment.parameters.map((param, i) => (
                  <Card key={i} className={cn(
                    "border-l-4",
                    param.status === "normal" && "border-l-status-normal",
                    param.status === "warning" && "border-l-status-warning",
                    param.status === "critical" && "border-l-status-critical"
                  )}>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">{param.name}</p>
                      <p className="text-lg font-bold font-mono">
                        {param.value}
                        {param.unit && <span className="text-xs text-muted-foreground ml-1">{param.unit}</span>}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className={cn("border-l-4", equipment.calibrationDue > new Date() ? "border-l-status-normal" : "border-l-status-critical")}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Calibration</span>
                    </div>
                    <p className="text-sm">Due: {equipment.calibrationDue.toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.ceil((equipment.calibrationDue.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days remaining
                    </p>
                  </CardContent>
                </Card>

                <Card className={cn("border-l-4", equipment.maintenanceDue > new Date() ? "border-l-status-normal" : "border-l-status-critical")}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Next PM</span>
                    </div>
                    <p className="text-sm">Due: {equipment.maintenanceDue.toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.ceil((equipment.maintenanceDue.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days remaining
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-muted-foreground">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Last Maintenance</span>
                    </div>
                    <p className="text-sm">{equipment.lastMaintenance.toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - equipment.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000))} days ago
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Maintenance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { date: "2024-01-15", type: "PM", description: "Regular preventive maintenance", tech: "J. Smith" },
                      { date: "2024-01-02", type: "Calibration", description: "Annual calibration", tech: "M. Johnson" },
                      { date: "2023-12-20", type: "Repair", description: "Replaced heating element zone 3", tech: "R. Chen" },
                    ].map((entry, i) => (
                      <div key={i} className="flex items-center gap-4 p-2 bg-secondary/50 rounded-lg">
                        <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
                        <Badge variant="secondary">{entry.type}</Badge>
                        <span className="flex-1 text-sm">{entry.description}</span>
                        <span className="text-xs text-muted-foreground">{entry.tech}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controls" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Equipment Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2" disabled={equipment.status === "running"}>
                      <Play className="w-4 h-4" /> Start
                    </Button>
                    <Button variant="secondary" className="gap-2" disabled={equipment.status !== "running"}>
                      <Pause className="w-4 h-4" /> Stop
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <RotateCcw className="w-4 h-4" /> Reset Fault
                    </Button>
                    <Button variant="destructive" className="gap-2">
                      <Power className="w-4 h-4" /> E-Stop
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                    <div className="flex items-center gap-2 text-status-warning">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Authorization Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Equipment control actions require supervisor authorization and will be logged in the audit trail.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}