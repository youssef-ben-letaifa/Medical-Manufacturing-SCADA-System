import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Factory,
  Settings,
  Bell,
  Activity,
  Box,
  Thermometer,
  Zap,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeType?: "normal" | "warning" | "critical";
}

const navItems: NavItem[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "production", icon: Factory, label: "Production" },
  { id: "equipment", icon: Settings, label: "Equipment" },
  { id: "alarms", icon: Bell, label: "Alarms", badge: 5, badgeType: "critical" },
  { id: "trends", icon: Activity, label: "Trends" },
  { id: "batch", icon: Box, label: "Batch Control" },
  { id: "environmental", icon: Thermometer, label: "Environmental" },
  { id: "utilities", icon: Zap, label: "Utilities" },
  { id: "reports", icon: FileText, label: "Reports" },
];

interface NavigationSidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  className?: string;
  alarmCount?: number;
}

export function NavigationSidebar({
  activeItem = "overview",
  onItemClick,
  className,
  alarmCount = 0,
}: NavigationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = navItems.map((item) =>
    item.id === "alarms"
      ? { ...item, badge: alarmCount, badgeType: alarmCount > 0 ? "critical" as const : undefined }
      : item
  );

  return (
    <motion.nav
      initial={{ width: 240 }}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className={cn(
        "flex flex-col h-full",
        "bg-primary text-primary-foreground",
        className
      )}
    >
      {/* Logo Area */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">MedDevice SCADA</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onItemClick?.(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "transition-all duration-150",
                "text-sm font-medium",
                isActive
                  ? "bg-white text-primary shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded-full",
                        item.badgeType === "critical" && "bg-destructive text-white",
                        item.badgeType === "warning" && "bg-status-warning text-white",
                        (!item.badgeType || item.badgeType === "normal") && "bg-white/20 text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        {!isCollapsed && (
          <div className="text-xs text-white/60 font-mono">
            <div>SCADA v2.1.0</div>
            <div>FDA 21 CFR Part 11</div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}