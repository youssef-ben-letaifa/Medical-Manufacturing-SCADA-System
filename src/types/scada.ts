// ============= SCADA System Types =============

// Core Status Types
export type SystemStatus = "normal" | "warning" | "critical" | "offline" | "running";
export type AlarmPriority = "critical" | "high" | "medium" | "low";
export type AlarmState = "active" | "acknowledged" | "cleared" | "shelved";
export type BatchState = "idle" | "running" | "holding" | "held" | "complete" | "aborted";
export type EquipmentState = "available" | "in_use" | "maintenance" | "fault" | "calibration_due";
export type PhaseStatus = "pending" | "running" | "complete" | "skipped";

// Batch Phase for execution tracking
export interface BatchPhase {
  id: string;
  name: string;
  order: number;
  status: PhaseStatus;
  targetDuration: number; // minutes
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
}

// Extended Material for batch UI
export interface BatchMaterial {
  id: string;
  name: string;
  partNumber: string;
  lotNumber?: string;
  quantityRequired: number;
  unit: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}
export type ChangeType = "minor" | "major";
export type ChangeStatus = "draft" | "pending_review" | "approved" | "rejected" | "implemented" | "closed";

// User & Authentication
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "operator" | "supervisor" | "engineer" | "quality" | "maintenance" | "admin";
  department: string;
  lastLogin: Date;
  active: boolean;
}

// Audit Trail
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  targetType: "alarm" | "batch" | "equipment" | "recipe" | "change" | "user" | "system";
  targetId: string;
  targetName: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  workstation: string;
}

// Alarm System
export interface Alarm {
  id: string;
  timestamp: Date;
  priority: AlarmPriority;
  state: AlarmState;
  source: string;
  sourceId: string;
  message: string;
  value?: number;
  limitValue?: number;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  clearedAt?: Date;
  shelvedUntil?: Date;
  shelvedReason?: string;
  escalationLevel: number;
}

// Equipment Management
export interface Equipment {
  id: string;
  name: string;
  type: "press" | "cnc" | "robot" | "autoclave" | "packaging" | "assembly" | "testing";
  location: string;
  status: EquipmentState;
  operationalStatus: SystemStatus;
  calibrationDueDate: Date;
  maintenanceDueDate: Date;
  lastMaintenanceDate: Date;
  runtime: number; // hours
  cycleCount: number;
  metrics: EquipmentMetric[];
}

export interface EquipmentMetric {
  label: string;
  value: string | number;
  unit?: string;
  status?: SystemStatus;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: "preventive" | "corrective" | "calibration";
  scheduledDate: Date;
  completedDate?: Date;
  assignedTo: string;
  status: "scheduled" | "in_progress" | "complete" | "overdue";
  description: string;
  findings?: string;
  partsReplaced?: string[];
  signedBy?: string;
}

// Batch Management (ISA-88)
export interface Recipe {
  id: string;
  name: string;
  version: string;
  productCode: string;
  description: string;
  status: "draft" | "active" | "archived";
  phases: RecipePhase[];
  parameters: RecipeParameter[];
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface RecipePhase {
  id: string;
  name: string;
  order: number;
  description: string;
  duration: number; // minutes
  parameters: RecipeParameter[];
  transitions: PhaseTransition[];
}

export interface PhaseTransition {
  condition: string;
  targetPhaseId: string;
}

export interface RecipeParameter {
  name: string;
  value: number | string;
  unit?: string;
  min?: number;
  max?: number;
  tolerance?: number;
}

export interface Batch {
  id: string;
  batchNumber: string;
  recipeId: string;
  recipeName: string;
  recipeVersion?: string;
  productName: string;
  status: BatchState;
  currentPhaseId: string;
  currentPhaseName: string;
  phaseProgress: number;
  overallProgress: number;
  startTime: Date;
  endTime?: Date;
  operatorId: string;
  operatorName: string;
  equipmentIds: string[];
  materialLots: MaterialLot[];
  qualityChecks: QualityCheck[];
  deviations: BatchDeviation[];
  parameters: BatchParameter[];
  // Extended properties for UI
  phases?: BatchPhase[];
  materials?: BatchMaterial[];
}

export interface MaterialLot {
  id: string;
  partNumber: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface QualityCheck {
  id: string;
  checkpointName: string;
  type?: string;
  scheduledAt: Date;
  completedAt?: Date;
  operator?: string;
  result: "pending" | "pass" | "fail" | "deviation";
  measuredValue?: number | string;
  specification?: string;
  measurements?: { name: string; value: number; unit: string; spec: string }[];
  comments?: string;
}

export interface BatchDeviation {
  id: string;
  timestamp: Date;
  type: "process" | "quality" | "equipment" | "material";
  description: string;
  severity: "minor" | "major" | "critical";
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface BatchParameter {
  name: string;
  setpoint: number;
  actual: number;
  unit: string;
  status: "in_spec" | "warning" | "out_of_spec";
}

// Change Management System
export interface ChangeRecord {
  id: string;
  changeNumber: string;
  title: string;
  description: string;
  type: ChangeType;
  status: ChangeStatus;
  category: "software" | "hardware" | "process" | "recipe" | "user" | "documentation";
  requestedBy: string;
  requestedAt: Date;
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  implementedBy?: string;
  implementedAt?: Date;
  closedBy?: string;
  closedAt?: Date;
  affectedSystems: string[];
  validationRequired: boolean;
  validationStatus?: "not_started" | "in_progress" | "complete" | "failed";
  validationNotes?: string;
  riskAssessment?: string;
  rollbackPlan?: string;
  attachments: string[];
  comments: ChangeComment[];
}

export interface ChangeComment {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  content: string;
}

// Environmental Monitoring
export interface EnvironmentalZone {
  id: string;
  name: string;
  cleanroomClass: string;
  temperature: { value: number; unit: string; min: number; max: number; status: SystemStatus };
  humidity: { value: number; min: number; max: number; status: SystemStatus };
  pressure: { value: number; unit: string; min: number; max: number; status: SystemStatus };
  particleCount: { value: number; max: number; status: SystemStatus };
}

// Production Statistics
export interface ProductionStats {
  shiftId: string;
  date: Date;
  totalUnits: number;
  goodUnits: number;
  rejectedUnits: number;
  targetUnits: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  cycleTime: number;
  downtime: DowntimeEvent[];
}

export interface DowntimeEvent {
  id: string;
  equipmentId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  reason: string;
  category: "planned" | "unplanned" | "changeover" | "maintenance";
}

// KPIs
export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  status: SystemStatus;
}
