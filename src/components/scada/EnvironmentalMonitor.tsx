import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Wind, Gauge } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";

interface EnvironmentalData {
  temperature: number;
  tempUnit: string;
  humidity: number;
  pressure: number;
  pressureUnit: string;
  particleCount: number;
  cleanroomClass: string;
}

interface EnvironmentalMonitorProps {
  data: EnvironmentalData;
  zoneName: string;
  className?: string;
}

export function EnvironmentalMonitor({
  data,
  zoneName,
  className,
}: EnvironmentalMonitorProps) {
  // Determine statuses based on typical cleanroom requirements
  const getTempStatus = () => {
    if (data.temperature < 18 || data.temperature > 24) return "warning";
    if (data.temperature < 16 || data.temperature > 26) return "critical";
    return "normal";
  };

  const getHumidityStatus = () => {
    if (data.humidity < 35 || data.humidity > 65) return "warning";
    if (data.humidity < 30 || data.humidity > 70) return "critical";
    return "normal";
  };

  const getPressureStatus = () => {
    if (data.pressure < 0.02 || data.pressure > 0.08) return "warning";
    if (data.pressure < 0.01) return "critical";
    return "normal";
  };

  const getParticleStatus = () => {
    if (data.particleCount > 3000) return "critical";
    if (data.particleCount > 2000) return "warning";
    return "normal";
  };

  const metrics = [
    {
      icon: Thermometer,
      label: "Temperature",
      value: data.temperature.toFixed(1),
      unit: data.tempUnit,
      status: getTempStatus(),
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: data.humidity.toFixed(1),
      unit: "%RH",
      status: getHumidityStatus(),
    },
    {
      icon: Gauge,
      label: "Pressure Diff",
      value: data.pressure.toFixed(3),
      unit: data.pressureUnit,
      status: getPressureStatus(),
    },
    {
      icon: Wind,
      label: "Particles (≥0.5µm)",
      value: data.particleCount.toLocaleString(),
      unit: "/m³",
      status: getParticleStatus(),
    },
  ];

  const statusTextClass = {
    normal: "text-status-normal",
    warning: "text-status-warning",
    critical: "text-status-critical",
    offline: "text-status-offline",
    running: "text-status-running",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("scada-panel p-4", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{zoneName}</h3>
          <span className="text-xs font-mono text-primary">
            {data.cleanroomClass}
          </span>
        </div>
        <StatusIndicator 
          status={metrics.some(m => m.status === "critical") ? "critical" : 
                  metrics.some(m => m.status === "warning") ? "warning" : "normal"} 
          size="md" 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={cn(
                "bg-secondary/50 rounded-lg p-3",
                metric.status === "critical" && "bg-status-critical/10 border border-status-critical/20",
                metric.status === "warning" && "bg-status-warning/10 border border-status-warning/20"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("w-3 h-3", statusTextClass[metric.status])} />
                <span className="text-xs text-muted-foreground truncate">
                  {metric.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-lg font-mono font-bold",
                  statusTextClass[metric.status]
                )}>
                  {metric.value}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {metric.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}