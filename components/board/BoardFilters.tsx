'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter,
  Code,
  Search,
  Zap,
  X,
  Layers,
  ChevronDown,
  User as UserIcon,
  Check,
  Bookmark,
  CircleDot,
  Bug,
  ShieldCheck,
} from 'lucide-react';
import { FullIssue, User, WorkspaceMetrics, isDemoIssue } from '@/lib/types';

const PRIORITIES = [
  { key: 'Critical', label: 'Critical', dotColor: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
  { key: 'High', label: 'High', dotColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'Medium', label: 'Medium', dotColor: 'bg-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'Low', label: 'Low', dotColor: 'bg-slate-400', textColor: 'text-slate-600 dark:text-slate-400' },
] as const;

const ISSUE_TYPES = [
  { key: 'Story', label: 'Story', icon: Bookmark, iconColor: 'text-emerald-500' },
  { key: 'Task', label: 'Task', icon: CircleDot, iconColor: 'text-blue-500' },
  { key: 'Bug', label: 'Bug', icon: Bug, iconColor: 'text-rose-500' },
  { key: 'Epic', label: 'Epic', icon: Zap, iconColor: 'text-purple-500' },
] as const;

const DATA_SCOPES = [
  { key: 'ALL', label: 'All Sources', desc: 'All live and showcase data', dotColor: 'bg-slate-400' },
  { key: 'LIVE', label: 'Live Production', desc: 'Real production workflows', dotColor: 'bg-emerald-500' },
  { key: 'DEMO', label: 'Demo Showcase', desc: 'Showcase and test cards', dotColor: 'bg-purple-500' },
] as const;

export interface BoardFiltersState {
  selectedTypes: string[];
  selectedPriorities: string[];
  selectedAssignee: string;
  selectedEpic: string;
  selectedEnvironment?: 'ALL' | 'LIVE' | 'DEMO';
  onlyMine: boolean;
  jqlQuery: string;
  isJqlMode: boolean;
}

interface BoardFiltersProps {
  filters: BoardFiltersState;
  onChangeFilters: (filters: BoardFiltersState) => void;
  users: User[];
  allIssues: FullIssue[];
  metrics: WorkspaceMetrics;
  currentUserId: string;
}

export function evaluateJqlLite(issue: FullIssue, currentUserId: string, query: string): boolean {
  if (!query.trim()) return true;

  const clauses = query.split(/\s+AND\s+/i);

  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^([a-zA-Z_]+)\s*(!=|<=|>=|=|>|<|~)\s*(.+)$/);
    if (!match) {
      const search = trimmed.toLowerCase();
      const inText =
        issue.key.toLowerCase().includes(search) ||
        issue.title.toLowerCase().includes(search) ||
        (issue.description && issue.description.toLowerCase().includes(search));
      if (!inText) return false;
      continue;
    }

    const field = match[1].toLowerCase();
    const op = match[2];
    let val = match[3].trim().replace(/^['"]|['"]$/g, '');

    if (val.toLowerCase() === 'currentuser()') {
      val = currentUserId;
    }

    if (field === 'assignee' || field === 'assigneeid') {
      const issueAssigneeId = issue.assigneeId || '';
      const issueAssigneeName = issue.assignee?.name?.toLowerCase() || '';
      const matchVal = val.toLowerCase();
      if (op === '=') {
        if (issueAssigneeId !== val && issueAssigneeName !== matchVal) return false;
      } else if (op === '!=') {
        if (issueAssigneeId === val || issueAssigneeName === matchVal) return false;
      }
    } else if (field === 'priority') {
      const issuePri = issue.priority.toLowerCase();
      const matchPri = val.toLowerCase();
      if (op === '=' && issuePri !== matchPri) return false;
      if (op === '!=' && issuePri === matchPri) return false;
    } else if (field === 'status') {
      const issueStat = issue.status.toLowerCase();
      const matchStat = val.toLowerCase();
      if (op === '=' && issueStat !== matchStat) return false;
      if (op === '!=' && issueStat === matchStat) return false;
    } else if (field === 'type' || field === 'issuetype') {
      const issueT1 = (issue.type || '').toLowerCase();
      const issueT2 = (issue.issueType || '').toLowerCase();
      const matchT = val.toLowerCase();
      const isMatch = issueT1 === matchT || issueT2 === matchT;
      if (op === '=' && !isMatch) return false;
      if (op === '!=' && isMatch) return false;
    } else if (field === 'points' || field === 'storypoints') {
      const pts = Number(issue.storyPoints) || 0;
      const targetPts = Number(val) || 0;
      if (op === '=' && pts !== targetPts) return false;
      if (op === '!=' && pts === targetPts) return false;
      if (op === '>' && pts <= targetPts) return false;
      if (op === '<' && pts >= targetPts) return false;
      if (op === '>=' && pts < targetPts) return false;
      if (op === '<=' && pts > targetPts) return false;
    } else if (field === 'flagged' || field === 'isflagged') {
      const isFlag = Boolean(issue.isFlagged);
      const targetBool = val.toLowerCase() === 'true';
      if (op === '=' && isFlag !== targetBool) return false;
      if (op === '!=' && isFlag === targetBool) return false;
    } else if (field === 'blocked') {
      const isBlocked = Boolean(
        issue.blockedByIssues &&
          issue.blockedByIssues.some((b) => b.status.toLowerCase() !== 'done')
      );
      const targetBool = val.toLowerCase() === 'true';
      if (op === '=' && isBlocked !== targetBool) return false;
      if (op === '!=' && isBlocked === targetBool) return false;
    } else if (field === 'epic' || field === 'parent') {
      const parentKey = issue.parentIssueId || issue.parent?.key || '';
      const matchKey = val.toUpperCase();
      if (op === '=' && parentKey.toUpperCase() !== matchKey) return false;
      if (op === '!=' && parentKey.toUpperCase() === matchKey) return false;
    } else if (field === 'text' || field === 'summary' || field === 'title') {
      const textVal = (issue.title + ' ' + (issue.description || '')).toLowerCase();
      const queryVal = val.toLowerCase();
      if ((op === '~' || op === '=') && !textVal.includes(queryVal)) return false;
    }
  }

  return true;
}

export function BoardFilters({
  filters,
  onChangeFilters,
  users,
  allIssues,
  metrics,
  currentUserId,
}: BoardFiltersProps) {
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);

  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const envDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
        setPriorityDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) {
        setTypeDropdownOpen(false);
      }
      if (envDropdownRef.current && !envDropdownRef.current.contains(target)) {
        setEnvDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPriorityDropdownOpen(false);
        setTypeDropdownOpen(false);
        setEnvDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const epics = useMemo(
    () => allIssues.filter((i) => (i.issueType || i.type || '').toUpperCase() === 'EPIC'),
    [allIssues]
  );

  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    for (const issue of allIssues) {
      const p = (issue.priority || '').toLowerCase();
      if (p === 'critical') counts.Critical++;
      else if (p === 'high') counts.High++;
      else if (p === 'medium' || p === 'med') counts.Medium++;
      else if (p === 'low' || p === 'lowest') counts.Low++;
    }
    return counts;
  }, [allIssues]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Bug: 0,
      Story: 0,
      Task: 0,
      Epic: 0,
    };
    for (const issue of allIssues) {
      const t1 = (issue.type || '').toLowerCase();
      const t2 = (issue.issueType || '').toLowerCase();
      if (t1 === 'bug' || t2 === 'bug') counts.Bug++;
      else if (t1 === 'story' || t2 === 'story') counts.Story++;
      else if (t1 === 'task' || t2 === 'task') counts.Task++;
      else if (t1 === 'epic' || t2 === 'epic') counts.Epic++;
    }
    return counts;
  }, [allIssues]);

  const envCounts = useMemo(() => {
    let live = 0;
    let demo = 0;
    for (const issue of allIssues) {
      if (isDemoIssue(issue)) demo++;
      else live++;
    }
    return { live, demo, all: allIssues.length };
  }, [allIssues]);

  const myIssuesCount = useMemo(() => {
    return allIssues.filter((i) => i.assigneeId === currentUserId).length;
  }, [allIssues, currentUserId]);

  const hasActiveFilters =
    filters.selectedTypes.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedAssignee !== 'ALL' ||
    filters.selectedEpic !== 'ALL' ||
    (filters.selectedEnvironment && filters.selectedEnvironment !== 'ALL') ||
    filters.onlyMine ||
    (filters.isJqlMode && Boolean(filters.jqlQuery.trim()));

  const handleReset = () => {
    setTypeDropdownOpen(false);
    setPriorityDropdownOpen(false);
    setEnvDropdownOpen(false);
    onChangeFilters({
      selectedTypes: [],
      selectedPriorities: [],
      selectedAssignee: 'ALL',
      selectedEpic: 'ALL',
      selectedEnvironment: 'ALL',
      onlyMine: false,
      jqlQuery: '',
      isJqlMode: false,
    });
  };

  const toggleOnlyMine = () => {
    onChangeFilters({
      ...filters,
      onlyMine: !filters.onlyMine,
    });
  };

  const togglePriority = (priority: string) => {
    const isSelected = filters.selectedPriorities.includes(priority);
    const next = isSelected
      ? filters.selectedPriorities.filter((p) => p !== priority)
      : [...filters.selectedPriorities, priority];
    onChangeFilters({
      ...filters,
      selectedPriorities: next,
    });
  };

  const toggleType = (typeKey: string) => {
    const isSelected = filters.selectedTypes.includes(typeKey);
    const next = isSelected
      ? filters.selectedTypes.filter((t) => t !== typeKey)
      : [...filters.selectedTypes, typeKey];
    onChangeFilters({
      ...filters,
      selectedTypes: next,
    });
  };

  const setEnvironment = (env: 'ALL' | 'LIVE' | 'DEMO') => {
    onChangeFilters({
      ...filters,
      selectedEnvironment: env,
    });
    setEnvDropdownOpen(false);
  };

  // Button title labels
  const priorityButtonTitle = useMemo(() => {
    if (filters.selectedPriorities.length === 0) return 'Priority';
    if (filters.selectedPriorities.length === 1) return `Priority: ${filters.selectedPriorities[0]}`;
    return `Priority (${filters.selectedPriorities.length})`;
  }, [filters.selectedPriorities]);

  const typeButtonTitle = useMemo(() => {
    if (filters.selectedTypes.length === 0) return 'Issue Type';
    if (filters.selectedTypes.length === 1) return `Type: ${filters.selectedTypes[0]}`;
    return `Type (${filters.selectedTypes.length})`;
  }, [filters.selectedTypes]);

  const envButtonTitle = useMemo(() => {
    if (!filters.selectedEnvironment || filters.selectedEnvironment === 'ALL') return 'Data Scope';
    if (filters.selectedEnvironment === 'LIVE') return 'Scope: Live';
    return 'Scope: Demo';
  }, [filters.selectedEnvironment]);

  return (
    <div className="relative z-30 bg-white/95 dark:bg-[#0D121D]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-4 py-2 text-xs transition-colors overflow-visible">
      <div className="flex items-center justify-between gap-3 min-w-0 flex-wrap lg:flex-nowrap overflow-visible">
        {/* Left Side: Consolidated 1-Line Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-visible relative">
          {/* Quick "My Issues" Filter */}
          <button
            type="button"
            onClick={toggleOnlyMine}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 active:scale-95 ${
              filters.onlyMine
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
            }`}
            title="Show issues assigned to me"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>My Issues</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                filters.onlyMine
                  ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {myIssuesCount}
            </span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

          {/* 1. Priority Dropdown */}
          {!filters.isJqlMode && (
            <div className={`relative ${priorityDropdownOpen ? 'z-50' : 'z-30'}`} ref={priorityDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setTypeDropdownOpen(false);
                  setEnvDropdownOpen(false);
                  setPriorityDropdownOpen((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer flex-shrink-0 ${
                  filters.selectedPriorities.length > 0
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
                }`}
                title="Filter by priority level"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{priorityButtonTitle}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    priorityDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {priorityDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 z-[100] animate-fade-in">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      Filter by Priority
                    </span>
                    {filters.selectedPriorities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onChangeFilters({ ...filters, selectedPriorities: [] })}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {PRIORITIES.map((pri) => {
                      const isSelected = filters.selectedPriorities.includes(pri.key);
                      const count = priorityCounts[pri.key] ?? 0;
                      return (
                        <button
                          key={pri.key}
                          type="button"
                          onClick={() => togglePriority(pri.key)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] transition-colors ${
                                isSelected
                                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${pri.dotColor}`} />
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              {pri.label}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Issue Type Dropdown (Bug, Story, Task, Epic) */}
          {!filters.isJqlMode && (
            <div className={`relative ${typeDropdownOpen ? 'z-50' : 'z-30'}`} ref={typeDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setPriorityDropdownOpen(false);
                  setEnvDropdownOpen(false);
                  setTypeDropdownOpen((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer flex-shrink-0 ${
                  filters.selectedTypes.length > 0
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
                }`}
                title="Filter by issue type (Bug, Story, Task, Epic)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{typeButtonTitle}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    typeDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {typeDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 z-[100] animate-fade-in">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      Filter by Issue Type
                    </span>
                    {filters.selectedTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onChangeFilters({ ...filters, selectedTypes: [] })}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {ISSUE_TYPES.map((t) => {
                      const isSelected = filters.selectedTypes.includes(t.key);
                      const Icon = t.icon;
                      const count = typeCounts[t.key] ?? 0;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => toggleType(t.key)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] transition-colors ${
                                isSelected
                                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <Icon className={`w-3.5 h-3.5 ${t.iconColor}`} />
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              {t.label}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Data Scope Dropdown (Live & Demo) */}
          {!filters.isJqlMode && (
            <div className={`relative ${envDropdownOpen ? 'z-50' : 'z-30'}`} ref={envDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setPriorityDropdownOpen(false);
                  setTypeDropdownOpen(false);
                  setEnvDropdownOpen((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer flex-shrink-0 ${
                  filters.selectedEnvironment && filters.selectedEnvironment !== 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
                }`}
                title="Filter by Live Production vs Demo Showcase data"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{envButtonTitle}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    envDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {envDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 z-[100] animate-fade-in">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      Data Classification
                    </span>
                    {filters.selectedEnvironment && filters.selectedEnvironment !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setEnvironment('ALL')}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {DATA_SCOPES.map((sc) => {
                      const isSelected =
                        (!filters.selectedEnvironment && sc.key === 'ALL') ||
                        filters.selectedEnvironment === sc.key;
                      const count =
                        sc.key === 'LIVE'
                          ? envCounts.live
                          : sc.key === 'DEMO'
                          ? envCounts.demo
                          : envCounts.all;
                      return (
                        <button
                          key={sc.key}
                          type="button"
                          onClick={() => setEnvironment(sc.key as any)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] transition-colors flex-shrink-0 ${
                                isSelected
                                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dotColor}`} />
                            <div className="min-w-0">
                              <span className="block font-medium text-slate-800 dark:text-slate-200">
                                {sc.label}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-normal truncate">
                                {sc.desc}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold flex-shrink-0 ml-1">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Epic Filter (if any epics exist) */}
          {!filters.isJqlMode && epics.length > 0 && (
            <select
              value={filters.selectedEpic}
              onChange={(e) => onChangeFilters({ ...filters, selectedEpic: e.target.value })}
              className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs flex-shrink-0 font-medium"
            >
              <option value="ALL">All Epics</option>
              {epics.map((ep) => (
                <option key={ep.key} value={ep.key}>
                  {ep.key}: {ep.title}
                </option>
              ))}
            </select>
          )}

          {/* JQL-lite Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setTypeDropdownOpen(false);
              setPriorityDropdownOpen(false);
              setEnvDropdownOpen(false);
              onChangeFilters({ ...filters, isJqlMode: !filters.isJqlMode });
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-[11px] font-semibold transition-all duration-150 active:scale-95 flex-shrink-0 cursor-pointer ${
              filters.isJqlMode
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
            }`}
            title="Toggle Compound JQL-lite Search Syntax"
          >
            <Code className="w-3.5 h-3.5" />
            <span>JQL-lite</span>
          </button>

          {/* JQL Search Input if active */}
          {filters.isJqlMode && (
            <div className="flex-1 min-w-[260px] flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={filters.jqlQuery}
                  onChange={(e) => onChangeFilters({ ...filters, jqlQuery: e.target.value })}
                  placeholder="e.g. assignee = currentUser() AND priority = High AND status != Done"
                  className="w-full bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {filters.jqlQuery && (
                <button
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, jqlQuery: '' })}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                  title="Clear JQL query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Clear Active Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer flex-shrink-0"
              title="Clear all active filters"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Right Side: Metrics Status Capsules */}
        <div className="flex items-center gap-2 text-xs flex-shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono text-[11px] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{metrics.total}</strong> Issues
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 flex items-center gap-1.5 font-mono text-[11px] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>
              <strong className="font-bold">{metrics.inProgress}</strong> Active
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-mono text-[11px] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              <strong className="font-bold">{metrics.completedPoints}</strong> pts done
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardFilters;
