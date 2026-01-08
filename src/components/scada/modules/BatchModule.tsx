import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Box,
  Play,
  Pause,
  Square,
  SkipForward,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  FileText,
  Users,
  Scan,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Batch, BatchPhase, BatchMaterial } from "@/types/scada";

interface BatchModuleProps {
  batches: Batch[];
  activeBatch: Batch | null;
  onStartBatch: (batchId: string) => void;
  onHoldBatch: (batchId: string, reason?: string) => void;
  onResumeBatch: (batchId: string) => void;
  onCompleteBatch: (batchId: string) => void;
  onAbortBatch: (batchId: string, reason?: string) => void;
  onAdvancePhase: (batchId: string, nextPhaseId?: string, nextPhaseName?: string) => void;
  onCreateBatch: (batchNumber: string, recipeId: string, productCode: string, productName: string, equipmentIds: string[]) => Batch;
}

const mockRecipes = [
  { id: "RCP-001", name: "Catheter Assembly - Type A", version: "3.2" },
  { id: "RCP-002", name: "Syringe Housing Production", version: "2.1" },
  { id: "RCP-003", name: "Valve Component Molding", version: "1.5" },
];

const statusConfig = {
  idle: { color: "bg-muted-foreground", label: "Idle" },
  running: { color: "bg-status-normal", label: "Running" },
  holding: { color: "bg-status-warning", label: "Holding" },
  held: { color: "bg-status-warning", label: "Held" },
  complete: { color: "bg-primary", label: "Complete" },
  aborted: { color: "bg-destructive", label: "Aborted" },
};

export function BatchModule({
  batches,
  activeBatch,
  onStartBatch,
  onHoldBatch,
  onResumeBatch,
  onCompleteBatch,
  onAbortBatch,
  onAdvancePhase,
  onCreateBatch,
}: BatchModuleProps) {
  const [showNewBatchDialog, setShowNewBatchDialog] = useState(false);
  const [newBatchNumber, setNewBatchNumber] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(mockRecipes[0].id);
  const [showMaterialVerification, setShowMaterialVerification] = useState(false);
  const [scannedMaterial, setScannedMaterial] = useState("");

  const handleCreateBatch = () => {
    const recipe = mockRecipes.find((r) => r.id === selectedRecipe)!;
    onCreateBatch(
      newBatchNumber || `BATCH-${Date.now()}`,
      recipe.id,
      `PROD-${recipe.id}`,
      recipe.name,
      ["MOLDING.PRESS01"]
    );
    setNewBatchNumber("");
    setShowNewBatchDialog(false);
  };

  const phases = activeBatch?.phases ?? [];
  const currentPhaseIndex = phases.findIndex((p) => p.status === "running");
  const completedPhases = phases.filter((p) => p.status === "complete").length;
  const totalPhases = phases.length;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : activeBatch?.overallProgress ?? 0;

  return (
    <div className="space-y-6">
      {/* Batch Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-status-normal">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Active Batches</p>
            <p className="text-2xl font-bold font-mono">
              {batches.filter((b) => b.status === "running").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-status-warning">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">On Hold</p>
            <p className="text-2xl font-bold font-mono">
              {batches.filter((b) => b.status === "holding" || b.status === "held").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="text-2xl font-bold font-mono">
              {batches.filter((b) => b.status === "complete").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold font-mono">
              {batches.filter((b) => b.status === "idle").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Batch List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Batches</CardTitle>
              <Button size="sm" onClick={() => setShowNewBatchDialog(true)}>
                <Box className="w-4 h-4 mr-2" /> New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2">
                {batches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No batches</p>
                  </div>
                ) : (
                  batches.map((batch) => {
                    const config = statusConfig[batch.status];
                    const isActive = activeBatch?.id === batch.id;
                    return (
                      <motion.div
                        key={batch.id}
                        whileHover={{ x: 2 }}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-medium">{batch.batchNumber}</span>
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{batch.productName}</p>
                        {batch.status === "running" && batch.phases && batch.phases.length > 0 && (
                          <Progress value={(batch.phases.filter((p) => p.status === "complete").length / batch.phases.length) * 100} className="h-1" />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Batch Detail */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {activeBatch ? activeBatch.batchNumber : "No Active Batch"}
                </CardTitle>
                {activeBatch && (
                  <p className="text-sm text-muted-foreground">{activeBatch.productName}</p>
                )}
              </div>
              {activeBatch && (
                <Badge className={statusConfig[activeBatch.status].color}>
                  {statusConfig[activeBatch.status].label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!activeBatch ? (
              <div className="text-center py-12 text-muted-foreground">
                <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select or create a batch to view details</p>
              </div>
            ) : (
              <Tabs defaultValue="execution" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="execution">Execution</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="record">Batch Record</TabsTrigger>
                </TabsList>

                <TabsContent value="execution" className="space-y-4">
                  {/* Batch Controls */}
                  <div className="flex flex-wrap gap-2">
                    {activeBatch.status === "idle" && (
                      <Button onClick={() => onStartBatch(activeBatch.id)} className="gap-2">
                        <Play className="w-4 h-4" /> Start Batch
                      </Button>
                    )}
                    {activeBatch.status === "running" && (
                      <>
                        <Button variant="secondary" onClick={() => onHoldBatch(activeBatch.id)} className="gap-2">
                          <Pause className="w-4 h-4" /> Hold
                        </Button>
                        <Button variant="outline" onClick={() => onAdvancePhase(activeBatch.id)} className="gap-2">
                          <SkipForward className="w-4 h-4" /> Next Phase
                        </Button>
                      </>
                    )}
                    {activeBatch.status === "holding" && (
                      <Button onClick={() => onResumeBatch(activeBatch.id)} className="gap-2">
                        <Play className="w-4 h-4" /> Resume
                      </Button>
                    )}
                    {(activeBatch.status === "running" || activeBatch.status === "holding") && (
                      <>
                        <Button variant="default" onClick={() => onCompleteBatch(activeBatch.id)} className="gap-2">
                          <CheckCircle className="w-4 h-4" /> Complete
                        </Button>
                        <Button variant="destructive" onClick={() => onAbortBatch(activeBatch.id)} className="gap-2">
                          <Square className="w-4 h-4" /> Abort
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Progress */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Batch Progress</span>
                        <span className="font-mono text-sm">{completedPhases}/{totalPhases} phases</span>
                      </div>
                      <Progress value={progress} className="h-2 mb-4" />

                      {/* Phase List */}
                      <div className="space-y-2">
                        {(activeBatch.phases ?? []).map((phase, i) => (
                          <div
                            key={phase.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg",
                              phase.status === "running" && "bg-primary/10 border border-primary",
                              phase.status === "complete" && "bg-status-normal/10",
                              phase.status === "pending" && "bg-muted"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              phase.status === "complete" && "bg-status-normal text-white",
                              phase.status === "running" && "bg-primary text-white",
                              phase.status === "pending" && "bg-muted-foreground/30 text-muted-foreground"
                            )}>
                              {phase.status === "complete" ? "✓" : i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{phase.name}</p>
                              {phase.status === "running" && (
                                <p className="text-xs text-muted-foreground">
                                  Started: {phase.startTime?.toLocaleTimeString()}
                                </p>
                              )}
                              {phase.status === "complete" && (
                                <p className="text-xs text-status-normal">
                                  Duration: {phase.actualDuration}min
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {phase.targetDuration}min
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Batch Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Timing</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Started:</span>
                            <span className="font-mono">{activeBatch.startTime?.toLocaleTimeString() || "Not started"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Elapsed:</span>
                            <span className="font-mono">
                              {activeBatch.startTime
                                ? `${Math.floor((Date.now() - activeBatch.startTime.getTime()) / 60000)}min`
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Assignment</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Operator:</span>
                            <span>{activeBatch.operatorId || "Not assigned"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment:</span>
                            <span className="font-mono text-xs">{activeBatch.equipmentIds.join(", ")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Material Verification</h3>
                    <Button size="sm" onClick={() => setShowMaterialVerification(true)} className="gap-2">
                      <Scan className="w-4 h-4" /> Scan Material
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {(activeBatch.materials ?? []).map((material) => (
                          <div
                            key={material.id}
                            className={cn(
                              "flex items-center gap-4 p-3 rounded-lg border",
                              material.verified ? "border-status-normal bg-status-normal/5" : "border-border"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              material.verified ? "bg-status-normal text-white" : "bg-muted"
                            )}>
                              {material.verified ? <CheckCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{material.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Part: {material.partNumber} | Lot: {material.lotNumber || "Not scanned"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm">{material.quantityRequired} {material.unit}</p>
                              <p className="text-xs text-muted-foreground">Required</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quality Checkpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activeBatch.qualityChecks.map((check) => (
                          <div
                            key={check.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              check.result === "pass" && "border-status-normal bg-status-normal/5",
                              check.result === "fail" && "border-destructive bg-destructive/5",
                              !check.result && "border-border"
                            )}
                          >
                            <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">{check.checkpointName}</p>
                                {check.type && <p className="text-xs text-muted-foreground">Type: {check.type}</p>}
                              </div>
                              {check.result ? (
                                <Badge className={check.result === "pass" ? "bg-status-normal" : "bg-destructive"}>
                                  {check.result.toUpperCase()}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </div>
                            {check.measuredValue != null && (
                              <p className="text-sm mt-2">
                                Measured: <span className="font-mono">{check.measuredValue}</span>
                                {check.specification && (
                                  <span className="text-muted-foreground"> (Spec: {check.specification})</span>
                                )}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="record" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Electronic Batch Record</CardTitle>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="w-4 h-4" /> Export PDF
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Batch Number:</span>
                            <span className="font-mono ml-2">{activeBatch.batchNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recipe:</span>
                            <span className="ml-2">{activeBatch.recipeId}{activeBatch.recipeVersion ? ` v${activeBatch.recipeVersion}` : ""}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Product:</span>
                            <span className="ml-2">{activeBatch.productName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={statusConfig[activeBatch.status].color + " ml-2"}>
                              {statusConfig[activeBatch.status].label}
                            </Badge>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Batch Events</h4>
                          <div className="space-y-2">
                            {[
                              { time: activeBatch.startTime?.toLocaleTimeString() || "-", event: "Batch Created", user: "System" },
                              ...(activeBatch.startTime ? [{ time: activeBatch.startTime.toLocaleTimeString(), event: "Batch Started", user: activeBatch.operatorId || "System" }] : []),
                            ].map((entry, i) => (
                              <div key={i} className="flex items-center gap-4 text-sm">
                                <span className="font-mono text-muted-foreground w-20">{entry.time}</span>
                                <span className="flex-1">{entry.event}</span>
                                <span className="text-muted-foreground">{entry.user}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Batch Dialog */}
      <Dialog open={showNewBatchDialog} onOpenChange={setShowNewBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Batch Number</Label>
              <Input
                value={newBatchNumber}
                onChange={(e) => setNewBatchNumber(e.target.value)}
                placeholder="Auto-generated if empty"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Recipe</Label>
              <select
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md bg-background"
              >
                {mockRecipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} (v{recipe.version})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBatchDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBatch}>Create Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Verification Dialog */}
      <Dialog open={showMaterialVerification} onOpenChange={setShowMaterialVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <Scan className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Scan barcode or enter lot number</p>
            </div>
            <Input
              value={scannedMaterial}
              onChange={(e) => setScannedMaterial(e.target.value)}
              placeholder="Enter lot number..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialVerification(false)}>Cancel</Button>
            <Button onClick={() => setShowMaterialVerification(false)}>Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}