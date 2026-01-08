import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Zap,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle,
  Power,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UtilitySystem {
  id: string;
  name: string;
  type: "electrical" | "compressed_air" | "chilled_water" | "steam" | "vacuum";
  status: "normal" | "warning" | "critical" | "offline";
  parameters: { name: string; value: number; unit: string; min?: number; max?: number }[];
}

const mockUtilities: UtilitySystem[] = [
  {
    id: "electrical",
    name: "Electrical Power",
    type: "electrical",
    status: "normal",
    parameters: [
      { name: "Total Load", value: 847, unit: "kW" },
      { name: "Power Factor", value: 0.92, unit: "" },
      { name: "Voltage L1-L2", value: 480, unit: "V" },
      { name: "Frequency", value: 60.0, unit: "Hz" },
    ],
  },
  {
    id: "compressed_air",
    name: "Compressed Air",
    type: "compressed_air",
    status: "normal",
    parameters: [
      { name: "System Pressure", value: 105, unit: "psi", min: 90, max: 120 },
      { name: "Flow Rate", value: 450, unit: "SCFM" },
      { name: "Dew Point", value: -40, unit: "°F" },
      { name: "Oil Content", value: 0.01, unit: "ppm" },
    ],
  },
  {
    id: "chilled_water",
    name: "Chilled Water",
    type: "chilled_water",
    status: "warning",
    parameters: [
      { name: "Supply Temp", value: 45, unit: "°F", min: 42, max: 48 },
      { name: "Return Temp", value: 55, unit: "°F" },
      { name: "Flow Rate", value: 1200, unit: "GPM" },
      { name: "Delta T", value: 10, unit: "°F" },
    ],
  },
  {
    id: "purified_water",
    name: "Purified Water",
    type: "chilled_water",
    status: "normal",
    parameters: [
      { name: "Conductivity", value: 0.8, unit: "μS/cm", max: 1.3 },
      { name: "TOC", value: 125, unit: "ppb", max: 500 },
      { name: "Temperature", value: 25, unit: "°C" },
      { name: "Flow Rate", value: 50, unit: "GPM" },
    ],
  },
];

const generateEnergyData = (points: number = 24) => {
  const data = [];
  for (let i = 0; i < points; i++) {
    const hour = (new Date().getHours() - points + i + 24) % 24;
    const baseLoad = hour >= 6 && hour <= 18 ? 800 : 400;
    data.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      consumption: baseLoad + Math.random() * 200 - 100,
      demand: baseLoad + Math.random() * 100,
    });
  }
  return data;
};

export function UtilitiesModule() {
  const [energyData, setEnergyData] = useState(generateEnergyData());

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyData(generateEnergyData());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalConsumption = 18450; // kWh today
  const peakDemand = 892; // kW
  const currentLoad = 847; // kW

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Current Load</span>
            </div>
            <p className="text-2xl font-bold font-mono">{currentLoad} kW</p>
            <p className="text-xs text-muted-foreground">Peak: {peakDemand} kW</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-normal">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-status-normal" />
              <span className="text-sm font-medium">Today's Usage</span>
            </div>
            <p className="text-2xl font-bold font-mono">{totalConsumption.toLocaleString()} kWh</p>
            <p className="text-xs text-muted-foreground">Est. Cost: $1,845</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-data-secondary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-data-secondary" />
              <span className="text-sm font-medium">Compressed Air</span>
            </div>
            <p className="text-2xl font-bold font-mono">105 psi</p>
            <p className="text-xs text-muted-foreground">450 SCFM</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-data-tertiary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-data-tertiary" />
              <span className="text-sm font-medium">Chilled Water</span>
            </div>
            <p className="text-2xl font-bold font-mono">45°F</p>
            <p className="text-xs text-muted-foreground">1,200 GPM</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="electrical">Electrical</TabsTrigger>
          <TabsTrigger value="compressed_air">Compressed Air</TabsTrigger>
          <TabsTrigger value="water">Water Systems</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Utility Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Utility Systems Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUtilities.map((utility) => (
                    <div
                      key={utility.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        utility.status === "normal" && "border-status-normal/30 bg-status-normal/5",
                        utility.status === "warning" && "border-status-warning/30 bg-status-warning/5",
                        utility.status === "critical" && "border-destructive/30 bg-destructive/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {utility.status === "normal" ? (
                            <CheckCircle className="w-4 h-4 text-status-normal" />
                          ) : (
                            <AlertTriangle className={cn("w-4 h-4", utility.status === "warning" ? "text-status-warning" : "text-destructive")} />
                          )}
                          <span className="font-medium">{utility.name}</span>
                        </div>
                        <Badge
                          className={cn(
                            utility.status === "normal" && "bg-status-normal",
                            utility.status === "warning" && "bg-status-warning",
                            utility.status === "critical" && "bg-destructive"
                          )}
                        >
                          {utility.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {utility.parameters.slice(0, 2).map((param) => (
                          <div key={param.name} className="flex justify-between">
                            <span className="text-muted-foreground">{param.name}:</span>
                            <span className="font-mono">{param.value} {param.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Energy Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Power Consumption - 24hr</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData}>
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
                      <Area
                        type="monotone"
                        dataKey="consumption"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        name="Consumption (kW)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="electrical" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Main Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Main Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Load</span>
                    <span className="font-mono">{currentLoad} kW</span>
                  </div>
                  <Progress value={(currentLoad / 1000) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Capacity: 1,000 kW</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Voltage:</span>
                    <span className="font-mono ml-2">480V</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-mono ml-2">60.0 Hz</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Power Factor:</span>
                    <span className="font-mono ml-2">0.92</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phase:</span>
                    <span className="font-mono ml-2">3-Phase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panel Loads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Panel Loads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "MDP-1 Production", load: 320, capacity: 400 },
                    { name: "MDP-2 HVAC", load: 180, capacity: 250 },
                    { name: "MDP-3 Lighting", load: 45, capacity: 100 },
                    { name: "MDP-4 Cleanroom", load: 210, capacity: 300 },
                  ].map((panel) => (
                    <div key={panel.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{panel.name}</span>
                        <span className="font-mono">{panel.load} kW</span>
                      </div>
                      <Progress value={(panel.load / panel.capacity) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generator Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Power className="w-8 h-8 text-status-normal" />
                  <div>
                    <p className="font-medium">Ready</p>
                    <p className="text-xs text-muted-foreground">Auto Transfer</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel Level:</span>
                    <span className="font-mono">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Runtime:</span>
                    <span className="font-mono">1,234 hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Test:</span>
                    <span className="font-mono">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compressed_air" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold font-mono">105</p>
                  <p className="text-muted-foreground">psi</p>
                </div>
                <Progress value={((105 - 90) / (120 - 90)) * 100} className="h-2 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>90 psi</span>
                  <span>120 psi</span>
                </div>
              </CardContent>
            </Card>

            {/* Compressor Status */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Compressors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Compressor 1", status: "load", runtime: 12450, load: 85 },
                    { name: "Compressor 2", status: "unload", runtime: 8920, load: 0 },
                    { name: "Compressor 3", status: "standby", runtime: 5670, load: 0 },
                  ].map((comp) => (
                    <div key={comp.name} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{comp.name}</span>
                        <Badge variant={comp.status === "load" ? "default" : "secondary"}>
                          {comp.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Runtime:</span>
                          <span className="font-mono">{comp.runtime.toLocaleString()} hrs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Load:</span>
                          <span className="font-mono">{comp.load}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Purified Water */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Purified Water (PW)</CardTitle>
                  <Badge className="bg-status-normal">In Spec</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">0.8</p>
                    <p className="text-xs text-muted-foreground">Conductivity (μS/cm)</p>
                    <p className="text-xs text-status-normal">Limit: 1.3</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">125</p>
                    <p className="text-xs text-muted-foreground">TOC (ppb)</p>
                    <p className="text-xs text-status-normal">Limit: 500</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">25</p>
                    <p className="text-xs text-muted-foreground">Temperature (°C)</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">50</p>
                    <p className="text-xs text-muted-foreground">Flow (GPM)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chilled Water */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Chilled Water</CardTitle>
                  <Badge className="bg-status-warning">Warning</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-status-warning/10 rounded-lg text-center border border-status-warning/20">
                    <p className="text-2xl font-bold font-mono">45</p>
                    <p className="text-xs text-muted-foreground">Supply Temp (°F)</p>
                    <p className="text-xs text-status-warning">Target: 42-44°F</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">55</p>
                    <p className="text-xs text-muted-foreground">Return Temp (°F)</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">1,200</p>
                    <p className="text-xs text-muted-foreground">Flow (GPM)</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-2xl font-bold font-mono">10</p>
                    <p className="text-xs text-muted-foreground">Delta T (°F)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}