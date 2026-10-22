'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Plus,
  Inbox,
  Layers,
  ChevronDown,
  ChevronRight,
  Archive,
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  Loader2,
  GripVertical,
  Download,
  FileText,
  GitPullRequest,
  Gauge,
  Users,
  ShieldAlert,
  CheckCircle,
  Edit2,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import { FullIssue, User, Swimlane, Sprint } from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SprintHeader } from '@/components/backlog/SprintHeader';
import { EditSprintModal } from '@/components/sprints/EditSprintModal';
import { StartSprintModal } from '@/components/sprints/StartSprintModal';
import { CompleteSprintModal } from '@/components/sprints/CompleteSprintModal';
import {
  createSprintAction,
  deleteSprintAction,
  moveIssueSprintAction,
  updateSprintCapacityOverrideAction,
} from '@/app/actions/sprints';
import { updateIssue } from '@/app/actions/issues';
import { playCardPickupSound, playCardDropSound } from '@/lib/sound';
import {
  calculateSprintCommittedPoints,
  getRollupStoryPoints,
  isEpicIssue,
  resolveUserCapacityLimit,
  shouldCountInSprintCapacity,
  parseCapacityOverrides,
} from '@/lib/agile-capacity';

interface BacklogViewProps {
  projectId?: string;
  issues: FullIssue[];
  allProjectIssues?: FullIssue[];
  users: User[];
  sprints?: Sprint[];
  swimlanes?: Swimlane[];
  onSelectIssue: (id: string) => void;
  onStatusChange: (issueId: string, newStatus: string) => void;
  onCreateIssue: () => void;
  onUpdateSprint?: (sprint: Sprint) => void;
  isViewer: boolean;
}

function formatDateDisplay(dateStr?: string | null | number | Date): string {
  if (!dateStr) return '';
  if (typeof dateStr === 'number') {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const clean = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
  const [year, month, day] = clean.split('-').map(Number);
  if (!year || !month || !day) return String(dateStr);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BacklogView({
  projectId,
  issues: initialIssues,
  allProjectIssues,
  users = [],
  sprints = [],
  swimlanes = [],
  onSelectIssue,
  onStatusChange,
  onCreateIssue,
  onUpdateSprint,
  isViewer,
}: BacklogViewProps) {
  const [localIssues, setLocalIssues] = useState<FullIssue[]>(initialIssues);
  const [localSprints, setLocalSprints] = useState<Sprint[]>(sprints || []);

  // Sync if parent props change
  React.useEffect(() => {
    setLocalIssues(initialIssues);
  }, [initialIssues]);

  React.useEffect(() => {
    if (sprints) {
      setLocalSprints(sprints);
    }
  }, [sprints]);

  // Dialog modal states
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [startingSprint, setStartingSprint] = useState<Sprint | null>(null);
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);
  const [completedAccordionOpen, setCompletedAccordionOpen] = useState(false);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [dragOverSprintId, setDragOverSprintId] = useState<string | null>(null);
  const [dragOverBacklog, setDragOverBacklog] = useState(false);

  // Linear-grade inline editable cells state
  const [editingTitleKey, setEditingTitleKey] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState<string>('');
  const [editingPointsKey, setEditingPointsKey] = useState<string | null>(null);
  const [editingPointsValue, setEditingPointsValue] = useState<string>('');

  // Determine sprint statuses
  const { activeSprint, plannedSprints, closedSprints } = useMemo(() => {
    let active: Sprint | null = null;
    const planned: Sprint[] = [];
    const closed: Sprint[] = [];

    for (const s of localSprints) {
      const status = (s as any).status || s.state;
      if (status === 'ACTIVE' || status === 'active') {
        if (!active) active = s;
        else planned.push(s);
      } else if (status === 'CLOSED' || status === 'closed') {
        closed.push(s);
      } else {
        planned.push(s);
      }
    }

    // Sort planned sprints chronologically by start date or name
    planned.sort((a, b) => {
      const startA = a.startDate || '';
      const startB = b.startDate || '';
      return startA.localeCompare(startB) || a.name.localeCompare(b.name);
    });

    // Sort closed sprints by completion date descending
    closed.sort((a, b) => {
      const compA = (a as any).completed_at || (a as any).completedAt || 0;
      const compB = (b as any).completed_at || (b as any).completedAt || 0;
      return Number(compB) - Number(compA);
    });

    return { activeSprint: active, plannedSprints: planned, closedSprints: closed };
  }, [localSprints]);

  const activeSprintName = activeSprint?.name || null;

  const statusOptions =
    swimlanes.length > 0
      ? swimlanes.map((s) => s.name)
      : ['To Do', 'In Progress', 'In Review', 'Done'];

  const allSprintIdSet = useMemo(
    () => new Set(localSprints.map((s) => s.id)),
    [localSprints]
  );

  // Product Backlog issues: issues with no sprintId or pointing to an unlisted sprint
  const backlogIssues = useMemo(
    () => localIssues.filter((i) => !i.sprintId || !allSprintIdSet.has(i.sprintId)),
    [localIssues, allSprintIdSet]
  );

  // Live Capacity Drawer & Rolling Velocity Guardrails
  const [showCapacityDrawer, setShowCapacityDrawer] = useState(true);

  // Editable Developer Sprint Capacity State
  const [editingCapacityUserId, setEditingCapacityUserId] = useState<string | null>(null);
  const [editingCapacityValue, setEditingCapacityValue] = useState<string>('');
  const [localCapacityOverrides, setLocalCapacityOverrides] = useState<Record<string, Record<string, number>>>({});
  const [isSavingCapacity, setIsSavingCapacity] = useState(false);

  const capacityMetrics = useMemo(() => {
    const targetSprint = activeSprint || plannedSprints[0] || null;
    const sprintIssues = targetSprint
      ? localIssues.filter((i) => i.sprintId === targetSprint.id)
      : [];

    const effectiveAllIssues = allProjectIssues && allProjectIssues.length > 0 ? allProjectIssues : localIssues;

    // Issue 1 Fix: Calculate committed points ONLY from executable tickets (exclude parent Epics with children)
    const totalPointsCommitted = calculateSprintCommittedPoints(sprintIssues, effectiveAllIssues);

    // Calculate historical rolling velocity from closed sprints (excluding double-counted epics)
    let rollingVelocity = 24;
    if (closedSprints.length > 0) {
      const closedPoints = closedSprints.map((cs) => {
        const issuesInClosed = effectiveAllIssues.filter((i) => i.sprintId === cs.id);
        return issuesInClosed
          .filter(
            (i) =>
              shouldCountInSprintCapacity(i, effectiveAllIssues) &&
              ((i.status || '').toLowerCase() === 'done' || (i.status || '').toLowerCase() === 'shipped')
          )
          .reduce((sum, i) => sum + (Number(i.storyPoints) || 0), 0);
      });
      const validPoints = closedPoints.filter((p) => p > 0);
      if (validPoints.length > 0) {
        rollingVelocity = Math.round(validPoints.reduce((a, b) => a + b, 0) / validPoints.length);
      }
    }

    // Workload distribution by user for the target sprint
    const userWorkloadMap = new Map<string, { user: User; points: number; count: number }>();
    users.forEach((u) => {
      userWorkloadMap.set(u.id, { user: u, points: 0, count: 0 });
    });

    let unassignedPoints = 0;
    let unassignedCount = 0;

    sprintIssues.forEach((issue) => {
      // Issue 1 Fix: Only executable leaf tickets consume developer capacity
      if (!shouldCountInSprintCapacity(issue, effectiveAllIssues)) {
        return;
      }
      const pts = Number(issue.storyPoints) || 0;
      if (issue.assigneeId && userWorkloadMap.has(issue.assigneeId)) {
        const item = userWorkloadMap.get(issue.assigneeId)!;
        item.points += pts;
        item.count += 1;
      } else {
        unassignedPoints += pts;
        unassignedCount += 1;
      }
    });

    const activeAssignees = users.filter((u) => u.role !== 'Viewer');
    const sprintOverrides = targetSprint
      ? {
          ...parseCapacityOverrides(targetSprint.capacityOverrides),
          ...(localCapacityOverrides[targetSprint.id] || {}),
        }
      : {};

    const userBreakdowns = Array.from(userWorkloadMap.values())
      .filter(
        (w) =>
          w.points > 0 ||
          w.count > 0 ||
          w.user.role === 'Member' ||
          w.user.role === 'Admin'
      )
      .map((w) => {
        // Issue 2 Fix: Resolve user capacity limit (Custom Override -> Personal Historical Velocity -> Fallback)
        const resolved = resolveUserCapacityLimit({
          userId: w.user.id,
          sprint: targetSprint,
          closedSprints,
          allIssues: effectiveAllIssues,
          teamRollingVelocity: rollingVelocity,
          activeDevsCount: activeAssignees.length,
          localOverride: sprintOverrides[w.user.id],
        });
        const capacityLimit = resolved.limit;
        const utilizationPct = capacityLimit > 0 ? Math.round((w.points / capacityLimit) * 100) : 0;
        const isOver = utilizationPct > 100;
        return {
          ...w,
          capacityLimit,
          utilizationPct,
          isOver,
          isCustom: resolved.isCustom,
          source: resolved.source,
        };
      })
      .sort((a, b) => b.points - a.points);

    const totalTeamCapacity =
      userBreakdowns.reduce((sum, w) => sum + w.capacityLimit, 0) || rollingVelocity;
    const teamUtilizationPct =
      totalTeamCapacity > 0 ? Math.round((totalPointsCommitted / totalTeamCapacity) * 100) : 0;
    const isTeamOver = teamUtilizationPct > 115;

    return {
      targetSprint,
      totalPointsCommitted,
      totalTeamCapacity,
      rollingVelocity,
      teamUtilizationPct,
      isTeamOver,
      unassignedPoints,
      unassignedCount,
      userBreakdowns,
    };
  }, [
    activeSprint,
    plannedSprints,
    closedSprints,
    localIssues,
    allProjectIssues,
    users,
    localCapacityOverrides,
  ]);

  const handleSaveCapacity = async (userId: string) => {
    if (!capacityMetrics.targetSprint) return;
    const sprintId = capacityMetrics.targetSprint.id;
    const num = Math.max(0, parseInt(editingCapacityValue, 10) || 0);

    // Optimistic update
    setLocalCapacityOverrides((prev) => {
      const updated = {
        ...prev,
        [sprintId]: {
          ...(prev[sprintId] || {}),
          [userId]: num,
        },
      };
      try {
        localStorage.setItem(`kynov_sprint_capacity_${sprintId}`, JSON.stringify(updated[sprintId]));
      } catch {}
      return updated;
    });
    setEditingCapacityUserId(null);

    // Persist via Server Action
    setIsSavingCapacity(true);
    try {
      const res = await updateSprintCapacityOverrideAction({
        sprintId,
        userId,
        capacityLimit: num,
      });
      if (res.success && onUpdateSprint && capacityMetrics.targetSprint) {
        onUpdateSprint({
          ...capacityMetrics.targetSprint,
          capacityOverrides: res.capacityOverrides ?? null,
        });
      }
    } catch (err) {
      console.error('Failed to save capacity override:', err);
    } finally {
      setIsSavingCapacity(false);
    }
  };

  const handleResetCapacity = async (userId: string) => {
    if (!capacityMetrics.targetSprint) return;
    const sprintId = capacityMetrics.targetSprint.id;

    // Optimistic reset
    setLocalCapacityOverrides((prev) => {
      const current = { ...(prev[sprintId] || {}) };
      delete current[userId];
      const updated = {
        ...prev,
        [sprintId]: current,
      };
      try {
        localStorage.setItem(`kynov_sprint_capacity_${sprintId}`, JSON.stringify(current));
      } catch {}
      return updated;
    });
    setEditingCapacityUserId(null);

    // Persist via Server Action
    setIsSavingCapacity(true);
    try {
      const res = await updateSprintCapacityOverrideAction({
        sprintId,
        userId,
        capacityLimit: null,
      });
      if (res.success && onUpdateSprint && capacityMetrics.targetSprint) {
        onUpdateSprint({
          ...capacityMetrics.targetSprint,
          capacityOverrides: res.capacityOverrides ?? null,
        });
      }
    } catch (err) {
      console.error('Failed to reset capacity override:', err);
    } finally {
      setIsSavingCapacity(false);
    }
  };

  // Drag and drop handler to move issues between sprints and backlog
  const handleDropIssue = async (e: React.DragEvent, targetSprintId: string | null) => {
    e.preventDefault();
    setDragOverSprintId(null);
    setDragOverBacklog(false);
    if (isViewer) return;

    const issueKey = e.dataTransfer.getData('text/plain');
    if (!issueKey) return;

    const targetIssue = localIssues.find((i) => i.key === issueKey);
    if (!targetIssue || targetIssue.sprintId === targetSprintId) return;

    // Optimistic update
    setLocalIssues((prev) =>
      prev.map((i) => (i.key === issueKey ? { ...i, sprintId: targetSprintId } : i))
    );
    playCardDropSound();

    try {
      await moveIssueSprintAction({ issueKey, sprintId: targetSprintId });
    } catch (err) {
      console.error('Failed to move issue:', err);
      // Revert on error
      setLocalIssues((prev) =>
        prev.map((i) => (i.key === issueKey ? { ...i, sprintId: targetIssue.sprintId } : i))
      );
    }
  };

  const handleCreateSprint = async () => {
    if (isViewer || isCreatingSprint) return;
    setIsCreatingSprint(true);
    try {
      const targetProjectId = projectId || localIssues[0]?.projectId || undefined;
      const res = await createSprintAction({ projectId: targetProjectId });
      if (res.success && res.sprint) {
        setLocalSprints((prev) => [...prev, res.sprint!]);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kynov:sprint-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to create sprint:', err);
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (isViewer) return;
    try {
      const res = await deleteSprintAction({ sprintId });
      if (res.success) {
        // Remove sprint from local list and move its issues to backlog
        setLocalSprints((prev) => prev.filter((s) => s.id !== sprintId));
        setLocalIssues((prev) =>
          prev.map((i) => (i.sprintId === sprintId ? { ...i, sprintId: null } : i))
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kynov:sprint-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to delete sprint:', err);
    }
  };

  const handleSprintUpdated = (updatedSprint: Sprint) => {
    setLocalSprints((prev) =>
      prev.map((s) => (s.id === updatedSprint.id ? updatedSprint : s))
    );
    onUpdateSprint?.(updatedSprint);
  };

  const handleExportCsv = () => {
    // Collect issues to export: Prefer all project issues so stories, bugs, and tasks are never omitted,
    // or localIssues if allProjectIssues is not provided.
    const issuesToExport =
      allProjectIssues && allProjectIssues.length > 0 ? allProjectIssues : localIssues;

    const sprintMap = new Map<string, string>();
    localSprints.forEach((s) => sprintMap.set(s.id, s.name));

    const escapeCsvValue = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Key',
      'Title',
      'Type',
      'Status',
      'Priority',
      'Assignee',
      'Story Points',
      'Sprint',
    ];

    const rows = issuesToExport.map((issue) => {
      const sprintName = issue.sprintId
        ? sprintMap.get(issue.sprintId) || issue.sprint?.name || 'Sprint'
        : 'Backlog';

      const assigneeName = issue.assignee?.name || issue.assignee?.email || 'Unassigned';
      const points =
        issue.storyPoints !== null && issue.storyPoints !== undefined ? issue.storyPoints : 0;

      // Ensure Type accurately reflects Story, Bug, Task, Epic regardless of schema variations
      const rawType = String(issue.type || issue.issueType || 'Task').trim();
      const upper = rawType.toUpperCase();
      const normalizedType =
        upper === 'STORY'
          ? 'Story'
          : upper === 'BUG'
          ? 'Bug'
          : upper === 'TASK'
          ? 'Task'
          : upper === 'EPIC'
          ? 'Epic'
          : upper === 'SUBTASK'
          ? 'Subtask'
          : rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

      return [
        issue.key,
        issue.title,
        normalizedType,
        issue.status,
        issue.priority,
        assigneeName,
        points,
        sprintName,
      ];
    });

    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\r\n');

    // Trigger direct browser download with date stamp
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const filename = `backlog-export-${dateStr}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderIssueRow = (issue: FullIssue, isReadOnly = false) => {
    const typeCfg = getTypeConfig(issue.type);
    const priorityCfg = getPriorityConfig(issue.priority);
    const assignee = issue.assignee;
    const TypeIcon = typeCfg.icon;

    return (
      <div
        key={issue.key}
        draggable={!isViewer && !isReadOnly}
        onDragStart={(e) => {
          if (!isViewer && !isReadOnly) {
            playCardPickupSound();
            e.dataTransfer.setData('text/plain', issue.key);
          }
        }}
        onClick={() => onSelectIssue(issue.key)}
        className="group flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111827] border-b border-slate-200/90 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-[#172134] cursor-pointer transition-all duration-150 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
          {!isViewer && !isReadOnly && (
            <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          )}
          <span className={`p-1 rounded border flex-shrink-0 ${typeCfg.color}`}>
            <TypeIcon className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 w-24 flex-shrink-0 transition-colors">
            {issue.key}
          </span>
          {issue.parent && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 truncate max-w-[120px]"
              style={{
                backgroundColor: `${issue.parent.epicColor || '#3B82F6'}15`,
                borderColor: `${issue.parent.epicColor || '#3B82F6'}40`,
                color: issue.parent.epicColor || '#3B82F6',
              }}
            >
              {issue.parent.title || issue.parent.key}
            </span>
          )}
          {issue.blockedByIssues && issue.blockedByIssues.some((b) => b.status.toLowerCase() !== 'done') && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex-shrink-0">
              Blocked
            </span>
          )}
          {editingTitleKey === issue.key ? (
            <input
              type="text"
              autoFocus
              value={editingTitleValue}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setEditingTitleValue(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const newT = editingTitleValue.trim() || issue.title;
                  setLocalIssues((prev) =>
                    prev.map((i) => (i.key === issue.key ? { ...i, title: newT } : i))
                  );
                  setEditingTitleKey(null);
                  await updateIssue(issue.key, { title: newT });
                  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kynov:issue-updated'));
                } else if (e.key === 'Escape') {
                  setEditingTitleKey(null);
                }
              }}
              onBlur={async () => {
                const newT = editingTitleValue.trim() || issue.title;
                setLocalIssues((prev) =>
                  prev.map((i) => (i.key === issue.key ? { ...i, title: newT } : i))
                );
                setEditingTitleKey(null);
                await updateIssue(issue.key, { title: newT });
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kynov:issue-updated'));
              }}
              className="text-sm font-medium text-slate-800 dark:text-slate-100 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-500 rounded px-2 py-0.5 flex-1 focus:outline-none"
            />
          ) : (
            <span
              onClick={(e) => {
                if (!isViewer && !isReadOnly) {
                  e.stopPropagation();
                  setEditingTitleKey(issue.key);
                  setEditingTitleValue(issue.title);
                }
              }}
              title={!isViewer && !isReadOnly ? 'Click to edit title directly' : undefined}
              className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate flex-1 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {issue.title}
            </span>
          )}
          {issue.labels?.map((lbl, idx) => (
            <span
              key={idx}
              className="hidden lg:inline text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded"
            >
              {lbl}
            </span>
          ))}

          {/* Doc-Linked Spec Readiness Guardrail (5+ pts requiring architectural spec) */}
          {(Number(issue.storyPoints) || 0) >= 5 && (!issue.links || issue.links.length === 0) && (
            <span
              className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex-shrink-0"
              title="Guardrail: High complexity (5+ pts) task lacks a linked Architecture Decision Record (ADR) or PRD spec."
            >
              <FileText className="w-3 h-3 text-amber-500" />
              <span>No Spec</span>
            </span>
          )}

          {/* Code-Truth: Git PR Pill & Stagnation Alert */}
          {issue.gitLinks && issue.gitLinks.length > 0 ? (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              {issue.gitLinks.map((git) => {
                const isMerged = git.status === 'MERGED';
                const isOpen = git.status === 'OPEN';
                const ageHours = git.createdAt
                  ? (Date.now() - new Date(git.createdAt).getTime()) / (1000 * 60 * 60)
                  : 0;
                const isStagnant = isOpen && ageHours > 24;
                return (
                  <a
                    key={git.id}
                    href={git.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                      isMerged
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : isStagnant
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}
                    title={
                      isStagnant
                        ? `PR ${git.refName} waiting on review for >${Math.round(ageHours)}h`
                        : `PR ${git.refName} (${git.status})`
                    }
                  >
                    <GitPullRequest className="w-3 h-3" />
                    <span>{git.refName}</span>
                    {isStagnant && <span className="text-[9px] font-bold text-amber-500">stalled</span>}
                  </a>
                );
              })}
            </div>
          ) : (
            issue.status.toLowerCase().includes('review') ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                <GitPullRequest className="w-3 h-3" />
                <span>Review</span>
              </span>
            ) : null
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Inline Priority Quick Selector */}
          {!isReadOnly ? (
            <select
              value={issue.priority}
              disabled={isViewer}
              onClick={(e) => e.stopPropagation()}
              onChange={async (e) => {
                const newP = e.target.value as any;
                setLocalIssues((prev) =>
                  prev.map((i) => (i.key === issue.key ? { ...i, priority: newP } : i))
                );
                await updateIssue(issue.key, { priority: newP });
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kynov:issue-updated'));
              }}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer focus:outline-none ${priorityCfg.color}`}
              title="Click to change priority"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="None">None</option>
            </select>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${priorityCfg.color}`}>
              {issue.priority}
            </span>
          )}

          {/* Issue Status Selector */}
          {!isReadOnly ? (
            <select
              value={issue.status}
              disabled={isViewer}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onStatusChange(issue.key, e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              {issue.status}
            </span>
          )}

          {/* Story Points (Dynamic Rollup for Epics with child tickets) */}
          {(() => {
            const effectiveAll = allProjectIssues && allProjectIssues.length > 0 ? allProjectIssues : localIssues;
            const rollup = getRollupStoryPoints(issue, effectiveAll);

            if (rollup.isRollup) {
              return (
                <span
                  title={`Dynamic Rollup: ${rollup.points} pts from ${rollup.childCount} child tickets (does not double-count in capacity)`}
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded shadow-2xs select-none"
                >
                  <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{rollup.points} pts</span>
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-indigo-500">Rollup</span>
                </span>
              );
            }

            return editingPointsKey === issue.key ? (
              <input
                type="number"
                min={0}
                max={100}
                autoFocus
                value={editingPointsValue}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditingPointsValue(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const pts = Math.max(0, parseInt(editingPointsValue, 10) || 0);
                    setLocalIssues((prev) =>
                      prev.map((i) => (i.key === issue.key ? { ...i, storyPoints: pts } : i))
                    );
                    setEditingPointsKey(null);
                    await updateIssue(issue.key, { storyPoints: pts });
                    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kynov:issue-updated'));
                  } else if (e.key === 'Escape') {
                    setEditingPointsKey(null);
                  }
                }}
                onBlur={async () => {
                  const pts = Math.max(0, parseInt(editingPointsValue, 10) || 0);
                  setLocalIssues((prev) =>
                    prev.map((i) => (i.key === issue.key ? { ...i, storyPoints: pts } : i))
                  );
                  setEditingPointsKey(null);
                  await updateIssue(issue.key, { storyPoints: pts });
                  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kynov:issue-updated'));
                }}
                className="w-16 text-xs font-mono font-bold text-center text-slate-800 dark:text-slate-100 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-500 rounded px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span
                onClick={(e) => {
                  if (!isViewer && !isReadOnly) {
                    e.stopPropagation();
                    setEditingPointsKey(issue.key);
                    setEditingPointsValue(String(issue.storyPoints ?? 0));
                  }
                }}
                title={!isViewer && !isReadOnly ? 'Click to edit points directly' : undefined}
                className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2 py-0.5 rounded cursor-pointer transition"
              >
                {issue.storyPoints || 0} pts
              </span>
            );
          })()}

          {/* Inline Assignee Quick Reassign Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
              value={assignee?.id || ''}
              disabled={isViewer || isReadOnly}
              onChange={async (e) => {
                const newUserId = e.target.value || null;
                const newAssignee = (users || []).find((u) => u.id === newUserId) || null;
                setLocalIssues((prev) =>
                  prev.map((i) =>
                    i.key === issue.key ? { ...i, assigneeId: newUserId, assignee: newAssignee } : i
                  )
                );
                await updateIssue(issue.key, { assigneeId: newUserId });
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kynov:issue-updated'));
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              title="Click to reassign directly"
            >
              <option value="">Unassigned</option>
              {(users || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <UserAvatar
              user={assignee}
              size="sm"
              title={assignee ? `${assignee.name} (Click to reassign)` : 'Unassigned (Click to assign)'}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span>Backlog & Sprint Planning</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plan arbitrary future sprints, activate iterations with single-active governance, and roll over incomplete tasks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#151B28] hover:bg-slate-50 dark:hover:bg-[#1E2638] text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 font-semibold text-xs shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
            title="Export all visible backlog issues to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          {!isViewer && (
            <button
              onClick={handleCreateSprint}
              disabled={isCreatingSprint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all duration-150 disabled:opacity-50 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {isCreatingSprint ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Sprint</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Live Capacity Drawer & Rolling Velocity Guardrails */}
      {capacityMetrics.targetSprint && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden transition-all duration-200">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Sprint Capacity Budget & Velocity Guardrails
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {capacityMetrics.targetSprint.name}
                  </span>
                  {capacityMetrics.isTeamOver ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <ShieldAlert className="w-3 h-3" />
                      Overcommitted ({capacityMetrics.teamUtilizationPct}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Capacity Balanced ({capacityMetrics.teamUtilizationPct}%)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {capacityMetrics.totalPointsCommitted} pts committed
                  </span>{' '}
                  against {capacityMetrics.totalTeamCapacity} pts sprint capacity budget ({capacityMetrics.rollingVelocity} pts rolling velocity baseline).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCapacityDrawer((prev) => !prev)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {showCapacityDrawer ? 'Collapse Workload' : 'Expand Workload'}
            </button>
          </div>

          {showCapacityDrawer && (
            <div className="p-4 space-y-3 text-xs">
              {/* Team Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Team Velocity Utilization</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {capacityMetrics.totalPointsCommitted} / {capacityMetrics.totalTeamCapacity} pts ({capacityMetrics.teamUtilizationPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      capacityMetrics.isTeamOver
                        ? 'bg-rose-500'
                        : capacityMetrics.teamUtilizationPct > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, capacityMetrics.teamUtilizationPct)}%` }}
                  />
                </div>
              </div>

              {/* Developer Workload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                {capacityMetrics.userBreakdowns.map((w) => (
                  <div
                    key={w.user.id}
                    className={`p-2.5 rounded-xl border transition ${
                      w.isOver
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                        : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <UserAvatar user={w.user} size="xs" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                          {w.user.name}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          w.isOver
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {w.points} pts
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          w.isOver ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, w.utilizationPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      {editingCapacityUserId === w.user.id ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10px]">Max:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            autoFocus
                            value={editingCapacityValue}
                            onChange={(e) => setEditingCapacityValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCapacity(w.user.id);
                              if (e.key === 'Escape') setEditingCapacityUserId(null);
                            }}
                            className="w-12 px-1 py-0.5 text-[11px] font-mono font-bold bg-white dark:bg-slate-800 border border-indigo-500 rounded text-slate-900 dark:text-white focus:outline-none"
                          />
                          <span className="text-[10px]">pts</span>
                          <button
                            type="button"
                            onClick={() => handleSaveCapacity(w.user.id)}
                            disabled={isSavingCapacity}
                            className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                            title="Save custom capacity"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCapacityUserId(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1 group/cap">
                            <span>Max {w.capacityLimit} pts</span>
                            {w.isCustom ? (
                              <span
                                className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-1 rounded cursor-help"
                                title="Custom sprint capacity override"
                              >
                                Custom
                              </span>
                            ) : w.source === 'historical' ? (
                              <span
                                className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded cursor-help"
                                title="Calculated from developer's rolling historical velocity"
                              >
                                Avg
                              </span>
                            ) : null}
                            {!isViewer && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCapacityUserId(w.user.id);
                                  setEditingCapacityValue(String(w.capacityLimit));
                                }}
                                className="opacity-0 group-hover/cap:opacity-100 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded transition cursor-pointer"
                                title="Edit capacity for this sprint (e.g. PTO, part-time)"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {w.isCustom && !isViewer && (
                              <button
                                type="button"
                                onClick={() => handleResetCapacity(w.user.id)}
                                className="opacity-0 group-hover/cap:opacity-100 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded transition cursor-pointer"
                                title="Reset to default baseline velocity"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          {w.isOver ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">
                              +{w.points - w.capacityLimit} pts over
                            </span>
                          ) : (
                            <span>{w.utilizationPct}% target</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {capacityMetrics.unassignedPoints > 0 && (
                  <div className="p-2.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        Unassigned Pool
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                        {capacityMetrics.unassignedPoints} pts
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                      {capacityMetrics.unassignedCount} task(s) in sprint lack assignees
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. Active Sprint Container (Top Container) */}
      {activeSprint && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverSprintId(activeSprint.id);
          }}
          onDragLeave={() => setDragOverSprintId(null)}
          onDrop={(e) => handleDropIssue(e, activeSprint.id)}
          className={`bg-white/95 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${
            dragOverSprintId === activeSprint.id
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 dark:border-slate-800/80'
          }`}
        >
          {(() => {
            const sprintIssues = localIssues.filter((i) => i.sprintId === activeSprint.id);
            const totalPoints = calculateSprintCommittedPoints(sprintIssues, allProjectIssues || localIssues);

            return (
              <>
                <SprintHeader
                  sprint={activeSprint}
                  issueCount={sprintIssues.length}
                  totalPoints={totalPoints}
                  activeSprintName={activeSprintName}
                  onEditSprint={(s) => setEditingSprint(s)}
                  onCompleteSprint={(s) => setCompletingSprint(s)}
                  onAddIssue={onCreateIssue}
                  isViewer={isViewer}
                />
                <div>
                  {sprintIssues.map((issue) => renderIssueRow(issue))}
                  {sprintIssues.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700/50 m-3 rounded-xl">
                      Drag issues here or click &quot;Add Issue&quot; to commit work to the active sprint.
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 2. Planned Sprints Containers (Middle Container, stacked chronologically) */}
      <div className="space-y-4">
        {plannedSprints.map((sprint) => {
          const sprintIssues = localIssues.filter((i) => i.sprintId === sprint.id);
          const totalPoints = calculateSprintCommittedPoints(sprintIssues, allProjectIssues || localIssues);

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSprintId(sprint.id);
              }}
              onDragLeave={() => setDragOverSprintId(null)}
              onDrop={(e) => handleDropIssue(e, sprint.id)}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition overflow-hidden ${
                dragOverSprintId === sprint.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <SprintHeader
                sprint={sprint}
                issueCount={sprintIssues.length}
                totalPoints={totalPoints}
                activeSprintName={activeSprintName}
                onEditSprint={(s) => setEditingSprint(s)}
                onStartSprint={(s) => setStartingSprint(s)}
                onDeleteSprint={(sId) => handleDeleteSprint(sId)}
                onAddIssue={onCreateIssue}
                isViewer={isViewer}
              />
              <div>
                {sprintIssues.map((issue) => renderIssueRow(issue))}
                {sprintIssues.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700/50 m-3 rounded-xl">
                    Plan future backlog tasks here. Drag items from Product Backlog.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Product Backlog Container (Unassigned Items, sprint_id IS NULL) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverBacklog(true);
        }}
        onDragLeave={() => setDragOverBacklog(false)}
        onDrop={(e) => handleDropIssue(e, null)}
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition overflow-hidden ${
          dragOverBacklog
            ? 'border-purple-500 ring-2 ring-purple-500/20'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span>Product Backlog</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {backlogIssues.length} {backlogIssues.length === 1 ? 'issue' : 'issues'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unassigned backlog items available for future sprint planning. Drag cards into any sprint above.
            </p>
          </div>
          <button
            onClick={onCreateIssue}
            disabled={isViewer}
            className="flex items-center gap-1.5 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Backlog
          </button>
        </div>
        <div>
          {backlogIssues.map((issue) => renderIssueRow(issue))}
          {backlogIssues.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Product Backlog is empty! All items are assigned to planned or active sprints.
            </div>
          )}
        </div>
      </div>

      {/* 4. Completed Sprints Container (Bottom Container, Collapsible Accordion by Default) */}
      {closedSprints.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setCompletedAccordionOpen((v) => !v)}
            className="w-full p-4 bg-slate-50/70 dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Archived Sprints History
              </span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {closedSprints.length} {closedSprints.length === 1 ? 'sprint' : 'sprints'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>{completedAccordionOpen ? 'Hide History' : 'View Closed Sprints'}</span>
              {completedAccordionOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {completedAccordionOpen && (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {closedSprints.map((sprint) => {
                const sprintIssues = localIssues.filter((i) => i.sprintId === sprint.id);
                const totalPoints = calculateSprintCommittedPoints(
                  sprintIssues,
                  allProjectIssues || localIssues
                );
                const completedAt = (sprint as any).completed_at || (sprint as any).completedAt;

                return (
                  <div key={sprint.id} className="p-4 space-y-3 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {sprint.name}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          Closed {completedAt ? formatDateDisplay(completedAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                          {totalPoints} pts burned
                        </span>
                        <span className="text-slate-500">
                          {sprintIssues.length} issues completed
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                      {sprintIssues.map((issue) => renderIssueRow(issue, true))}
                      {sprintIssues.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No issues archived with this sprint.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Sprint Modal */}
      {editingSprint && (
        <EditSprintModal
          key={editingSprint.id}
          sprint={editingSprint}
          isOpen={Boolean(editingSprint)}
          onClose={() => setEditingSprint(null)}
          onSprintUpdated={handleSprintUpdated}
        />
      )}

      {/* Start Sprint Modal */}
      {startingSprint && (
        <StartSprintModal
          key={startingSprint.id}
          sprint={startingSprint}
          projectId={projectId || (startingSprint as any).projectId || (startingSprint as any).project_id}
          isOpen={Boolean(startingSprint)}
          onClose={() => setStartingSprint(null)}
          onSprintStarted={(s) => {
            setLocalSprints((prev) =>
              prev.map((item) =>
                item.id === s.id
                  ? { ...item, status: 'ACTIVE' as any, state: 'active' }
                  : (item as any).status === 'ACTIVE' || item.state === 'active'
                  ? { ...item, status: 'PLANNED' as any, state: 'upcoming' }
                  : item
              )
            );
            handleSprintUpdated(s);
          }}
        />
      )}

      {/* Complete Sprint Modal */}
      {completingSprint && (
        <CompleteSprintModal
          key={completingSprint.id}
          sprint={completingSprint}
          sprintIssues={localIssues.filter((i) => i.sprintId === completingSprint.id)}
          plannedSprints={plannedSprints}
          isOpen={Boolean(completingSprint)}
          onClose={() => setCompletingSprint(null)}
          onSprintCompleted={() => {
            setLocalSprints((prev) =>
              prev.map((s) =>
                s.id === completingSprint.id
                  ? { ...s, status: 'CLOSED' as any, state: 'closed', completed_at: Date.now() as any }
                  : s
              )
            );
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('kynov:sprint-updated'));
            }
          }}
        />
      )}
    </div>
  );
}
