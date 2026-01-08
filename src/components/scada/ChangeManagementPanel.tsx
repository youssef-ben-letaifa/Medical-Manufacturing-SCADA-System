import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileEdit,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileCheck,
  FileLock,
  Send,
  Play,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangeRecord, ChangeType, ChangeStatus } from "@/types/scada";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChangeManagementPanelProps {
  changeRecords: ChangeRecord[];
  onCreateChange: (
    title: string,
    description: string,
    type: ChangeType,
    category: ChangeRecord["category"],
    affectedSystems: string[]
  ) => void;
  onSubmitForReview: (id: string) => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, reason: string) => void;
  onImplement: (id: string) => void;
  onClose: (id: string, notes?: string) => void;
  className?: string;
}

const statusConfig: Record<ChangeStatus, { icon: typeof FileEdit; color: string; label: string }> = {
  draft: { icon: FileEdit, color: "text-muted-foreground", label: "Draft" },
  pending_review: { icon: Clock, color: "text-status-warning", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "text-status-normal", label: "Approved" },
  rejected: { icon: XCircle, color: "text-status-critical", label: "Rejected" },
  implemented: { icon: Play, color: "text-status-info", label: "Implemented" },
  closed: { icon: Archive, color: "text-primary", label: "Closed" },
};

const typeConfig: Record<ChangeType, { color: string; label: string; description: string }> = {
  minor: {
    color: "bg-status-info/20 text-status-info border-status-info/30",
    label: "Minor",
    description: "No validation impact",
  },
  major: {
    color: "bg-status-warning/20 text-status-warning border-status-warning/30",
    label: "Major",
    description: "Requires re-validation",
  },
};

export function ChangeManagementPanel({
  changeRecords,
  onCreateChange,
  onSubmitForReview,
  onApprove,
  onReject,
  onImplement,
  onClose,
  className,
}: ChangeManagementPanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ChangeRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<ChangeType>("minor");
  const [newCategory, setNewCategory] = useState<ChangeRecord["category"]>("software");
  const [newAffectedSystems, setNewAffectedSystems] = useState("");

  const handleCreate = () => {
    if (newTitle && newDescription) {
      onCreateChange(
        newTitle,
        newDescription,
        newType,
        newCategory,
        newAffectedSystems.split(",").map((s) => s.trim()).filter(Boolean)
      );
      setNewTitle("");
      setNewDescription("");
      setNewType("minor");
      setNewCategory("software");
      setNewAffectedSystems("");
      setShowCreateDialog(false);
    }
  };

  const handleReject = () => {
    if (selectedRecord && rejectReason) {
      onReject(selectedRecord.id, rejectReason);
      setRejectReason("");
      setShowRejectDialog(false);
      setShowDetailDialog(false);
    }
  };

  const handleClose = () => {
    if (selectedRecord) {
      onClose(selectedRecord.id, closeNotes);
      setCloseNotes("");
      setShowCloseDialog(false);
      setShowDetailDialog(false);
    }
  };

  const pendingCount = changeRecords.filter((r) => r.status === "pending_review").length;
  const openCount = changeRecords.filter((r) => !["closed", "rejected"].includes(r.status)).length;

  return (
    <>
      <div className={cn("scada-panel flex flex-col", className)}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <FileEdit className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Change Management</h3>
              <div className="flex items-center gap-2 text-xs">
                {pendingCount > 0 && (
                  <span className="text-status-warning font-mono">{pendingCount} pending</span>
                )}
                <span className="text-muted-foreground font-mono">{openCount} open</span>
              </div>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-3 h-3 mr-1" />
            New Change
          </Button>
        </div>

        {/* Change Records List */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          <AnimatePresence>
            {changeRecords.slice(0, 10).map((record) => {
              const status = statusConfig[record.status];
              const type = typeConfig[record.type];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => {
                    setSelectedRecord(record);
                    setShowDetailDialog(true);
                  }}
                  className="p-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon className={cn("w-4 h-4 mt-1 flex-shrink-0", status.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary">
                          {record.changeNumber}
                        </span>
                        <Badge variant="outline" className={cn("text-xs", type.color)}>
                          {type.label}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">
                        {record.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{record.category}</span>
                        <span>•</span>
                        <span>{record.requestedBy}</span>
                        <span>•</span>
                        <span>{record.requestedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {changeRecords.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No change records</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Change Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Change Record</DialogTitle>
            <DialogDescription>
              Document a system change. Major changes require validation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Brief description of the change"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detailed description of the change and its purpose"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Change Type</Label>
                <Select value={newType} onValueChange={(v: ChangeType) => setNewType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">
                      <div className="flex items-center gap-2">
                        <span>Minor</span>
                        <span className="text-xs text-muted-foreground">- No validation</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="major">
                      <div className="flex items-center gap-2">
                        <span>Major</span>
                        <span className="text-xs text-muted-foreground">- Requires validation</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={newCategory}
                  onValueChange={(v: ChangeRecord["category"]) => setNewCategory(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="recipe">Recipe</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="systems">Affected Systems</Label>
              <Input
                id="systems"
                value={newAffectedSystems}
                onChange={(e) => setNewAffectedSystems(e.target.value)}
                placeholder="Comma-separated list (e.g., SCADA, PLC, HMI)"
              />
            </div>
            {newType === "major" && (
              <div className="flex items-center gap-2 p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-status-warning" />
                <span className="text-sm text-status-warning">
                  Major changes require IQ/OQ/PQ validation before closure
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newTitle || !newDescription}>
              Create Change Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-mono">{selectedRecord.changeNumber}</DialogTitle>
                  <Badge variant="outline" className={typeConfig[selectedRecord.type].color}>
                    {typeConfig[selectedRecord.type].label}
                  </Badge>
                </div>
                <DialogDescription>{selectedRecord.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const StatusIcon = statusConfig[selectedRecord.status].icon;
                      return (
                        <StatusIcon
                          className={cn("w-4 h-4", statusConfig[selectedRecord.status].color)}
                        />
                      );
                    })()}
                    <span className="font-medium">
                      {statusConfig[selectedRecord.status].label}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm mt-1">{selectedRecord.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Category</Label>
                    <p className="text-sm mt-1 capitalize">{selectedRecord.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Requested By</Label>
                    <p className="text-sm mt-1">{selectedRecord.requestedBy}</p>
                  </div>
                </div>
                {selectedRecord.affectedSystems.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Affected Systems</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRecord.affectedSystems.map((system) => (
                        <Badge key={system} variant="secondary" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRecord.validationRequired && (
                  <div className="p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileLock className="w-4 h-4 text-status-warning" />
                      <span className="text-sm font-medium text-status-warning">
                        Validation Required
                      </span>
                    </div>
                    {selectedRecord.validationStatus && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Status: {selectedRecord.validationStatus.replace("_", " ")}
                      </p>
                    )}
                  </div>
                )}
                {selectedRecord.comments.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Comments</Label>
                    <div className="space-y-2 mt-2">
                      {selectedRecord.comments.map((comment) => (
                        <div key={comment.id} className="p-2 bg-muted/50 rounded text-sm">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span>{comment.userName}</span>
                            <span>•</span>
                            <span>{comment.timestamp.toLocaleString()}</span>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {selectedRecord.status === "draft" && (
                  <Button onClick={() => onSubmitForReview(selectedRecord.id)}>
                    <Send className="w-3 h-3 mr-1" />
                    Submit for Review
                  </Button>
                )}
                {selectedRecord.status === "pending_review" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                    <Button onClick={() => onApprove(selectedRecord.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedRecord.status === "approved" && (
                  <Button onClick={() => onImplement(selectedRecord.id)}>
                    <Play className="w-3 h-3 mr-1" />
                    Mark Implemented
                  </Button>
                )}
                {selectedRecord.status === "implemented" && (
                  <Button onClick={() => setShowCloseDialog(true)}>
                    <Archive className="w-3 h-3 mr-1" />
                    Close Change Record
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Change</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this change request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              Reject Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Change Record</DialogTitle>
            <DialogDescription>
              {selectedRecord?.validationRequired
                ? "Confirm validation is complete and add any notes."
                : "Add any closing notes for this change record."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder={
                selectedRecord?.validationRequired
                  ? "Validation notes and summary..."
                  : "Closing notes (optional)..."
              }
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClose}>Close Change Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
