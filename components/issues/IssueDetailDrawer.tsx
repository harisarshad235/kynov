'use client';

import React, { useState, useRef, useTransition, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Trash2,
  X,
  FileText,
  Download,
  Plus,
  Edit3,
  Flag,
  Link2,
  ListChecks,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Clock,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  CornerDownRight,
  ShieldAlert,
  AtSign,
  Save,
  Check,
  RotateCcw,
  Palette,
  Code,
  Table,
  CheckSquare,
  Quote,
  Users,
} from 'lucide-react';
import {
  FullIssue,
  User,
  IssueStatus,
  Attachment,
  IssueType,
  IssuePriority,
  Swimlane,
  Subtask,
  IssueLink,
  EnterpriseLinkType,
  IssueGitLink,
  IssueAuditLog,
  Sprint,
  isDemoIssue,
} from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  toggleIssueFlag,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  linkIssuesAction,
  unlinkIssuesAction,
  logWorkAction,
} from '@/app/actions/issues';
import { transitionIssueStatusAction } from '@/app/actions/workflows';
import { linkGitRefAction, unlinkGitRefAction } from '@/app/actions/git';

const LINK_LABELS: Record<string, string> = {
  blocks: 'blocks',
  is_blocked_by: 'is blocked by',
  relates_to: 'relates to',
  duplicates: 'duplicates',
  BLOCKS: 'blocks',
  IS_BLOCKED_BY: 'is blocked by',
  RELATES_TO: 'relates to',
  DUPLICATES: 'duplicates',
};

interface IssueDetailDrawerProps {
  issue: FullIssue;
  users: User[];
  currentUser: User;
  swimlanes?: Swimlane[];
  allIssues?: FullIssue[];
  sprints?: Sprint[];
  onNavigateIssue?: (issueKey: string) => void;
  isViewer: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onUpdateIssue: (data: {
    title?: string;
    description?: string;
    type?: IssueType;
    issueType?: string;
    epicColor?: string;
    priority?: IssuePriority;
    assigneeId?: string | null;
    parentIssueId?: string | null;
    storyPoints?: number;
    originalEstimateHours?: number | null;
    remainingEstimateHours?: number | null;
    dueDate?: string | null;
    sprintId?: string | null;
    environment?: 'LIVE' | 'DEMO';
  }) => void;
  onAddComment: (commentText: string) => void;
  onUploadSuccess?: (attachment: Attachment) => void;
}

export function IssueDetailDrawer({
  issue,
  users,
  currentUser,
  swimlanes = [],
  allIssues = [],
  sprints = [],
  onNavigateIssue,
  isViewer,
  onClose,
  onStatusChange,
  onDelete,
  onUpdateIssue,
  onAddComment,
  onUploadSuccess,
}: IssueDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'worklog'>('comments');
  const [commentText, setCommentText] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [selectedMentionIdx, setSelectedMentionIdx] = useState(0);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Close mention list on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node) &&
        commentTextareaRef.current &&
        !commentTextareaRef.current.contains(event.target as Node)
      ) {
        setShowMentionList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMentionUsers = useMemo(() => {
    const q = mentionQuery.toLowerCase();
    return users
      .filter((u) => {
        if (!q) return true;
        const nameMatch = u.name.toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        const handle = (u.email ? u.email.split('@')[0] : u.name.replace(/\s+/g, '')).toLowerCase();
        return nameMatch || emailMatch || handle.includes(q);
      })
      .slice(0, 8);
  }, [users, mentionQuery]);

  const detectedMentions = useMemo(() => {
    const matches = Array.from(commentText.matchAll(/@([a-zA-Z0-9_.-]+)/g)).map((m) => m[1]);
    return Array.from(new Set(matches));
  }, [commentText]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCommentText(val);

    const textBeforeCursor = val.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9_.-]*)$/);

    if (atMatch) {
      setShowMentionList(true);
      setMentionQuery(atMatch[1]);
      setMentionStartIndex(cursorPos - atMatch[0].length);
      setSelectedMentionIdx(0);
    } else {
      setShowMentionList(false);
    }
  };

  const handleSelectUserMention = (user: User) => {
    const handle = user.email ? user.email.split('@')[0] : user.name.replace(/\s+/g, '');
    const before = commentText.slice(0, mentionStartIndex);
    const textAfterMention = commentText.slice(mentionStartIndex);
    const after = textAfterMention.replace(/^@[a-zA-Z0-9_.-]*/, '');
    const newText = `${before}@${handle} ${after}`;

    setCommentText(newText);
    setShowMentionList(false);

    setTimeout(() => {
      if (commentTextareaRef.current) {
        commentTextareaRef.current.focus();
        const newPos = before.length + handle.length + 2;
        commentTextareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionList || filteredMentionUsers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIdx((prev) => (prev + 1) % filteredMentionUsers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIdx((prev) => (prev - 1 + filteredMentionUsers.length) % filteredMentionUsers.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const targetUser = filteredMentionUsers[selectedMentionIdx];
      if (targetUser) {
        handleSelectUserMention(targetUser);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowMentionList(false);
    }
  };

  const triggerMention = () => {
    if (commentTextareaRef.current) {
      commentTextareaRef.current.focus();
      const pos = commentTextareaRef.current.selectionStart || commentText.length;
      const before = commentText.slice(0, pos);
      const after = commentText.slice(pos);
      const prefix = before.endsWith(' ') || before.length === 0 ? '' : ' ';
      const newText = `${before}${prefix}@${after}`;
      setCommentText(newText);
      setMentionStartIndex((before + prefix).length);
      setMentionQuery('');
      setShowMentionList(true);
      setSelectedMentionIdx(0);
      setTimeout(() => {
        if (commentTextareaRef.current) {
          const nextPos = (before + prefix).length + 1;
          commentTextareaRef.current.setSelectionRange(nextPos, nextPos);
        }
      }, 10);
    }
  };

  const renderCommentBody = (body: string) => {
    // Turn @handle into [@handle](#mention:handle) for ReactMarkdown
    const formatted = body.replace(/@([a-zA-Z0-9_.-]+)/g, '[@$1](#mention:$1)');

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.startsWith('#mention:')) {
              const handle = href.replace('#mention:', '');
              const matchedUser = users.find(
                (u) =>
                  u.email?.split('@')[0]?.toLowerCase() === handle.toLowerCase() ||
                  u.name?.toLowerCase().replace(/\s+/g, '') === handle.toLowerCase() ||
                  u.name?.toLowerCase().split(' ')[0] === handle.toLowerCase()
              );
              return (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium text-xs transition cursor-default"
                  title={matchedUser ? `${matchedUser.name} (${matchedUser.email})` : `@${handle}`}
                >
                  <span className="font-bold">@</span>
                  <span>{matchedUser ? matchedUser.name : handle}</span>
                </span>
              );
            }
            return (
              <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {formatted}
      </ReactMarkdown>
    );
  };
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(issue.title);
  const [descInput, setDescInput] = useState(issue.description || '');
  const [isPreviewDesc, setIsPreviewDesc] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Subtasks & Linking local states
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(issue.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [linkType, setLinkType] = useState<EnterpriseLinkType>('BLOCKS');
  const [linkError, setLinkError] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Git Link modal
  const [isAddingGit, setIsAddingGit] = useState(false);
  const [gitRefType, setGitRefType] = useState<'BRANCH' | 'PULL_REQUEST' | 'COMMIT'>('PULL_REQUEST');
  const [gitRefName, setGitRefName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [gitRepo, setGitRepo] = useState('org/kynov');

  // Work Log modal
  const [isLogWorkOpen, setIsLogWorkOpen] = useState(false);
  const [logHoursSpent, setLogHoursSpent] = useState<number>(1);
  const [logRemainingHours, setLogRemainingHours] = useState<number | ''>(
    issue.remainingEstimateHours ?? Math.max(0, (issue.originalEstimateHours ?? 0) - 1)
  );
  const [logComment, setLogComment] = useState('');

  // Transition & Blocker Error State
  const [transitionError, setTransitionError] = useState<{
    message: string;
    isBlocked?: boolean;
    targetStatusId?: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [, startTransition] = useTransition();

  const initialType = (issue.issueType || issue.type || 'TASK').toUpperCase();
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority>(issue.priority || 'Medium');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(issue.assigneeId || null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(issue.parentIssueId || null);
  const [selectedPoints, setSelectedPoints] = useState<number>(issue.storyPoints ?? 0);
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(issue.dueDate || null);
  const [selectedOriginalEstimate, setSelectedOriginalEstimate] = useState<number | null>(
    issue.originalEstimateHours ?? null
  );
  const [selectedRemainingEstimate, setSelectedRemainingEstimate] = useState<number | null>(
    issue.remainingEstimateHours ?? null
  );
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(issue.sprintId || null);
  const [selectedEpicColor, setSelectedEpicColor] = useState<string>(issue.epicColor || '#3B82F6');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'LIVE' | 'DEMO'>(() =>
    isDemoIssue(issue) ? 'DEMO' : 'LIVE'
  );
  const [savedJustNow, setSavedJustNow] = useState(false);

  useEffect(() => {
    setTitleInput(issue.title);
    setDescInput(issue.description || '');
    setLocalSubtasks(issue.subtasks || []);
    setSelectedType((issue.issueType || issue.type || 'TASK').toUpperCase());
    setSelectedPriority(issue.priority || 'Medium');
    setSelectedAssigneeId(issue.assigneeId || null);
    setSelectedParentId(issue.parentIssueId || null);
    setSelectedPoints(issue.storyPoints ?? 0);
    setSelectedDueDate(issue.dueDate || null);
    setSelectedOriginalEstimate(issue.originalEstimateHours ?? null);
    setSelectedRemainingEstimate(issue.remainingEstimateHours ?? null);
    setSelectedSprintId(issue.sprintId || null);
    setSelectedEpicColor(issue.epicColor || '#3B82F6');
    setSelectedEnvironment(isDemoIssue(issue) ? 'DEMO' : 'LIVE');
    setTransitionError(null);
  }, [
    issue.key,
    issue.title,
    issue.description,
    issue.subtasks,
    issue.issueType,
    issue.type,
    issue.priority,
    issue.assigneeId,
    issue.parentIssueId,
    issue.storyPoints,
    issue.dueDate,
    issue.originalEstimateHours,
    issue.remainingEstimateHours,
    issue.sprintId,
    issue.epicColor,
    issue.environment,
    issue.labels,
  ]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const doneSubtasks = localSubtasks.filter((s) => s.completed).length;
  const subtaskPct = localSubtasks.length ? Math.round((doneSubtasks / localSubtasks.length) * 100) : 0;

  // Real-time collaborative presence placeholder
  // NOTE: Real-time presence requires a WebSocket/SSE backend (e.g. Liveblocks, Supabase Realtime).
  // Until integrated, this returns an empty array — no fake viewers are shown.
  const activeViewers: User[] = [];

  const insertSlashTemplateIntoDesc = (type: 'todo' | 'table' | 'code' | 'quote') => {
    let snippet = '';
    if (type === 'todo') snippet = '\n- [ ] Task item\n';
    else if (type === 'table') snippet = '\n\n| Item | Description | Status |\n|---|---|---|\n| API Integration | Connect endpoint | In Progress |\n| QA Verification | Test edge cases | To Do |\n\n';
    else if (type === 'code') snippet = '\n\n```typescript\n// Implementation\nexport function solve() {\n  return true;\n}\n```\n\n';
    else if (type === 'quote') snippet = '\n> Context / Key Architectural Decision\n\n';

    setDescInput((prev) => (prev ? prev + snippet : snippet.trimStart()));
    setIsEditingDesc(true);
    showToast(`Inserted /${type} block`);
  };

  const insertSlashTemplateIntoComment = (type: 'todo' | 'table' | 'code' | 'quote') => {
    let snippet = '';
    if (type === 'todo') snippet = '\n- [ ] Task item\n';
    else if (type === 'table') snippet = '\n\n| Item | Status |\n|---|---|\n| Review | Approved |\n\n';
    else if (type === 'code') snippet = '\n\n```typescript\n// Example snippet\n```\n\n';
    else if (type === 'quote') snippet = '\n> Reference note\n\n';

    setCommentText((prev) => (prev ? prev + snippet : snippet.trimStart()));
    showToast(`Inserted /${type} block`);
  };

  // Resolving parent Epics & Available Epics
  const availableEpics = useMemo(() => {
    return allIssues.filter(
      (i) =>
        i.key !== issue.key &&
        ((i.issueType || i.type || '').toUpperCase() === 'EPIC')
    );
  }, [allIssues, issue.key]);

  const parentEpic = useMemo(() => {
    if (issue.parent) return issue.parent;
    if (issue.parentIssueId) {
      return allIssues.find((i) => i.key === issue.parentIssueId) || null;
    }
    return null;
  }, [issue.parent, issue.parentIssueId, allIssues]);

  // Dynamic Sprints for this issue's project
  const availableSprints = useMemo(() => {
    return (sprints || []).filter(
      (s) => !issue.projectId || !(s as any).projectId || (s as any).projectId === issue.projectId
    );
  }, [sprints, issue.projectId]);

  // Blockers analysis
  const unresolvedBlockers = useMemo(() => {
    return (issue.blockedByIssues || []).filter(
      (b) => b.status.toLowerCase() !== 'done'
    );
  }, [issue.blockedByIssues]);

  const resolvedType = selectedType;

  const epicChildIssues = useMemo(() => {
    if (selectedType !== 'EPIC') return [];
    return allIssues.filter(
      (i) => i.parentIssueId === issue.key || (i.parent && i.parent.key === issue.key)
    );
  }, [allIssues, issue.key, selectedType]);

  const isDirty = useMemo(() => {
    const origType = (issue.issueType || issue.type || 'TASK').toUpperCase();
    const origPriority = issue.priority || 'Medium';
    const origAssignee = issue.assigneeId || null;
    const origParent = issue.parentIssueId || null;
    const origPoints = issue.storyPoints ?? 0;
    const origDueDate = issue.dueDate || null;
    const origEst = issue.originalEstimateHours ?? null;
    const origRem = issue.remainingEstimateHours ?? null;
    const origSprint = issue.sprintId || null;
    const origColor = issue.epicColor || '#3B82F6';
    const origEnv: 'LIVE' | 'DEMO' = isDemoIssue(issue) ? 'DEMO' : 'LIVE';

    return (
      titleInput.trim() !== (issue.title || '').trim() ||
      descInput.trim() !== (issue.description || '').trim() ||
      selectedType !== origType ||
      selectedPriority !== origPriority ||
      selectedAssigneeId !== origAssignee ||
      (selectedType !== 'EPIC' && selectedParentId !== origParent) ||
      selectedPoints !== origPoints ||
      (selectedDueDate || null) !== origDueDate ||
      (selectedOriginalEstimate ?? null) !== origEst ||
      (selectedRemainingEstimate ?? null) !== origRem ||
      selectedSprintId !== origSprint ||
      (selectedType === 'EPIC' && selectedEpicColor !== origColor) ||
      selectedEnvironment !== origEnv
    );
  }, [
    titleInput,
    descInput,
    selectedType,
    selectedPriority,
    selectedAssigneeId,
    selectedParentId,
    selectedPoints,
    selectedDueDate,
    selectedOriginalEstimate,
    selectedRemainingEstimate,
    selectedSprintId,
    selectedEpicColor,
    selectedEnvironment,
    issue,
  ]);

  const setDateFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const setEstimateHours = (hours: number) => {
    setSelectedOriginalEstimate(hours);
    if (selectedRemainingEstimate === null || selectedRemainingEstimate === undefined) {
      setSelectedRemainingEstimate(hours);
    }
  };

  const getDueDateBadge = (dueDateStr: string | null, isDone: boolean) => {
    if (!dueDateStr) return null;
    const parts = dueDateStr.split('-');
    if (parts.length !== 3) return null;
    const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = due.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    if (isDone) {
      return {
        label: `Completed (${formattedDate})`,
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
      };
    }

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        label: `Overdue by ${overdueDays}d (${formattedDate})`,
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-semibold',
      };
    }

    if (diffDays === 0) {
      return {
        label: 'Due today',
        className: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 font-semibold',
      };
    }

    if (diffDays === 1) {
      return {
        label: 'Due tomorrow',
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-medium',
      };
    }

    return {
      label: `Due in ${diffDays}d (${formattedDate})`,
      className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium',
    };
  };

  const handleDiscardChanges = () => {
    setTitleInput(issue.title);
    setDescInput(issue.description || '');
    setSelectedType((issue.issueType || issue.type || 'TASK').toUpperCase());
    setSelectedPriority(issue.priority || 'Medium');
    setSelectedAssigneeId(issue.assigneeId || null);
    setSelectedParentId(issue.parentIssueId || null);
    setSelectedPoints(issue.storyPoints ?? 0);
    setSelectedDueDate(issue.dueDate || null);
    setSelectedOriginalEstimate(issue.originalEstimateHours ?? null);
    setSelectedRemainingEstimate(issue.remainingEstimateHours ?? null);
    setSelectedSprintId(issue.sprintId || null);
    setSelectedEpicColor(issue.epicColor || '#3B82F6');
    setSelectedEnvironment(isDemoIssue(issue) ? 'DEMO' : 'LIVE');
    setIsEditingTitle(false);
    setIsEditingDesc(false);
    showToast('Changes discarded', 'error');
  };

  const handleSaveAll = () => {
    if (isViewer) return;
    if (!titleInput.trim()) {
      showToast('Card title cannot be empty', 'error');
      return;
    }

    onUpdateIssue({
      title: titleInput.trim(),
      description: descInput.trim(),
      issueType: selectedType,
      type: (selectedType.charAt(0).toUpperCase() + selectedType.slice(1).toLowerCase()) as IssueType,
      priority: selectedPriority,
      assigneeId: selectedAssigneeId,
      parentIssueId: selectedType === 'EPIC' ? null : selectedParentId,
      storyPoints:
        selectedType === 'EPIC' && epicChildIssues.length > 0
          ? epicChildIssues.reduce((sum, c) => sum + (Number(c.storyPoints) || 0), 0)
          : Number(selectedPoints) || 0,
      originalEstimateHours: selectedOriginalEstimate != null ? Number(selectedOriginalEstimate) : null,
      remainingEstimateHours:
        selectedRemainingEstimate != null
          ? Number(selectedRemainingEstimate)
          : selectedOriginalEstimate != null
          ? Number(selectedOriginalEstimate)
          : null,
      dueDate: selectedDueDate || null,
      sprintId: selectedSprintId,
      epicColor: selectedType === 'EPIC' ? selectedEpicColor : undefined,
      environment: selectedEnvironment,
    });

    setIsEditingTitle(false);
    setIsEditingDesc(false);
    setSavedJustNow(true);
    setTimeout(() => setSavedJustNow(false), 2500);
    showToast(`${selectedType || 'Card'} saved successfully!`, 'success');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveAll]);

  const typeConfig = getTypeConfig(issue.type);
  const priorityConfig = getPriorityConfig(issue.priority);

  // Status transition handler with rule enforcement
  const handleTransitionStatus = async (targetStatus: string, override = false) => {
    if (isViewer) {
      showToast('Viewers cannot change status.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await transitionIssueStatusAction({
        issueId: issue.key,
        targetStatusId: targetStatus,
        overrideBlockers: override,
      });

      if (res.success) {
        setTransitionError(null);
        onStatusChange(targetStatus);
        showToast(res.message || `Moved to ${targetStatus}`);
      } else {
        setTransitionError({
          message: res.error || 'Failed to move issue.',
          isBlocked: res.isBlocked,
          targetStatusId: targetStatus,
        });
        showToast(res.error || 'Transition denied by workflow rules', 'error');
      }
    });
  };

  const handleSaveTitle = () => {
    if (!titleInput.trim() || titleInput === issue.title) {
      setIsEditingTitle(false);
      return;
    }
    onUpdateIssue({ title: titleInput.trim() });
    setIsEditingTitle(false);
    showToast('Title updated');
  };

  const handleSaveDescription = () => {
    onUpdateIssue({ description: descInput.trim() });
    setIsEditingDesc(false);
    showToast('Description updated');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const title = newSubtask.trim();
    setNewSubtask('');

    startTransition(async () => {
      const res = await addSubtask(issue.key, title);
      if (res.success) {
        setLocalSubtasks((prev) => [
          ...prev,
          {
            id: res.id || `st-${Date.now()}`,
            issueId: issue.key,
            title,
            completed: false,
            sortOrder: prev.length,
          },
        ]);
        showToast('Subtask added');
      } else {
        showToast(res.error || 'Failed to add subtask', 'error');
      }
    });
  };

  const handleToggleSubtask = (stId: string, current: boolean) => {
    setLocalSubtasks((prev) =>
      prev.map((s) => (s.id === stId ? { ...s, completed: !current } : s))
    );
    startTransition(async () => {
      const res = await toggleSubtask(stId, !current);
      if (!res.success) {
        showToast('Failed to update subtask', 'error');
      }
    });
  };

  const handleDeleteSubtask = (stId: string) => {
    setLocalSubtasks((prev) => prev.filter((s) => s.id !== stId));
    startTransition(async () => {
      const res = await deleteSubtask(stId);
      if (!res.success) {
        showToast('Failed to delete subtask', 'error');
      }
    });
  };

  const handleAddLink = async () => {
    if (!linkTarget.trim()) return;
    setLinkError('');
    startTransition(async () => {
      const res = await linkIssuesAction({
        sourceIssueId: issue.key,
        targetIssueId: linkTarget.trim(),
        linkType,
      });

      if (res.success) {
        showToast(res.message || 'Issues linked successfully');
        setIsAddingLink(false);
        setLinkTarget('');
      } else {
        setLinkError(res.error || 'Failed to link issues');
        showToast(res.error || 'Failed to link issues', 'error');
      }
    });
  };

  const handleRemoveLink = (linkId: string) => {
    startTransition(async () => {
      const res = await unlinkIssuesAction({ linkId });
      if (res.success) {
        showToast('Link removed');
      } else {
        showToast(res.error || 'Failed to remove link', 'error');
      }
    });
  };

  const handleAddGitRef = async () => {
    if (!gitRefName.trim() || !gitUrl.trim()) return;
    startTransition(async () => {
      const res = await linkGitRefAction({
        issueId: issue.key,
        repoFullName: gitRepo.trim(),
        refType: gitRefType,
        refName: gitRefName.trim(),
        url: gitUrl.trim(),
      });

      if (res.success) {
        showToast(res.message || 'Git reference linked');
        setIsAddingGit(false);
        setGitRefName('');
        setGitUrl('');
      } else {
        showToast(res.error || 'Failed to link git ref', 'error');
      }
    });
  };

  const handleLogWork = async () => {
    if (logHoursSpent <= 0) return;
    startTransition(async () => {
      const res = await logWorkAction({
        issueKey: issue.key,
        hoursSpent: Number(logHoursSpent),
        remainingHours: logRemainingHours !== '' ? Number(logRemainingHours) : null,
        comment: logComment,
      });

      if (res.success) {
        showToast(res.message || 'Work logged');
        setIsLogWorkOpen(false);
        setLogComment('');
      } else {
        showToast(res.error || 'Failed to log work', 'error');
      }
    });
  };

  const isProjectManager =
    currentUser.role === 'Admin' ||
    (currentUser as any).department?.toUpperCase() === 'CTO' ||
    (currentUser as any).role === 'PROJECT_MANAGER';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div
        className="w-full max-w-[56rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl relative animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-drawer-title"
      >
        {/* Toast Notification (Floating bottom-right pill, never overlapping header) */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-[100] max-w-sm px-4 py-2.5 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-auto ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/40 shadow-rose-950/50'
                : 'bg-slate-900/95 dark:bg-slate-800/95 text-white border-slate-700/80 shadow-black/50'
            }`}
            role="status"
            aria-live="polite"
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="flex-1">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Understated Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
              {parentEpic ? (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateIssue && onNavigateIssue(parentEpic.key)}
                    className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
                    title={`Parent Epic: ${parentEpic.title}`}
                  >
                    <span className="font-mono text-slate-700 dark:text-slate-300">{parentEpic.key}</span>
                    <span className="text-slate-400 dark:text-slate-600">/</span>
                    <span className="truncate max-w-[150px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">{parentEpic.title}</span>
                  </button>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                </>
              ) : null}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{issue.key}</span>
            </div>

            <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Compact Issue Type Pill with 8px dot */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="capitalize">{resolvedType.toLowerCase()}</span>
            </span>

            {/* Compact Status Pill with 8px dot */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  issue.status === 'Done'
                    ? 'bg-emerald-500'
                    : issue.status === 'In Progress'
                    ? 'bg-amber-500 animate-pulse'
                    : issue.status === 'In Review'
                    ? 'bg-purple-500'
                    : 'bg-slate-400'
                }`}
              />
              <span>{issue.status}</span>
            </span>

            {/* Compact Environment / Classification Pill with 8px dot */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedEnvironment === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'
                }`}
              />
              <span>{selectedEnvironment === 'LIVE' ? 'Live' : 'Demo'}</span>
            </span>

            {/* Flagged impediment badge */}
            {issue.isFlagged && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Flag className="w-3 h-3 fill-rose-400" />
                Impediment
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Real-time Teammate Presence — requires WebSocket backend */}
            {activeViewers.length > 0 ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs shadow-xs"
                title={`${activeViewers.map((v) => v.name).join(', ')} currently viewing this ticket`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex -space-x-1.5 overflow-hidden">
                  {activeViewers.map((v) => (
                    <UserAvatar key={v.id} user={v} size="xs" />
                  ))}
                </div>
                <span className="text-[11px] font-medium hidden sm:inline">
                  {activeViewers[0].name.split(' ')[0]}
                  {activeViewers.length > 1 ? ` +${activeViewers.length - 1} viewing` : ' viewing'}
                </span>
              </div>
            ) : null}

            {/* Primary Save Button */}
            {!isViewer && (
              <button
                onClick={handleSaveAll}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                  savedJustNow
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                    : isDirty
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
                title={isDirty ? 'Save changes (⌘+S)' : 'Save changes (⌘+S)'}
              >
                {savedJustNow ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save className={`w-3.5 h-3.5 ${isDirty ? 'text-white' : 'text-slate-400'}`} />
                    <span>{isDirty ? 'Save Changes' : 'Save'}</span>
                    <span className="text-[10px] opacity-70 font-mono ml-0.5 hidden sm:inline">⌘S</span>
                  </>
                )}
                {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blocker Alert Warning Banner */}
        {unresolvedBlockers.length > 0 && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900 dark:text-rose-200">
                This issue is blocked by {unresolvedBlockers.length} open ticket{unresolvedBlockers.length > 1 ? 's' : ''}:
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {unresolvedBlockers.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => onNavigateIssue && onNavigateIssue(b.key)}
                    className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-500/40 font-mono text-[11px] text-rose-800 dark:text-rose-200 transition"
                  >
                    {b.key}: {b.title} ({b.status})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transition Error Modal / Banner */}
        {transitionError && (
          <div className="mx-6 mt-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">Workflow Transition Denied</p>
                <p className="text-amber-700 dark:text-amber-300/90 mt-0.5">{transitionError.message}</p>
              </div>
            </div>
            {transitionError.isBlocked && isProjectManager && transitionError.targetStatusId && (
              <button
                onClick={() => handleTransitionStatus(transitionError.targetStatusId!, true)}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition text-[11px]"
              >
                Override as PM
              </button>
            )}
          </div>
        )}

        {/* Title Area */}
        <div className="px-6 pt-4 pb-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-blue-500 rounded-lg px-3 py-1.5 text-base font-semibold text-slate-900 dark:text-white focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              onClick={() => !isViewer && setIsEditingTitle(true)}
              className="group flex items-start justify-between cursor-pointer rounded-lg p-1.5 -ml-1.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition"
              title={!isViewer ? 'Click to edit title' : ''}
            >
              <h2 id="issue-drawer-title" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                {issue.title}
              </h2>
              {!isViewer && (
                <Edit3 className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition mt-1" />
              )}
            </div>
          )}
        </div>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Context & Work Area */}
          <div className="md:col-span-8 space-y-4">
            {/* Description Block */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewDesc(!isPreviewDesc)}
                    className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    {isPreviewDesc ? 'Edit View' : 'Preview Markdown'}
                  </button>
                  {!isViewer && !isEditingDesc && !isPreviewDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditingDesc || !issue.description ? (
                <div className="space-y-2">
                  {/* Linear-grade Slash Commands Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider">Slash Commands:</span>
                    <button
                      type="button"
                      onClick={() => insertSlashTemplateIntoDesc('todo')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-mono transition cursor-pointer"
                      title="Insert checklist items"
                    >
                      <CheckSquare className="w-3 h-3 text-emerald-500" /> /todo
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSlashTemplateIntoDesc('table')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-mono transition cursor-pointer"
                      title="Insert markdown table"
                    >
                      <Table className="w-3 h-3 text-blue-500" /> /table
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSlashTemplateIntoDesc('code')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-mono transition cursor-pointer"
                      title="Insert code block"
                    >
                      <Code className="w-3 h-3 text-purple-500" /> /code
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSlashTemplateIntoDesc('quote')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-mono transition cursor-pointer"
                      title="Insert callout or quote"
                    >
                      <Quote className="w-3 h-3 text-amber-500" /> /quote
                    </button>
                  </div>

                  <textarea
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Add a detailed markdown description... (Type or click /todo, /table, /code, /quote)"
                    rows={6}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSaveDescription}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Save Description
                    </button>
                  </div>
                </div>
              ) : isPreviewDesc ? (
                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{descInput}</ReactMarkdown>
                </div>
              ) : (
                <div
                  onClick={() => !isViewer && setIsEditingDesc(true)}
                  className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 cursor-pointer p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{descInput}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Subtasks Checklist Block */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subtasks</span>
                </div>
                {localSubtasks.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {doneSubtasks}/{localSubtasks.length} ({subtaskPct}%)
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {localSubtasks.length > 0 && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskPct}%` }}
                  />
                </div>
              )}

              {/* Subtask list */}
              <div className="space-y-1.5">
                {localSubtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id, st.completed)}
                        disabled={isViewer}
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span
                        className={`text-sm ${
                          st.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    {!isViewer && (
                      <button
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add subtask creator */}
              {!isViewer && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="+ Add a subtask..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Issue Links / Relationships Block */}
            {(issue.links || []).length > 0 || isAddingLink ? (
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Issue Links</span>
                  </div>
                  {!isViewer && (
                    <button
                      onClick={() => setIsAddingLink(!isAddingLink)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      {isAddingLink ? 'Cancel' : '+ Link Issue'}
                    </button>
                  )}
                </div>

                {/* Link Creator Form */}
                {isAddingLink && (
                  <div className="mb-4 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <select
                        value={linkType}
                        onChange={(e) => setLinkType(e.target.value as EnterpriseLinkType)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                      >
                        <option value="BLOCKS">blocks</option>
                        <option value="IS_BLOCKED_BY">is blocked by</option>
                        <option value="RELATES_TO">relates to</option>
                        <option value="DUPLICATES">duplicates</option>
                      </select>

                      <input
                        type="text"
                        value={linkTarget}
                        onChange={(e) => setLinkTarget(e.target.value)}
                        placeholder="Target Key (e.g. KYN-102)"
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition"
                      />
                    </div>

                    {linkError && <p className="text-xs text-rose-500">{linkError}</p>}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleAddLink}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                      >
                        Create Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Render Linked Issues */}
                <div className="space-y-2">
                  {(issue.links || []).map((l) => {
                    const isSource = l.sourceIssueId === issue.key;
                    const otherKey = isSource ? l.targetIssueId : l.sourceIssueId;
                    const rawLType = (l.linkType || (l as any).relationType || 'RELATES_TO').toUpperCase();
                    const displayLabel = isSource
                      ? LINK_LABELS[rawLType] || rawLType
                      : rawLType === 'BLOCKS'
                      ? 'is blocked by'
                      : rawLType === 'IS_BLOCKED_BY'
                      ? 'blocks'
                      : LINK_LABELS[rawLType] || rawLType;

                    const targetFull = allIssues.find((i) => i.key === otherKey);

                    return (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{displayLabel}</span>
                          <button
                            onClick={() => onNavigateIssue && onNavigateIssue(otherKey)}
                            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {otherKey}
                          </button>
                          {targetFull && (
                            <>
                              <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{targetFull.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {targetFull.status}
                              </span>
                            </>
                          )}
                        </div>

                        {!isViewer && (
                          <button
                            onClick={() => handleRemoveLink(l.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Remove Link"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={isViewer}
                onClick={() => setIsAddingLink(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white/50 hover:bg-white dark:bg-slate-900/20 dark:hover:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                <span>+ Link Issue</span>
              </button>
            )}

            {/* Development / Git Panel */}
            {(issue.gitLinks || []).length > 0 || isAddingGit ? (
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Development</span>
                  </div>
                  {!isViewer && (
                    <button
                      onClick={() => setIsAddingGit(!isAddingGit)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      {isAddingGit ? 'Cancel' : '+ Link Git Ref'}
                    </button>
                  )}
                </div>

                {/* Add Git Link Modal / Form */}
                {isAddingGit && (
                  <div className="mb-4 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={gitRefType}
                        onChange={(e) => setGitRefType(e.target.value as any)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                      >
                        <option value="BRANCH">Branch</option>
                        <option value="PULL_REQUEST">Pull Request</option>
                        <option value="COMMIT">Commit</option>
                      </select>

                      <input
                        type="text"
                        value={gitRefName}
                        onChange={(e) => setGitRefName(e.target.value)}
                        placeholder={gitRefType === 'BRANCH' ? 'feat/kyn-101-upgrade' : gitRefType === 'PULL_REQUEST' ? '#42 PR Title' : 'a1b2c3d'}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition"
                      />

                      <input
                        type="text"
                        value={gitUrl}
                        onChange={(e) => setGitUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleAddGitRef}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                      >
                        Link Reference
                      </button>
                    </div>
                  </div>
                )}

                {/* Git links list */}
                <div className="space-y-2">
                  {(issue.gitLinks || []).map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {g.refType === 'BRANCH' ? (
                          <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                        ) : g.refType === 'PULL_REQUEST' ? (
                          <GitPullRequest className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <GitCommit className="w-3.5 h-3.5 text-purple-500" />
                        )}
                        <a
                          href={g.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-slate-800 dark:text-slate-200 hover:text-blue-500 flex items-center gap-1 hover:underline"
                        >
                          {g.refName}
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            g.status === 'MERGED'
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'
                              : g.status === 'CLOSED'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {g.status || 'OPEN'}
                        </span>
                      </div>

                      {!isViewer && (
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              await unlinkGitRefAction(g.id);
                              showToast('Git reference removed');
                            });
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={isViewer}
                onClick={() => setIsAddingGit(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white/50 hover:bg-white dark:bg-slate-900/20 dark:hover:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-slate-400" />
                <span>+ Link PR</span>
              </button>
            )}

            {/* Activity Streams Tabs: Comments, History (Audit Log), Work Log */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center gap-5 border-b border-slate-200 dark:border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`text-xs font-semibold uppercase tracking-wider pb-2 transition border-b-2 cursor-pointer ${
                    activeTab === 'comments'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Comments ({issue.comments?.length ?? 0})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition border-b-2 cursor-pointer ${
                    activeTab === 'history'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  History / Audit ({issue.auditLogs?.length || issue.history?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('worklog')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition border-b-2 cursor-pointer ${
                    activeTab === 'worklog'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Work Log & ETA
                </button>
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add comment box with integrated compact ghost toolbar */}
                  {!isViewer && (
                    <div className="space-y-3">
                      <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition">
                        <textarea
                          ref={commentTextareaRef}
                          value={commentText}
                          onChange={handleCommentChange}
                          onKeyDown={handleCommentKeyDown}
                          placeholder="Add a comment... (Type @ to tag a user, Markdown supported)"
                          rows={3}
                          className="w-full bg-transparent p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
                        />

                        {/* User Mention Autocomplete Popup */}
                        {showMentionList && filteredMentionUsers.length > 0 && (
                          <div
                            ref={mentionDropdownRef}
                            className="absolute left-2 bottom-full mb-1.5 z-50 w-72 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in slide-in-from-bottom-1 duration-150"
                          >
                            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between mb-1">
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <AtSign className="w-3 h-3" /> Mention User
                              </span>
                              <span className="text-[9px] font-normal text-slate-400">↑↓ navigate • ↵ tag</span>
                            </div>
                            {filteredMentionUsers.map((u, idx) => {
                              const handle = u.email ? u.email.split('@')[0] : u.name.replace(/\s+/g, '');
                              const isSelected = idx === selectedMentionIdx;
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => handleSelectUserMention(u)}
                                  onMouseEnter={() => setSelectedMentionIdx(idx)}
                                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  <UserAvatar user={u} size="xs" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate leading-tight">{u.name}</p>
                                    <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                      @{handle}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Compact Bottom Toolbar inside input container */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-b-xl">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={triggerMention}
                              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                              title="Mention user (@)"
                            >
                              <AtSign className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => insertSlashTemplateIntoComment('todo')}
                              className="px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer"
                              title="Insert checklist (/todo)"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">/todo</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => insertSlashTemplateIntoComment('code')}
                              className="px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer"
                              title="Insert code block (/code)"
                            >
                              <Code className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">/code</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => insertSlashTemplateIntoComment('table')}
                              className="px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer"
                              title="Insert table (/table)"
                            >
                              <Table className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">/table</span>
                            </button>

                            {detectedMentions.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 ml-2">
                                <span className="text-slate-400">Mentioning:</span>
                                {detectedMentions.map((handle) => (
                                  <span
                                    key={handle}
                                    className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                  >
                                    @{handle}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (!commentText.trim()) return;
                              onAddComment(commentText.trim());
                              setCommentText('');
                              setShowMentionList(false);
                              showToast('Comment posted');
                            }}
                            disabled={!commentText.trim()}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments list */}
                  <div className="space-y-3">
                    {(issue.comments || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No comments yet.</p>
                    ) : (
                      (issue.comments || []).map((c) => (
                        <div key={c.id} className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {c.author?.name || 'Workspace User'}
                            </span>
                            <span className="font-mono text-[10px]">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="prose prose-slate dark:prose-invert prose-xs text-slate-700 dark:text-slate-300">
                            {renderCommentBody(c.body)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* History / Audit Log Tab */}
              {activeTab === 'history' && (
                <div className="space-y-2">
                  {(issue.auditLogs && issue.auditLogs.length > 0) ? (
                    issue.auditLogs.map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{a.fieldChanged}</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                            {a.oldValue ? `from "${a.oldValue}"` : ''} to <strong className="text-blue-600 dark:text-blue-400">"{a.newValue}"</strong>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (issue.history && issue.history.length > 0) ? (
                    issue.history.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between"
                      >
                        <div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{h.action}</span>
                          {h.field && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                              ({h.field}: {h.fromValue} &rarr; {h.toValue})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No audit history recorded.</p>
                  )}
                </div>
              )}

              {/* Work Log Tab */}
              {activeTab === 'worklog' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-medium">Estimated Hours</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        {selectedOriginalEstimate ?? issue.originalEstimateHours ?? 0}h original / {selectedRemainingEstimate ?? issue.remainingEstimateHours ?? 0}h remaining
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-medium">Target ETA / Due Date</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {selectedDueDate || issue.dueDate || 'No due date set'}
                        </span>
                      </div>
                      {!isViewer && (
                        <button
                          onClick={() => setIsLogWorkOpen(true)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          + Log Work
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Log Work Modal Inline */}
                  {isLogWorkOpen && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-500/40 shadow-lg space-y-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Log Time Worked</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Time Spent (Hours)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={logHoursSpent}
                            onChange={(e) => setLogHoursSpent(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Remaining Estimate (Hours)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={logRemainingHours}
                            onChange={(e) => setLogRemainingHours(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Work Description (Optional)</label>
                        <input
                          type="text"
                          value={logComment}
                          onChange={(e) => setLogComment(e.target.value)}
                          placeholder="What did you work on?"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsLogWorkOpen(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleLogWork}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Save Work Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Unified Metadata Property Inspector Sidebar */}
          <div className="md:col-span-4 space-y-3">
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {/* Status */}
              <div className="pb-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <select
                  value={issue.status}
                  onChange={(e) => handleTransitionStatus(e.target.value)}
                  disabled={isViewer}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs font-medium text-slate-800 dark:text-slate-200 border-0 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition"
                >
                  {swimlanes.length > 0 ? (
                    swimlanes.map((s) => (
                      <option key={s.id} value={s.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {s.name}
                      </option>
                    ))
                  ) : (
                    ['To Do', 'In Progress', 'In Review', 'Done'].map((st) => (
                      <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {st}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Parent Epic (if not Epic) */}
              {resolvedType !== 'EPIC' && (
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Parent Epic</span>
                  <select
                    value={selectedParentId || ''}
                    onChange={(e) => setSelectedParentId(e.target.value || null)}
                    disabled={isViewer}
                    className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs text-slate-800 dark:text-slate-200 border-0 rounded-md px-2 py-1 max-w-[170px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-400">None (No Epic)</option>
                    {availableEpics.map((ep) => (
                      <option key={ep.key} value={ep.key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {ep.key} - {ep.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Issue Type */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issue Type</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={isViewer}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs font-medium text-slate-800 dark:text-slate-200 border-0 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition"
                >
                  <option value="STORY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Story</option>
                  <option value="TASK" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Task</option>
                  <option value="BUG" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bug</option>
                  <option value="EPIC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Epic</option>
                  <option value="SUBTASK" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Subtask</option>
                </select>
              </div>

              {/* Classification: Live vs Demo */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Classification</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={isViewer}
                    onClick={() => setSelectedEnvironment('LIVE')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      selectedEnvironment === 'LIVE'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${selectedEnvironment === 'LIVE' ? 'animate-pulse' : 'opacity-40'}`} />
                    Live
                  </button>
                  <button
                    type="button"
                    disabled={isViewer}
                    onClick={() => setSelectedEnvironment('DEMO')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      selectedEnvironment === 'DEMO'
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-purple-500 ${selectedEnvironment === 'DEMO' ? '' : 'opacity-40'}`} />
                    Demo
                  </button>
                </div>
              </div>

              {/* Assignee */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assignee</span>
                <div className="flex items-center gap-2">
                  {issue.assignee && <UserAvatar user={issue.assignee} size="xs" />}
                  <select
                    value={selectedAssigneeId || ''}
                    onChange={(e) => setSelectedAssigneeId(e.target.value || null)}
                    disabled={isViewer}
                    className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs text-slate-800 dark:text-slate-200 border-0 rounded-md px-2 py-1 max-w-[160px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-400">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Story Points */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Story Points</span>
                  {selectedType === 'EPIC' && epicChildIssues.length > 0 && (
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.2 rounded">
                      Rollup
                    </span>
                  )}
                </div>
                {selectedType === 'EPIC' && epicChildIssues.length > 0 ? (
                  <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-md">
                    <span>{epicChildIssues.reduce((sum, c) => sum + (Number(c.storyPoints) || 0), 0)} pts</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">({epicChildIssues.length} issues)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 justify-end">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedPoints}
                      onChange={(e) => setSelectedPoints(parseInt(e.target.value) || 0)}
                      disabled={isViewer}
                      className="w-16 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs text-slate-800 dark:text-slate-200 font-mono border-0 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition"
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono pr-1">pts</span>
                  </div>
                )}
              </div>

              {/* ETA & Target Due Date */}
              <div className="py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target ETA (Due Date)</span>
                  </div>
                  {selectedDueDate && !isViewer && (
                    <button
                      type="button"
                      onClick={() => setSelectedDueDate(null)}
                      className="text-[10px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Clear Target Date"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDueDate || ''}
                    onChange={(e) => setSelectedDueDate(e.target.value || null)}
                    disabled={isViewer}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono transition cursor-pointer"
                  />
                </div>

                {/* Quick Date Presets */}
                {!isViewer && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Set:</span>
                    <button
                      type="button"
                      onClick={() => setDateFromNow(0)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFromNow(1)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFromNow(3)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      +3d
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFromNow(7)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      +1w
                    </button>
                  </div>
                )}

                {/* Badge indication */}
                {selectedDueDate && (
                  <div className="pt-0.5">
                    {(() => {
                      const badge = getDueDateBadge(selectedDueDate, issue.status === 'Done');
                      if (!badge) return null;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${badge.className}`}>
                          <Clock className="w-3 h-3" />
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Estimated Effort (ETA Hours) */}
              <div className="py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Estimated Effort (ETA)</span>
                  </div>
                  {selectedOriginalEstimate !== null && selectedOriginalEstimate !== undefined && !isViewer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOriginalEstimate(null);
                        setSelectedRemainingEstimate(null);
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Clear Estimate"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="0.5"
                    placeholder="e.g. 4"
                    value={selectedOriginalEstimate ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0);
                      setSelectedOriginalEstimate(val);
                      if (selectedRemainingEstimate === null || selectedRemainingEstimate === undefined) {
                        setSelectedRemainingEstimate(val);
                      }
                    }}
                    disabled={isViewer}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-10 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                    hrs
                  </span>
                </div>

                {/* Quick Hour Chips */}
                {!isViewer && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
                    {[
                      { label: '1h', hours: 1 },
                      { label: '2h', hours: 2 },
                      { label: '4h', hours: 4 },
                      { label: '8h (1d)', hours: 8 },
                      { label: '16h (2d)', hours: 16 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setEstimateHours(preset.hours)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                          selectedOriginalEstimate === preset.hours
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Work Log / Progress summary if estimate exists */}
                {selectedOriginalEstimate != null && selectedOriginalEstimate > 0 && (
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                      <span>Original: {selectedOriginalEstimate}h</span>
                      <span>Remaining: {selectedRemainingEstimate ?? selectedOriginalEstimate}h</span>
                    </div>
                    {(() => {
                      const orig = selectedOriginalEstimate || 1;
                      const rem = selectedRemainingEstimate != null ? selectedRemainingEstimate : orig;
                      const spent = Math.max(0, orig - rem);
                      const pct = Math.min(100, Math.round((spent / orig) * 100));
                      return (
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Priority</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as IssuePriority)}
                  disabled={isViewer}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs font-medium text-slate-800 dark:text-slate-200 border-0 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition"
                >
                  {['Critical', 'High', 'Medium', 'Low', 'Lowest'].map((p) => (
                    <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sprint Assignment */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sprint</span>
                <select
                  value={selectedSprintId || 'Backlog'}
                  onChange={(e) =>
                    setSelectedSprintId(e.target.value === 'Backlog' ? null : e.target.value)
                  }
                  disabled={isViewer}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-right text-xs text-slate-800 dark:text-slate-200 border-0 rounded-md px-2 py-1 max-w-[160px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition"
                >
                  {availableSprints.map((s) => {
                    const stateStr = ((s as any).status || s.state || '').toUpperCase();
                    const stateLabel =
                      stateStr === 'ACTIVE'
                        ? 'Active'
                        : stateStr === 'CLOSED'
                        ? 'Closed'
                        : 'Upcoming';
                    return (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {s.name} ({stateLabel})
                      </option>
                    );
                  })}
                  <option value="Backlog" className="bg-white dark:bg-slate-900 text-slate-400">Backlog (Unassigned)</option>
                </select>
              </div>

              {/* Epic Theme Color & Child Issues (when Epic) */}
              {selectedType === 'EPIC' && (
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Theme Color</span>
                  <div className="flex items-center gap-1.5">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        disabled={isViewer}
                        onClick={() => setSelectedEpicColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                          selectedEpicColor === color ? 'ring-2 ring-slate-800 dark:ring-white scale-125' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={`Theme ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Flag as Impediment Button */}
              {!isViewer && (
                <div className="pt-2.5">
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        const res = await toggleIssueFlag(issue.key);
                        if (res.success) {
                          showToast(res.flagged ? 'Flagged as impediment' : 'Impediment flag cleared');
                        }
                      });
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition border cursor-pointer ${
                      issue.isFlagged
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 hover:bg-rose-500/20'
                        : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${issue.isFlagged ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    <span>{issue.isFlagged ? 'Clear Impediment Flag' : 'Flag as Impediment'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Child Stories / Tasks (when Epic) */}
            {selectedType === 'EPIC' && epicChildIssues.length > 0 && (
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Child Issues ({epicChildIssues.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                  {epicChildIssues.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => onNavigateIssue && onNavigateIssue(child.key)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">{child.key}</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white">{child.title}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {child.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delete Issue Danger Zone */}
            {!isViewer && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${issue.key}?`)) {
                      onDelete();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Issue
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Unsaved Changes Action Bar */}
        {isDirty && !isViewer && (
          <div className="sticky bottom-0 z-40 px-6 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Unsaved changes to this {selectedType.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscardChanges}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Discard
              </button>
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save {selectedType}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
