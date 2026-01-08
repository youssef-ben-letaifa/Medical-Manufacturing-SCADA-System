import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  unit = "",
  label,
  thresholds = { warning: 70, critical: 90 },
  className,
}: GaugeChartProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calculate angle (180 degree arc)
  const angle = (clampedPercentage / 100) * 180 - 90;
  
  // Determine status based on thresholds
  const getStatus = () => {
    if (percentage >= thresholds.critical) return "critical";
    if (percentage >= thresholds.warning) return "warning";
    return "normal";
  };
  
  const status = getStatus();
  
  const statusColors = {
    normal: {
      stroke: "hsl(var(--status-normal))",
      glow: "drop-shadow(0 0 8px hsl(var(--status-normal) / 0.6))",
      text: "text-status-normal glow-text-green",
    },
    warning: {
      stroke: "hsl(var(--status-warning))",
      glow: "drop-shadow(0 0 8px hsl(var(--status-warning) / 0.6))",
      text: "text-status-warning glow-text-amber",
    },
    critical: {
      stroke: "hsl(var(--status-critical))",
      glow: "drop-shadow(0 0 8px hsl(var(--status-critical) / 0.6))",
      text: "text-status-critical glow-text-red",
    },
  };

  const colors = statusColors[status];

  return (
    <div className={cn("metric-card flex flex-col items-center", className)}>
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </span>
      
      <div className="relative w-32 h-20">
        <svg
          viewBox="0 0 120 70"
          className="w-full h-full"
          style={{ filter: colors.glow }}
        >
          {/* Background arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <motion.path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: clampedPercentage / 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = (tick / 100) * 180 - 90;
            const innerRadius = 42;
            const outerRadius = 48;
            const x1 = 60 + innerRadius * Math.cos((tickAngle * Math.PI) / 180);
            const y1 = 60 + innerRadius * Math.sin((tickAngle * Math.PI) / 180);
            const x2 = 60 + outerRadius * Math.cos((tickAngle * Math.PI) / 180);
            const y2 = 60 + outerRadius * Math.sin((tickAngle * Math.PI) / 180);
            
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1"
                opacity="0.5"
              />
            );
          })}

          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ transformOrigin: "60px 60px" }}
          >
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="20"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="4"
              fill="hsl(var(--foreground))"
            />
          </motion.g>
        </svg>
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className={cn("text-2xl font-mono font-bold", colors.text)}>
          {value.toFixed(1)}
        </span>
        <span className="text-sm font-mono text-muted-foreground">{unit}</span>
      </div>
      
      <div className="flex justify-between w-full text-xs font-mono text-muted-foreground mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}