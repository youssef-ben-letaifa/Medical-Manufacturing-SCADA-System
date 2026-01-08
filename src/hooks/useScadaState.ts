import { useState, useCallback, useEffect } from "react";
import {
  Alarm,
  AlarmPriority,
  Batch,
  BatchState,
  Equipment,
  ChangeRecord,
  ChangeStatus,
  ChangeType,
  AuditEntry,
  MaintenanceRecord,
  MaterialLot,
  QualityCheck,
} from "@/types/scada";

// Current user simulation
const currentUser = {
  id: "USR001",
  username: "jsmith",
  fullName: "John Smith",
  role: "supervisor" as const,
};

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============= ALARM MANAGEMENT =============
export function useAlarmManagement(initialAlarms: Alarm[] = []) {
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const addAuditEntry = useCallback((
    action: string,
    targetType: AuditEntry["targetType"],
    targetId: string,
    targetName: string,
    oldValue?: string,
    newValue?: string,
    comment?: string
  ) => {
    const entry: AuditEntry = {
      id: generateId("AUD"),
      timestamp: new Date(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      targetType,
      targetId,
      targetName,
      oldValue,
      newValue,
      comment,
      workstation: "HMI-001",
    };
    setAuditLog((prev) => [entry, ...prev].slice(0, 1000));
    return entry;
  }, []);

  const acknowledgeAlarm = useCallback((alarmId: string, comment?: string) => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.id === alarmId && alarm.state === "active") {
          addAuditEntry(
            "Alarm Acknowledged",
            "alarm",
            alarm.id,
            alarm.source,
            "active",
            "acknowledged",
            comment
          );
          return {
            ...alarm,
            state: "acknowledged" as const,
            acknowledgedBy: currentUser.fullName,
            acknowledgedAt: new Date(),
          };
        }
        return alarm;
      })
    );
  }, [addAuditEntry]);

  const acknowledgeAllAlarms = useCallback(() => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.state === "active") {
          addAuditEntry(
            "Alarm Acknowledged (Bulk)",
            "alarm",
            alarm.id,
            alarm.source,
            "active",
            "acknowledged"
          );
          return {
            ...alarm,
            state: "acknowledged" as const,
            acknowledgedBy: currentUser.fullName,
            acknowledgedAt: new Date(),
          };
        }
        return alarm;
      })
    );
  }, [addAuditEntry]);

  const shelveAlarm = useCallback((alarmId: string, duration: number, reason: string) => {
    const shelvedUntil = new Date(Date.now() + duration * 60000);
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.id === alarmId) {
          addAuditEntry(
            "Alarm Shelved",
            "alarm",
            alarm.id,
            alarm.source,
            alarm.state,
            "shelved",
            `Duration: ${duration}min, Reason: ${reason}`
          );
          return {
            ...alarm,
            state: "shelved" as const,
            shelvedUntil,
            shelvedReason: reason,
          };
        }
        return alarm;
      })
    );
  }, [addAuditEntry]);

  const clearAlarm = useCallback((alarmId: string) => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.id === alarmId) {
          addAuditEntry(
            "Alarm Cleared",
            "alarm",
            alarm.id,
            alarm.source,
            alarm.state,
            "cleared"
          );
          return {
            ...alarm,
            state: "cleared" as const,
            clearedAt: new Date(),
          };
        }
        return alarm;
      })
    );
  }, [addAuditEntry]);

  const generateAlarm = useCallback((
    priority: AlarmPriority,
    source: string,
    message: string,
    value?: number,
    limitValue?: number
  ) => {
    const newAlarm: Alarm = {
      id: generateId("ALM"),
      timestamp: new Date(),
      priority,
      state: "active",
      source,
      sourceId: source,
      message,
      value,
      limitValue,
      escalationLevel: 0,
    };
    setAlarms((prev) => [newAlarm, ...prev]);
    addAuditEntry("Alarm Generated", "alarm", newAlarm.id, source, undefined, priority.toUpperCase());
    return newAlarm;
  }, [addAuditEntry]);

  // Alarm escalation check
  useEffect(() => {
    const interval = setInterval(() => {
      setAlarms((prev) =>
        prev.map((alarm) => {
          if (alarm.state === "active" && alarm.priority === "critical") {
            const ageMinutes = (Date.now() - alarm.timestamp.getTime()) / 60000;
            if (ageMinutes > 5 && alarm.escalationLevel === 0) {
              return { ...alarm, escalationLevel: 1 };
            }
            if (ageMinutes > 10 && alarm.escalationLevel === 1) {
              return { ...alarm, escalationLevel: 2 };
            }
          }
          return alarm;
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeAlarms = alarms.filter((a) => a.state === "active" || a.state === "acknowledged");
  const criticalCount = alarms.filter((a) => a.priority === "critical" && a.state === "active").length;
  const highCount = alarms.filter((a) => a.priority === "high" && a.state === "active").length;

  return {
    alarms,
    activeAlarms,
    criticalCount,
    highCount,
    auditLog,
    acknowledgeAlarm,
    acknowledgeAllAlarms,
    shelveAlarm,
    clearAlarm,
    generateAlarm,
    addAuditEntry,
  };
}

// ============= BATCH MANAGEMENT =============
export function useBatchManagement(addAuditEntry: ReturnType<typeof useAlarmManagement>["addAuditEntry"]) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);

  const createBatch = useCallback((
    batchNumber: string,
    recipeId: string,
    recipeName: string,
    productName: string,
    equipmentIds: string[]
  ) => {
    const newBatch: Batch = {
      id: generateId("BAT"),
      batchNumber,
      recipeId,
      recipeName,
      productName,
      status: "idle",
      currentPhaseId: "phase-1",
      currentPhaseName: "Initialization",
      phaseProgress: 0,
      overallProgress: 0,
      startTime: new Date(),
      operatorId: currentUser.id,
      operatorName: currentUser.fullName,
      equipmentIds,
      materialLots: [],
      qualityChecks: [],
      deviations: [],
      parameters: [],
    };
    setBatches((prev) => [...prev, newBatch]);
    addAuditEntry("Batch Created", "batch", newBatch.id, batchNumber);
    return newBatch;
  }, [addAuditEntry]);

  const startBatch = useCallback((batchId: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId && batch.status === "idle") {
          const updatedBatch = {
            ...batch,
            status: "running" as BatchState,
            startTime: new Date(),
          };
          if (activeBatch?.id !== batchId) setActiveBatch(updatedBatch);
          addAuditEntry("Batch Started", "batch", batch.id, batch.batchNumber, "idle", "running");
          return updatedBatch;
        }
        return batch;
      })
    );
  }, [activeBatch, addAuditEntry]);

  const holdBatch = useCallback((batchId: string, reason: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId && batch.status === "running") {
          addAuditEntry("Batch Hold", "batch", batch.id, batch.batchNumber, "running", "holding", reason);
          return { ...batch, status: "holding" as BatchState };
        }
        return batch;
      })
    );
  }, [addAuditEntry]);

  const resumeBatch = useCallback((batchId: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId && batch.status === "holding") {
          addAuditEntry("Batch Resumed", "batch", batch.id, batch.batchNumber, "holding", "running");
          return { ...batch, status: "running" as BatchState };
        }
        return batch;
      })
    );
  }, [addAuditEntry]);

  const completeBatch = useCallback((batchId: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          addAuditEntry("Batch Completed", "batch", batch.id, batch.batchNumber, batch.status, "complete");
          return {
            ...batch,
            status: "complete" as BatchState,
            endTime: new Date(),
            overallProgress: 100,
            phaseProgress: 100,
          };
        }
        return batch;
      })
    );
    if (activeBatch?.id === batchId) setActiveBatch(null);
  }, [activeBatch, addAuditEntry]);

  const abortBatch = useCallback((batchId: string, reason: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          addAuditEntry("Batch Aborted", "batch", batch.id, batch.batchNumber, batch.status, "aborted", reason);
          return {
            ...batch,
            status: "aborted" as BatchState,
            endTime: new Date(),
          };
        }
        return batch;
      })
    );
    if (activeBatch?.id === batchId) setActiveBatch(null);
  }, [activeBatch, addAuditEntry]);

  const advancePhase = useCallback((batchId: string, nextPhaseId: string, nextPhaseName: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId && batch.status === "running") {
          addAuditEntry(
            "Phase Advanced",
            "batch",
            batch.id,
            batch.batchNumber,
            batch.currentPhaseName,
            nextPhaseName
          );
          return {
            ...batch,
            currentPhaseId: nextPhaseId,
            currentPhaseName: nextPhaseName,
            phaseProgress: 0,
            overallProgress: batch.overallProgress + 20,
          };
        }
        return batch;
      })
    );
  }, [addAuditEntry]);

  const verifyMaterial = useCallback((batchId: string, materialLot: MaterialLot) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          const verifiedLot = {
            ...materialLot,
            verified: true,
            verifiedBy: currentUser.fullName,
            verifiedAt: new Date(),
          };
          addAuditEntry(
            "Material Verified",
            "batch",
            batch.id,
            batch.batchNumber,
            undefined,
            `${materialLot.partNumber} - Lot: ${materialLot.lotNumber}`
          );
          return {
            ...batch,
            materialLots: [...batch.materialLots.filter((m) => m.id !== materialLot.id), verifiedLot],
          };
        }
        return batch;
      })
    );
  }, [addAuditEntry]);

  const recordQualityCheck = useCallback((batchId: string, check: QualityCheck) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          addAuditEntry(
            "Quality Check Recorded",
            "batch",
            batch.id,
            batch.batchNumber,
            undefined,
            `${check.checkpointName}: ${check.result.toUpperCase()}`
          );
          return {
            ...batch,
            qualityChecks: [...batch.qualityChecks.filter((q) => q.id !== check.id), check],
          };
        }
        return batch;
      })
    );
  }, [addAuditEntry]);

  // Simulate batch progress
  useEffect(() => {
    const interval = setInterval(() => {
      setBatches((prev) =>
        prev.map((batch) => {
          if (batch.status === "running") {
            const newPhaseProgress = Math.min(batch.phaseProgress + Math.random() * 2, 100);
            const updated = { ...batch, phaseProgress: newPhaseProgress };
            if (activeBatch?.id === batch.id) setActiveBatch(updated);
            return updated;
          }
          return batch;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [activeBatch]);

  return {
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
  };
}

// ============= CHANGE MANAGEMENT =============
export function useChangeManagement(addAuditEntry: ReturnType<typeof useAlarmManagement>["addAuditEntry"]) {
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);

  const createChangeRecord = useCallback((
    title: string,
    description: string,
    type: ChangeType,
    category: ChangeRecord["category"],
    affectedSystems: string[]
  ) => {
    const changeNumber = `CHG-${new Date().getFullYear()}-${String(changeRecords.length + 1).padStart(4, "0")}`;
    const newRecord: ChangeRecord = {
      id: generateId("CHG"),
      changeNumber,
      title,
      description,
      type,
      status: "draft",
      category,
      requestedBy: currentUser.fullName,
      requestedAt: new Date(),
      affectedSystems,
      validationRequired: type === "major",
      attachments: [],
      comments: [],
    };
    setChangeRecords((prev) => [...prev, newRecord]);
    addAuditEntry("Change Record Created", "change", newRecord.id, changeNumber);
    return newRecord;
  }, [changeRecords.length, addAuditEntry]);

  const submitForReview = useCallback((changeId: string) => {
    setChangeRecords((prev) =>
      prev.map((record) => {
        if (record.id === changeId && record.status === "draft") {
          addAuditEntry(
            "Change Submitted for Review",
            "change",
            record.id,
            record.changeNumber,
            "draft",
            "pending_review"
          );
          return { ...record, status: "pending_review" as ChangeStatus };
        }
        return record;
      })
    );
  }, [addAuditEntry]);

  const approveChange = useCallback((changeId: string, comment?: string) => {
    setChangeRecords((prev) =>
      prev.map((record) => {
        if (record.id === changeId && record.status === "pending_review") {
          addAuditEntry(
            "Change Approved",
            "change",
            record.id,
            record.changeNumber,
            "pending_review",
            "approved",
            comment
          );
          return {
            ...record,
            status: "approved" as ChangeStatus,
            approvedBy: currentUser.fullName,
            approvedAt: new Date(),
            reviewedBy: currentUser.fullName,
            reviewedAt: new Date(),
          };
        }
        return record;
      })
    );
  }, [addAuditEntry]);

  const rejectChange = useCallback((changeId: string, reason: string) => {
    setChangeRecords((prev) =>
      prev.map((record) => {
        if (record.id === changeId && record.status === "pending_review") {
          addAuditEntry(
            "Change Rejected",
            "change",
            record.id,
            record.changeNumber,
            "pending_review",
            "rejected",
            reason
          );
          return {
            ...record,
            status: "rejected" as ChangeStatus,
            reviewedBy: currentUser.fullName,
            reviewedAt: new Date(),
            comments: [
              ...record.comments,
              {
                id: generateId("CMT"),
                userId: currentUser.id,
                userName: currentUser.fullName,
                timestamp: new Date(),
                content: `Rejected: ${reason}`,
              },
            ],
          };
        }
        return record;
      })
    );
  }, [addAuditEntry]);

  const implementChange = useCallback((changeId: string) => {
    setChangeRecords((prev) =>
      prev.map((record) => {
        if (record.id === changeId && record.status === "approved") {
          addAuditEntry(
            "Change Implemented",
            "change",
            record.id,
            record.changeNumber,
            "approved",
            "implemented"
          );
          return {
            ...record,
            status: "implemented" as ChangeStatus,
            implementedBy: currentUser.fullName,
            implementedAt: new Date(),
            validationStatus: record.validationRequired ? "not_started" : undefined,
          };
        }
        return record;
      })
    );
  }, [addAuditEntry]);

  const closeChange = useCallback((changeId: string, validationNotes?: string) => {
    setChangeRecords((prev) =>
      prev.map((record) => {
        if (record.id === changeId && record.status === "implemented") {
          addAuditEntry(
            "Change Record Closed",
            "change",
            record.id,
            record.changeNumber,
            "implemented",
            "closed",
            validationNotes
          );
          return {
            ...record,
            status: "closed" as ChangeStatus,
            closedBy: currentUser.fullName,
            closedAt: new Date(),
            validationStatus: record.validationRequired ? "complete" : undefined,
            validationNotes,
          };
        }
        return record;
      })
    );
  }, [addAuditEntry]);

  const addComment = useCallback((changeId: string, content: string) => {
    setChangeRecords((prev) =>
      prev.map((record) => {
        if (record.id === changeId) {
          const newComment = {
            id: generateId("CMT"),
            userId: currentUser.id,
            userName: currentUser.fullName,
            timestamp: new Date(),
            content,
          };
          addAuditEntry(
            "Comment Added",
            "change",
            record.id,
            record.changeNumber,
            undefined,
            content.substring(0, 50)
          );
          return { ...record, comments: [...record.comments, newComment] };
        }
        return record;
      })
    );
  }, [addAuditEntry]);

  return {
    changeRecords,
    createChangeRecord,
    submitForReview,
    approveChange,
    rejectChange,
    implementChange,
    closeChange,
    addComment,
  };
}

// ============= EQUIPMENT MANAGEMENT =============
export function useEquipmentManagement(addAuditEntry: ReturnType<typeof useAlarmManagement>["addAuditEntry"]) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  const updateEquipmentStatus = useCallback((equipmentId: string, newStatus: Equipment["operationalStatus"]) => {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id === equipmentId) {
          addAuditEntry(
            "Equipment Status Changed",
            "equipment",
            eq.id,
            eq.name,
            eq.operationalStatus,
            newStatus
          );
          return { ...eq, operationalStatus: newStatus };
        }
        return eq;
      })
    );
  }, [addAuditEntry]);

  const scheduleMaintenanceWork = useCallback((
    equipmentId: string,
    type: MaintenanceRecord["type"],
    description: string,
    scheduledDate: Date,
    assignedTo: string
  ) => {
    const equipment_item = equipment.find((e) => e.id === equipmentId);
    const record: MaintenanceRecord = {
      id: generateId("MNT"),
      equipmentId,
      type,
      scheduledDate,
      assignedTo,
      status: "scheduled",
      description,
    };
    setMaintenanceRecords((prev) => [...prev, record]);
    addAuditEntry(
      "Maintenance Scheduled",
      "equipment",
      equipmentId,
      equipment_item?.name || equipmentId,
      undefined,
      `${type} - ${description}`
    );
    return record;
  }, [equipment, addAuditEntry]);

  const startMaintenance = useCallback((recordId: string) => {
    setMaintenanceRecords((prev) =>
      prev.map((record) => {
        if (record.id === recordId && record.status === "scheduled") {
          return { ...record, status: "in_progress" as const };
        }
        return record;
      })
    );
  }, []);

  const completeMaintenance = useCallback((recordId: string, findings: string, partsReplaced: string[]) => {
    setMaintenanceRecords((prev) =>
      prev.map((record) => {
        if (record.id === recordId && record.status === "in_progress") {
          const equipment_item = equipment.find((e) => e.id === record.equipmentId);
          addAuditEntry(
            "Maintenance Completed",
            "equipment",
            record.equipmentId,
            equipment_item?.name || record.equipmentId,
            "in_progress",
            "complete",
            findings
          );
          return {
            ...record,
            status: "complete" as const,
            completedDate: new Date(),
            findings,
            partsReplaced,
            signedBy: currentUser.fullName,
          };
        }
        return record;
      })
    );

    // Update equipment maintenance date
    const record = maintenanceRecords.find((r) => r.id === recordId);
    if (record) {
      setEquipment((prev) =>
        prev.map((eq) => {
          if (eq.id === record.equipmentId) {
            return {
              ...eq,
              lastMaintenanceDate: new Date(),
              maintenanceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            };
          }
          return eq;
        })
      );
    }
  }, [equipment, maintenanceRecords, addAuditEntry]);

  return {
    equipment,
    setEquipment,
    maintenanceRecords,
    updateEquipmentStatus,
    scheduleMaintenanceWork,
    startMaintenance,
    completeMaintenance,
  };
}
