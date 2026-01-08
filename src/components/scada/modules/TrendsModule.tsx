import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Clock,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendTag {
  id: string;
  name: string;
  description: string;
  unit: string;
  color: string;
  enabled: boolean;
  highLimit?: number;
  lowLimit?: number;
}

const availableTags: TrendTag[] = [
  { id: "temp1", name: "MOLDING.PRESS01.BARREL_TEMP_Z1", description: "Barrel Zone 1 Temperature", unit: "°C", color: "hsl(var(--data-primary))", enabled: true, highLimit: 260, lowLimit: 240 },
  { id: "temp2", name: "MOLDING.PRESS01.BARREL_TEMP_Z2", description: "Barrel Zone 2 Temperature", unit: "°C", color: "hsl(var(--data-secondary))", enabled: true, highLimit: 265, lowLimit: 245 },
  { id: "pressure", name: "MOLDING.PRESS01.INJ_PRESSURE", description: "Injection Pressure", unit: "bar", color: "hsl(var(--data-tertiary))", enabled: false, highLimit: 1600, lowLimit: 1200 },
  { id: "clamp", name: "MOLDING.PRESS01.CLAMP_FORCE", description: "Clamp Force", unit: "tons", color: "hsl(var(--data-quaternary))", enabled: false, highLimit: 90, lowLimit: 70 },
  { id: "cycle", name: "MOLDING.PRESS01.CYCLE_TIME", description: "Cycle Time", unit: "s", color: "hsl(142 71% 45%)", enabled: false },
  { id: "cleanroom_temp", name: "CLEANROOM.ZONE_A.TEMP", description: "Cleanroom Temperature", unit: "°C", color: "hsl(262 83% 58%)", enabled: false, highLimit: 23, lowLimit: 19 },
  { id: "cleanroom_humidity", name: "CLEANROOM.ZONE_A.HUMIDITY", description: "Cleanroom Humidity", unit: "%RH", color: "hsl(200 70% 50%)", enabled: false, highLimit: 55, lowLimit: 35 },
  { id: "cleanroom_pressure", name: "CLEANROOM.ZONE_A.PRESSURE", description: "Cleanroom Differential Pressure", unit: "Pa", color: "hsl(340 70% 50%)", enabled: false, highLimit: 25, lowLimit: 10 },
];

// Generate mock trend data
const generateTrendData = (points: number, tags: TrendTag[]) => {
  const data = [];
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const point: Record<string, number | string> = {
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      timestamp: time.getTime(),
    };

    tags.forEach((tag) => {
      if (tag.enabled) {
        let baseValue = 0;
        let variance = 0;

        switch (tag.id) {
          case "temp1":
            baseValue = 248;
            variance = 8;
            break;
          case "temp2":
            baseValue = 252;
            variance = 6;
            break;
          case "pressure":
            baseValue = 1420;
            variance = 100;
            break;
          case "clamp":
            baseValue = 85;
            variance = 5;
            break;
          case "cycle":
            baseValue = 12.4;
            variance = 0.5;
            break;
          case "cleanroom_temp":
            baseValue = 21;
            variance = 1;
            break;
          case "cleanroom_humidity":
            baseValue = 45;
            variance = 5;
            break;
          case "cleanroom_pressure":
            baseValue = 15;
            variance = 3;
            break;
        }

        point[tag.id] = parseFloat((baseValue + (Math.random() - 0.5) * variance).toFixed(2));
      }
    });

    data.push(point);
  }

  return data;
};

export function TrendsModule() {
  const [tags, setTags] = useState(availableTags);
  const [trendData, setTrendData] = useState<Record<string, number | string>[]>([]);
  const [timeRange, setTimeRange] = useState("30m");
  const [isLive, setIsLive] = useState(true);
  const [showLimits, setShowLimits] = useState(true);

  const enabledTags = tags.filter((t) => t.enabled);

  useEffect(() => {
    const points = timeRange === "5m" ? 5 : timeRange === "30m" ? 30 : timeRange === "1h" ? 60 : 120;
    setTrendData(generateTrendData(points, tags));
  }, [tags, timeRange]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTrendData((prev) => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        const point: Record<string, number | string> = {
          time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          timestamp: now.getTime(),
        };

        enabledTags.forEach((tag) => {
          const lastValue = prev[prev.length - 1]?.[tag.id] as number || 0;
          let variance = 0;

          switch (tag.id) {
            case "temp1":
            case "temp2":
              variance = 2;
              break;
            case "pressure":
              variance = 30;
              break;
            default:
              variance = 1;
          }

          point[tag.id] = parseFloat((lastValue + (Math.random() - 0.5) * variance).toFixed(2));
        });

        newData.push(point);
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, enabledTags]);

  const toggleTag = (tagId: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === tagId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const getStatistics = (tagId: string) => {
    const values = trendData.map((d) => d[tagId] as number).filter((v) => v !== undefined);
    if (values.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };

    return {
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      current: values[values.length - 1].toFixed(2),
    };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">Last 5 min</SelectItem>
              <SelectItem value="30m">Last 30 min</SelectItem>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="2h">Last 2 hours</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="gap-2"
          >
            <Activity className={cn("w-4 h-4", isLive && "animate-pulse")} />
            {isLive ? "Live" : "Paused"}
          </Button>

          <Button
            variant={showLimits ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLimits(!showLimits)}
          >
            Limits
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tag Selection */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={cn(
                      "p-2 rounded-lg border cursor-pointer transition-all",
                      tag.enabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={tag.enabled} />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-xs font-mono truncate">{tag.name.split(".").pop()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7 truncate">{tag.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Real-Time Trend</CardTitle>
              <div className="flex items-center gap-2">
                {isLive && (
                  <Badge variant="default" className="gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {enabledTags.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select tags to display trends</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
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
                    <Legend />
                    {enabledTags.map((tag) => (
                      <Line
                        key={tag.id}
                        type="monotone"
                        dataKey={tag.id}
                        name={`${tag.description} (${tag.unit})`}
                        stroke={tag.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                    {showLimits &&
                      enabledTags.map((tag) => (
                        <>
                          {tag.highLimit && (
                            <ReferenceLine
                              key={`${tag.id}-high`}
                              y={tag.highLimit}
                              stroke={tag.color}
                              strokeDasharray="5 5"
                              strokeOpacity={0.5}
                            />
                          )}
                          {tag.lowLimit && (
                            <ReferenceLine
                              key={`${tag.id}-low`}
                              y={tag.lowLimit}
                              stroke={tag.color}
                              strokeDasharray="5 5"
                              strokeOpacity={0.5}
                            />
                          )}
                        </>
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {enabledTags.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enabledTags.map((tag) => {
            const stats = getStatistics(tag.id);
            return (
              <Card key={tag.id} className="border-l-4" style={{ borderLeftColor: tag.color }}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="text-xs font-mono truncate">{tag.name.split(".").pop()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-mono ml-1">{stats.current} {tag.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg:</span>
                      <span className="font-mono ml-1">{stats.avg}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min:</span>
                      <span className="font-mono ml-1">{stats.min}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max:</span>
                      <span className="font-mono ml-1">{stats.max}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}