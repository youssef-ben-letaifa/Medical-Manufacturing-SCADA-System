import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvironmentalZone {
  id: string;
  name: string;
  classification: string;
  temperature: { value: number; min: number; max: number; unit: string };
  humidity: { value: number; min: number; max: number; unit: string };
  pressure: { value: number; min: number; max: number; unit: string };
  particleCount: { value: number; limit: number; unit: string };
  status: "normal" | "warning" | "critical";
}

const mockZones: EnvironmentalZone[] = [
  {
    id: "zone-a",
    name: "Cleanroom Zone A",
    classification: "ISO 7",
    temperature: { value: 21.2, min: 19, max: 23, unit: "°C" },
    humidity: { value: 45, min: 35, max: 55, unit: "%RH" },
    pressure: { value: 15, min: 10, max: 25, unit: "Pa" },
    particleCount: { value: 8500, limit: 352000, unit: "particles/m³" },
    status: "normal",
  },
  {
    id: "zone-b",
    name: "Cleanroom Zone B",
    classification: "ISO 8",
    temperature: { value: 22.8, min: 19, max: 23, unit: "°C" },
    humidity: { value: 52, min: 35, max: 55, unit: "%RH" },
    pressure: { value: 12, min: 10, max: 25, unit: "Pa" },
    particleCount: { value: 245000, limit: 3520000, unit: "particles/m³" },
    status: "warning",
  },
  {
    id: "zone-c",
    name: "Manufacturing Area",
    classification: "Controlled",
    temperature: { value: 24.5, min: 18, max: 26, unit: "°C" },
    humidity: { value: 48, min: 30, max: 60, unit: "%RH" },
    pressure: { value: 5, min: 0, max: 15, unit: "Pa" },
    particleCount: { value: 1200000, limit: 10000000, unit: "particles/m³" },
    status: "normal",
  },
  {
    id: "zone-d",
    name: "Packaging Area",
    classification: "ISO 8",
    temperature: { value: 21.0, min: 19, max: 23, unit: "°C" },
    humidity: { value: 44, min: 35, max: 55, unit: "%RH" },
    pressure: { value: 8, min: 5, max: 20, unit: "Pa" },
    particleCount: { value: 180000, limit: 3520000, unit: "particles/m³" },
    status: "normal",
  },
];

const generateTrendData = (baseValue: number, variance: number, points: number = 60) => {
  const data = [];
  const now = new Date();
  let value = baseValue;

  for (let i = points; i >= 0; i--) {
    value = baseValue + (Math.random() - 0.5) * variance;
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: parseFloat(value.toFixed(2)),
    });
  }
  return data;
};

export function EnvironmentalModule() {
  const [selectedZone, setSelectedZone] = useState(mockZones[0]);
  const [tempTrend, setTempTrend] = useState(generateTrendData(21.2, 1));
  const [humidityTrend, setHumidityTrend] = useState(generateTrendData(45, 5));

  useEffect(() => {
    const interval = setInterval(() => {
      setTempTrend((prev) => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1].value;
        newData.push({
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          value: parseFloat((lastValue + (Math.random() - 0.5) * 0.3).toFixed(2)),
        });
        return newData;
      });

      setHumidityTrend((prev) => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1].value;
        newData.push({
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          value: parseFloat((lastValue + (Math.random() - 0.5) * 1).toFixed(2)),
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "text-destructive";
    if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return "text-status-warning";
    return "text-status-normal";
  };

  const getProgressValue = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Zone Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockZones.map((zone) => (
          <Card
            key={zone.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedZone.id === zone.id && "ring-2 ring-primary",
              zone.status === "warning" && "border-status-warning",
              zone.status === "critical" && "border-destructive"
            )}
            onClick={() => setSelectedZone(zone)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate">{zone.name}</span>
                {zone.status === "normal" ? (
                  <CheckCircle className="w-4 h-4 text-status-normal" />
                ) : (
                  <AlertTriangle className={cn("w-4 h-4", zone.status === "warning" ? "text-status-warning" : "text-destructive")} />
                )}
              </div>
              <Badge variant="secondary" className="mb-2">{zone.classification}</Badge>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Temp:</span>
                  <span className={cn("ml-1 font-mono", getStatusColor(zone.temperature.value, zone.temperature.min, zone.temperature.max))}>
                    {zone.temperature.value}{zone.temperature.unit}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">RH:</span>
                  <span className={cn("ml-1 font-mono", getStatusColor(zone.humidity.value, zone.humidity.min, zone.humidity.max))}>
                    {zone.humidity.value}{zone.humidity.unit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Zone Detail */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedZone.name}</CardTitle>
              <Badge>{selectedZone.classification}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <span className={cn("font-mono text-lg font-bold", getStatusColor(selectedZone.temperature.value, selectedZone.temperature.min, selectedZone.temperature.max))}>
                  {selectedZone.temperature.value}{selectedZone.temperature.unit}
                </span>
              </div>
              <Progress value={getProgressValue(selectedZone.temperature.value, selectedZone.temperature.min, selectedZone.temperature.max)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{selectedZone.temperature.min}{selectedZone.temperature.unit}</span>
                <span>{selectedZone.temperature.max}{selectedZone.temperature.unit}</span>
              </div>
            </div>

            {/* Humidity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <span className={cn("font-mono text-lg font-bold", getStatusColor(selectedZone.humidity.value, selectedZone.humidity.min, selectedZone.humidity.max))}>
                  {selectedZone.humidity.value}{selectedZone.humidity.unit}
                </span>
              </div>
              <Progress value={getProgressValue(selectedZone.humidity.value, selectedZone.humidity.min, selectedZone.humidity.max)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{selectedZone.humidity.min}{selectedZone.humidity.unit}</span>
                <span>{selectedZone.humidity.max}{selectedZone.humidity.unit}</span>
              </div>
            </div>

            {/* Pressure */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Differential Pressure</span>
                </div>
                <span className={cn("font-mono text-lg font-bold", getStatusColor(selectedZone.pressure.value, selectedZone.pressure.min, selectedZone.pressure.max))}>
                  {selectedZone.pressure.value}{selectedZone.pressure.unit}
                </span>
              </div>
              <Progress value={getProgressValue(selectedZone.pressure.value, selectedZone.pressure.min, selectedZone.pressure.max)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{selectedZone.pressure.min}{selectedZone.pressure.unit}</span>
                <span>{selectedZone.pressure.max}{selectedZone.pressure.unit}</span>
              </div>
            </div>

            {/* Particle Count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Particle Count (0.5μm)</span>
                </div>
                <span className="font-mono text-lg font-bold text-status-normal">
                  {selectedZone.particleCount.value.toLocaleString()}
                </span>
              </div>
              <Progress value={(selectedZone.particleCount.value / selectedZone.particleCount.limit) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>Limit: {selectedZone.particleCount.limit.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Environmental Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="temperature" className="space-y-4">
              <TabsList>
                <TabsTrigger value="temperature">Temperature</TabsTrigger>
                <TabsTrigger value="humidity">Humidity</TabsTrigger>
              </TabsList>

              <TabsContent value="temperature">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tempTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        domain={[selectedZone.temperature.min - 1, selectedZone.temperature.max + 1]}
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <ReferenceLine y={selectedZone.temperature.max} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                      <ReferenceLine y={selectedZone.temperature.min} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
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
              </TabsContent>

              <TabsContent value="humidity">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={humidityTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        domain={[selectedZone.humidity.min - 5, selectedZone.humidity.max + 5]}
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <ReferenceLine y={selectedZone.humidity.max} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                      <ReferenceLine y={selectedZone.humidity.min} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--data-secondary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* HVAC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">HVAC System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: "AHU-1", status: "running", load: 78, filter: 85 },
              { name: "AHU-2", status: "running", load: 65, filter: 92 },
              { name: "Chiller-1", status: "running", load: 82, filter: null },
              { name: "Chiller-2", status: "standby", load: 0, filter: null },
            ].map((unit) => (
              <div key={unit.name} className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{unit.name}</span>
                  <Badge variant={unit.status === "running" ? "default" : "secondary"}>
                    {unit.status}
                  </Badge>
                </div>
                {unit.load !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Load</span>
                      <span className="font-mono">{unit.load}%</span>
                    </div>
                    <Progress value={unit.load} className="h-1" />
                  </div>
                )}
                {unit.filter !== null && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Filter Life</span>
                      <span className={cn("font-mono", unit.filter < 30 && "text-status-warning")}>{unit.filter}%</span>
                    </div>
                    <Progress value={unit.filter} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}