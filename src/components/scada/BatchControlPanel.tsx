import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  StopCircle,
  SkipForward,
  CheckCircle,
  AlertTriangle,
  Package,
  User,
  Clock,
  FlaskConical,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Batch, BatchState, MaterialLot, QualityCheck } from "@/types/scada";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface BatchControlPanelProps {
  batch: Batch | null;
  onStart: (batchId: string) => void;
  onHold: (batchId: string, reason: string) => void;
  onResume: (batchId: string) => void;
  onComplete: (batchId: string) => void;
  onAbort: (batchId: string, reason: string) => void;
  onAdvancePhase: (batchId: string, nextPhaseId: string, nextPhaseName: string) => void;
  onVerifyMaterial: (batchId: string, material: MaterialLot) => void;
  onRecordQualityCheck: (batchId: string, check: QualityCheck) => void;
  className?: string;
}

const statusConfig: Record<BatchState, { color: string; bgColor: string; label: string }> = {
  idle: {
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    label: "IDLE",
  },
  running: {
    color: "text-status-running",
    bgColor: "bg-status-running/10",
    label: "RUNNING",
  },
  holding: {
    color: "text-status-warning",
    bgColor: "bg-status-warning/10",
    label: "HOLDING",
  },
  held: {
    color: "text-status-warning",
    bgColor: "bg-status-warning/10",
    label: "HELD",
  },
  complete: {
    color: "text-status-normal",
    bgColor: "bg-status-normal/10",
    label: "COMPLETE",
  },
  aborted: {
    color: "text-status-critical",
    bgColor: "bg-status-critical/10",
    label: "ABORTED",
  },
};

const phases = [
  { id: "phase-1", name: "Initialization", order: 1 },
  { id: "phase-2", name: "Material Prep", order: 2 },
  { id: "phase-3", name: "Processing", order: 3 },
  { id: "phase-4", name: "Quality Check", order: 4 },
  { id: "phase-5", name: "Completion", order: 5 },
];

export function BatchControlPanel({
  batch,
  onStart,
  onHold,
  onResume,
  onComplete,
  onAbort,
  onAdvancePhase,
  onVerifyMaterial,
  onRecordQualityCheck,
  className,
}: BatchControlPanelProps) {
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [abortReason, setAbortReason] = useState("");
  const [showQualityDialog, setShowQualityDialog] = useState(false);

  // Mock unverified materials
  const [pendingMaterials] = useState<MaterialLot[]>([
    {
      id: "MAT-001",
      partNumber: "CATH-TUBE-01",
      lotNumber: "LOT-2024-0847",
      quantity: 500,
      unit: "pcs",
      expiryDate: new Date("2025-06-15"),
      verified: false,
    },
    {
      id: "MAT-002",
      partNumber: "CONNECTOR-A1",
      lotNumber: "LOT-2024-0923",
      quantity: 250,
      unit: "pcs",
      expiryDate: new Date("2025-08-20"),
      verified: false,
    },
  ]);

  const handleHold = () => {
    if (batch && holdReason) {
      onHold(batch.id, holdReason);
      setHoldReason("");
      setShowHoldDialog(false);
    }
  };

  const handleAbort = () => {
    if (batch && abortReason) {
      onAbort(batch.id, abortReason);
      setAbortReason("");
      setShowAbortDialog(false);
    }
  };

  const handleAdvancePhase = () => {
    if (batch) {
      const currentPhaseIndex = phases.findIndex((p) => p.id === batch.currentPhaseId);
      if (currentPhaseIndex < phases.length - 1) {
        const nextPhase = phases[currentPhaseIndex + 1];
        onAdvancePhase(batch.id, nextPhase.id, nextPhase.name);
      }
    }
  };

  const handleQualityPass = () => {
    if (batch) {
      const check: QualityCheck = {
        id: `QC-${Date.now()}`,
        checkpointName: batch.currentPhaseName,
        scheduledAt: new Date(),
        completedAt: new Date(),
        operator: "J. Smith",
        result: "pass",
        measurements: [
          { name: "Dimension A", value: 12.4, unit: "mm", spec: "12.5 ± 0.2" },
          { name: "Weight", value: 45.2, unit: "g", spec: "45 ± 1" },
        ],
      };
      onRecordQualityCheck(batch.id, check);
      setShowQualityDialog(false);
    }
  };

  if (!batch) {
    return (
      <div className={cn("scada-panel p-6 text-center", className)}>
        <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-muted-foreground">No Active Batch</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Select or create a batch to begin production
        </p>
      </div>
    );
  }

  const config = statusConfig[batch.status];
  const currentPhaseIndex = phases.findIndex((p) => p.id === batch.currentPhaseId);
  const canAdvance = batch.status === "running" && batch.phaseProgress >= 95;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("scada-panel", className)}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-mono font-bold text-foreground">
                  {batch.batchNumber}
                </h3>
                <Badge className={cn("uppercase font-mono", config.bgColor, config.color)}>
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{batch.productName}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="control" className="flex-1">
          <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="p-4 space-y-4">
            {/* Batch Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground text-xs">Recipe</span>
                  <div className="font-mono text-foreground">{batch.recipeName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground text-xs">Operator</span>
                  <div className="font-mono text-foreground">{batch.operatorName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground text-xs">Start Time</span>
                  <div className="font-mono text-foreground">
                    {batch.startTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground text-xs">Current Phase</span>
                  <div className="font-mono text-primary">{batch.currentPhaseName}</div>
                </div>
              </div>
            </div>

            {/* Phase Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Phase Progress</span>
                <span className={config.color}>{Math.round(batch.phaseProgress)}%</span>
              </div>
              <Progress value={batch.phaseProgress} className="h-2" />
            </div>

            {/* Phase Steps */}
            <div className="flex items-center gap-1">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-colors",
                    index < currentPhaseIndex && "bg-status-normal",
                    index === currentPhaseIndex && batch.status === "running" && "bg-status-running animate-pulse",
                    index === currentPhaseIndex && batch.status === "holding" && "bg-status-warning",
                    index > currentPhaseIndex && "bg-muted"
                  )}
                  title={phase.name}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{phases[0].name}</span>
              <span>{phases[phases.length - 1].name}</span>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className={config.color}>{batch.overallProgress}%</span>
              </div>
              <Progress value={batch.overallProgress} className="h-3" />
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {batch.status === "idle" && (
                <Button onClick={() => onStart(batch.id)} className="flex-1">
                  <Play className="w-4 h-4 mr-1" />
                  Start Batch
                </Button>
              )}
              {batch.status === "running" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowHoldDialog(true)}
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Hold
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAdvancePhase}
                    disabled={!canAdvance}
                    className="flex-1"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Next Phase
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowQualityDialog(true)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Quality Check
                  </Button>
                </>
              )}
              {batch.status === "holding" && (
                <Button onClick={() => onResume(batch.id)} className="flex-1">
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              )}
              {(batch.status === "running" || batch.status === "holding") && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setShowAbortDialog(true)}
                    className="flex-1"
                  >
                    <StopCircle className="w-4 h-4 mr-1" />
                    Abort
                  </Button>
                  {currentPhaseIndex === phases.length - 1 && batch.phaseProgress >= 95 && (
                    <Button onClick={() => onComplete(batch.id)} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="p-4 space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              Scan or verify materials before use
            </div>
            {pendingMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  material.verified
                    ? "border-status-normal/30 bg-status-normal/5"
                    : "border-status-warning/30 bg-status-warning/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm font-medium">{material.partNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      Lot: {material.lotNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {material.quantity} {material.unit} | Exp:{" "}
                      {material.expiryDate.toLocaleDateString()}
                    </div>
                  </div>
                  {!material.verified ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onVerifyMaterial(batch.id, material)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verify
                    </Button>
                  ) : (
                    <Badge className="bg-status-normal/20 text-status-normal">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="quality" className="p-4 space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              Quality checkpoints and inspection results
            </div>
            {batch.qualityChecks.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No quality checks recorded</p>
              </div>
            ) : (
              batch.qualityChecks.map((check) => (
                <div
                  key={check.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    check.result === "pass" && "border-status-normal/30 bg-status-normal/5",
                    check.result === "fail" && "border-status-critical/30 bg-status-critical/5",
                    check.result === "pending" && "border-muted bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{check.checkpointName}</div>
                      <div className="text-xs text-muted-foreground">
                        {check.completedAt?.toLocaleString() || "Pending"}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        check.result === "pass" && "bg-status-normal/20 text-status-normal",
                        check.result === "fail" && "bg-status-critical/20 text-status-critical",
                        check.result === "pending" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {check.result.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Hold Dialog */}
      <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold Batch</DialogTitle>
            <DialogDescription>
              Please provide a reason for holding this batch. The batch will be paused until
              resumed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="Hold reason..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHoldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleHold} disabled={!holdReason}>
              <Pause className="w-4 h-4 mr-1" />
              Hold Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abort Dialog */}
      <Dialog open={showAbortDialog} onOpenChange={setShowAbortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-status-critical">
              <AlertTriangle className="w-5 h-5" />
              Abort Batch
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All batch data will be preserved for investigation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={abortReason}
              onChange={(e) => setAbortReason(e.target.value)}
              placeholder="Abort reason (required)..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbortDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleAbort} disabled={!abortReason}>
              <StopCircle className="w-4 h-4 mr-1" />
              Abort Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quality Check Dialog */}
      <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quality Checkpoint</DialogTitle>
            <DialogDescription>
              Record quality inspection results for {batch.currentPhaseName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Dimension A (mm)</Label>
                <Input defaultValue="12.4" className="font-mono" />
                <span className="text-xs text-muted-foreground">Spec: 12.5 ± 0.2</span>
              </div>
              <div>
                <Label className="text-xs">Weight (g)</Label>
                <Input defaultValue="45.2" className="font-mono" />
                <span className="text-xs text-muted-foreground">Spec: 45 ± 1</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQualityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleQualityPass}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Record Pass
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
