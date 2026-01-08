import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SystemHeader, NavigationSidebar } from "@/components/scada";
import {
  ProductionModule,
  EquipmentModule,
  AlarmsModule,
  TrendsModule,
  BatchModule,
  EnvironmentalModule,
  UtilitiesModule,
  ReportsModule,
  OverviewModule,
} from "@/components/scada/modules";
import {
  useAlarmManagement,
  useBatchManagement,
  useEquipmentManagement,
} from "@/hooks/useScadaState";
import { Alarm, Equipment } from "@/types/scada";

// Generate trend data
const generateTrendData = (points: number, baseValue: number, variance: number) => {
  const data = [];
  let value = baseValue;
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    value = baseValue + (Math.random() - 0.5) * variance;
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: Math.max(0, value),
    });
  }
  return data;
};

// Initial alarms
const initialAlarms: Alarm[] = [
  {
    id: "ALM001",
    timestamp: new Date(Date.now() - 300000),
    priority: "critical",
    state: "active",
    source: "MOLDING.PRESS01.TEMP_BARREL",
    sourceId: "MOLDING.PRESS01",
    message: "Temperature exceeded high-high limit (285°C > 280°C)",
    value: 285,
    limitValue: 280,
    escalationLevel: 0,
  },
  {
    id: "ALM002",
    timestamp: new Date(Date.now() - 500000),
    priority: "high",
    state: "active",
    source: "CLEANROOM.ZONE_A.PRESSURE",
    sourceId: "CLEANROOM.ZONE_A",
    message: "Differential pressure below setpoint",
    value: 0.032,
    limitValue: 0.040,
    escalationLevel: 0,
  },
  {
    id: "ALM003",
    timestamp: new Date(Date.now() - 900000),
    priority: "medium",
    state: "acknowledged",
    source: "PACKAGING.LINE_2.SENSOR_03",
    sourceId: "PACKAGING.LINE_2",
    message: "Sensor calibration due in 3 days",
    acknowledgedBy: "J. Smith",
    acknowledgedAt: new Date(Date.now() - 800000),
    escalationLevel: 0,
  },
  {
    id: "ALM004",
    timestamp: new Date(Date.now() - 1200000),
    priority: "high",
    state: "active",
    source: "STERILIZER.UNIT_01.CYCLE",
    sourceId: "STERILIZER.UNIT_01",
    message: "Cycle time deviation detected",
    escalationLevel: 1,
  },
  {
    id: "ALM005",
    timestamp: new Date(Date.now() - 1800000),
    priority: "low",
    state: "acknowledged",
    source: "ASSEMBLY.STATION_04.TORQUE",
    sourceId: "ASSEMBLY.STATION_04",
    message: "Torque measurement near lower warning limit",
    acknowledgedBy: "M. Johnson",
    acknowledgedAt: new Date(Date.now() - 1700000),
    escalationLevel: 0,
  },
];

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState("overview");
  const [trendData, setTrendData] = useState(generateTrendData(30, 245, 10));

  // Initialize state management hooks
  const {
    alarms,
    activeAlarms,
    criticalCount,
    auditLog,
    acknowledgeAlarm,
    acknowledgeAllAlarms,
    shelveAlarm,
    clearAlarm,
    generateAlarm,
    addAuditEntry,
  } = useAlarmManagement(initialAlarms);

  const {
    batches,
    activeBatch,
    setActiveBatch,
    createBatch,
    startBatch,
    holdBatch,
    resumeBatch,
    completeBatch,
    abortBatch,
    advancePhase,
    verifyMaterial,
    recordQualityCheck,
  } = useBatchManagement(addAuditEntry);

  const { equipment, setEquipment, updateEquipmentStatus } = useEquipmentManagement(addAuditEntry);

  // Initialize equipment
  useEffect(() => {
    setEquipment([
      {
        id: "MOLDING.PRESS01",
        name: "Injection Press #1",
        type: "press",
        location: "Building A",
        status: "in_use",
        operationalStatus: "running",
        calibrationDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maintenanceDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        lastMaintenanceDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        runtime: 2847,
        cycleCount: 124500,
        metrics: [
          { label: "Barrel Temp", value: "248°C" },
          { label: "Clamp Force", value: "85 tons" },
        ],
      },
      {
        id: "MOLDING.PRESS02",
        name: "Injection Press #2",
        type: "press",
        location: "Building A",
        status: "in_use",
        operationalStatus: "warning",
        calibrationDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maintenanceDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        lastMaintenanceDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
        runtime: 3124,
        cycleCount: 138200,
        metrics: [
          { label: "Barrel Temp", value: "252°C" },
          { label: "Clamp Force", value: "78 tons" },
        ],
      },
      {
        id: "CNC.MACH01",
        name: "CNC Machine Center",
        type: "cnc",
        location: "Building A",
        status: "available",
        operationalStatus: "normal",
        calibrationDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        maintenanceDueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        lastMaintenanceDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        runtime: 1567,
        cycleCount: 45200,
        metrics: [
          { label: "Spindle Speed", value: "8,500 RPM" },
          { label: "Feed Rate", value: "2.4 m/min" },
        ],
      },
      {
        id: "ASSEMBLY.STA01",
        name: "Assembly Station #1",
        type: "assembly",
        location: "Building B",
        status: "in_use",
        operationalStatus: "running",
        calibrationDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        maintenanceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastMaintenanceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        runtime: 892,
        cycleCount: 89400,
        metrics: [
          { label: "Cycle Count", value: "1,247" },
          { label: "Avg Cycle", value: "12.3s" },
        ],
      },
      {
        id: "STERILIZER.U01",
        name: "Autoclave Unit #1",
        type: "autoclave",
        location: "Building C",
        status: "fault",
        operationalStatus: "critical",
        calibrationDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        maintenanceDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastMaintenanceDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
        runtime: 4521,
        cycleCount: 8920,
        metrics: [
          { label: "Chamber Temp", value: "121°C" },
          { label: "Pressure", value: "15 psi" },
        ],
      },
      {
        id: "PACKAGING.LN01",
        name: "Packaging Line #1",
        type: "packaging",
        location: "Building D",
        status: "available",
        operationalStatus: "normal",
        calibrationDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        maintenanceDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        lastMaintenanceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        runtime: 1234,
        cycleCount: 234500,
        metrics: [
          { label: "Units/hr", value: "450" },
          { label: "Efficiency", value: "94.2%" },
        ],
      },
    ]);
  }, [setEquipment]);

  // Initialize with a sample batch
  useEffect(() => {
    if (batches.length === 0) {
      const batch = createBatch(
        "BATCH-2024-0847",
        "RCP-001",
        "CATH-A-R003",
        "Catheter Assembly - Type A",
        ["MOLDING.PRESS01", "ASSEMBLY.STA01"]
      );
      startBatch(batch.id);
      setActiveBatch(batch);
    }
  }, [batches.length, createBatch, startBatch, setActiveBatch]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendData((prev) => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 5;
        newData.push({
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          value: Math.max(220, Math.min(270, newValue)),
        });
        return newData;
      });

      // Random alarm generation (low probability)
      if (Math.random() < 0.02) {
        const priorities: Array<"critical" | "high" | "medium" | "low"> = ["high", "medium", "low"];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        generateAlarm(priority, "SYSTEM.MONITOR", "Simulated test alarm for demonstration");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [generateAlarm]);

  const handleCreateBatch = (batchNumber: string, recipeId: string, productCode: string, productName: string, equipmentIds: string[]) => {
    const batch = createBatch(batchNumber, recipeId, productCode, productName, equipmentIds);
    setActiveBatch(batch);
    return batch;
  };

  const renderModule = () => {
    switch (activeNav) {
      case "overview":
        return (
          <OverviewModule
            alarms={alarms}
            batches={batches}
            equipment={equipment}
            trendData={trendData}
          />
        );
      case "production":
        return <ProductionModule />;
      case "equipment":
        return <EquipmentModule />;
      case "alarms":
        return (
          <AlarmsModule
            alarms={alarms}
            onAcknowledge={acknowledgeAlarm}
            onShelve={shelveAlarm}
            onAcknowledgeAll={acknowledgeAllAlarms}
          />
        );
      case "trends":
        return <TrendsModule />;
      case "batch":
        return (
          <BatchModule
            batches={batches}
            activeBatch={activeBatch}
            onStartBatch={startBatch}
            onHoldBatch={(id, reason) => holdBatch(id, reason || "Manual hold")}
            onResumeBatch={resumeBatch}
            onCompleteBatch={completeBatch}
            onAbortBatch={(id, reason) => abortBatch(id, reason || "Manual abort")}
            onAdvancePhase={(id, nextPhaseId, nextPhaseName) => advancePhase(id, nextPhaseId || "next", nextPhaseName || "Next Phase")}
            onCreateBatch={handleCreateBatch}
          />
        );
      case "environmental":
        return <EnvironmentalModule />;
      case "utilities":
        return <UtilitiesModule />;
      case "reports":
        return <ReportsModule />;
      default:
        return (
          <OverviewModule
            alarms={alarms}
            batches={batches}
            equipment={equipment}
            trendData={trendData}
          />
        );
    }
  };

  const activeAlarmsCount = alarms.filter((a) => a.state === "active").length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        activeItem={activeNav}
        onItemClick={setActiveNav}
        alarmCount={activeAlarmsCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <SystemHeader
          systemName="MedDevice SCADA"
          plantName="Medical Device Manufacturing Facility"
          operatorName="J. Smith"
          criticalAlarms={criticalCount}
          highAlarms={alarms.filter((a) => a.priority === "high" && a.state === "active").length}
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/30">
          <motion.div
            key={activeNav}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1800px] mx-auto"
          >
            {renderModule()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;