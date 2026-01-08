import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusIndicator } from "./StatusIndicator";
import { Activity, Clock, Users, Shield, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface SystemHeaderProps {
  systemName: string;
  plantName: string;
  operatorName?: string;
  criticalAlarms?: number;
  highAlarms?: number;
  className?: string;
}

export function SystemHeader({ systemName, plantName, operatorName, criticalAlarms = 0, highAlarms = 0, className }: SystemHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between px-6 py-3",
        "bg-gradient-to-r from-background via-card to-background",
        "border-b border-border",
        className
      )}
    >
      {/* Left: System Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {systemName}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">{plantName}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-border mx-2" />

        <StatusIndicator status="running" label="System Online" size="sm" />
      </div>

      {/* Center: Navigation indicators (could be expanded) */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active Users:</span>
          <span className="font-mono text-foreground">3</span>
          <Users className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Security:</span>
          <span className="font-mono text-status-normal">Level 2</span>
          <Shield className="w-4 h-4 text-status-normal" />
        </div>
      </div>

      {/* Right: Time & Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-status-normal" />
          ) : (
            <WifiOff className="w-4 h-4 text-status-critical status-pulse-critical" />
          )}
          <span className={cn(
            "text-xs font-mono uppercase",
            isOnline ? "text-status-normal" : "text-status-critical"
          )}>
            {isOnline ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="text-right">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-mono font-bold text-primary glow-text-cyan">
              {formatTime(currentTime)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </motion.header>
  );
}