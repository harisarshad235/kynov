'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  Download,
  Table as TableIcon,
  Globe,
  Sigma,
  Layers,
} from 'lucide-react';
import { DocItem } from '@/types/documentation';

interface GoogleSheetEmbedModalProps {
  item: DocItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// Sample dataset tailored for Sprint 14 Velocity & Capacity Model
const SPRINT_14_DATA = [
  { id: '1', key: 'APEX-101', task: 'Kanban Optimistic DND Transition Engine', owner: 'Haris Arshad', role: 'Staff Eng', plannedPts: 5, completedPts: 5, remainingPts: 0, status: 'DONE', burn: '100%', notes: 'Passed latency audit (<16ms)' },
  { id: '2', key: 'APEX-102', task: 'Zero Trust SSO Identity Sync Webhook Schema', owner: 'Michael Chen', role: 'Security', plannedPts: 3, completedPts: 3, remainingPts: 0, status: 'DONE', burn: '100%', notes: 'Signed payload validation' },
  { id: '3', key: 'APEX-103', task: 'Confluence-style Knowledge Base Documents Editor', owner: 'Sarah Connor', role: 'Fullstack', plannedPts: 5, completedPts: 3, remainingPts: 2, status: 'IN_PROGRESS', burn: '60%', notes: 'Draft autosave enabled' },
  { id: '4', key: 'APEX-104', task: 'Implement Role-Based Access Control (Admin/Member)', owner: 'Haris Arshad', role: 'Staff Eng', plannedPts: 5, completedPts: 2, remainingPts: 3, status: 'IN_PROGRESS', burn: '40%', notes: 'RBAC guard on server actions' },
  { id: '5', key: 'APEX-105', task: 'WebSocket Heartbeat Collaborative Presence Engine', owner: 'Alex Rivera', role: 'Backend', plannedPts: 3, completedPts: 0, remainingPts: 3, status: 'TO_DO', burn: '0%', notes: 'BroadcastChannel sync layer' },
  { id: '6', key: 'APEX-106', task: 'Cloudflare D1 Multi-Tenant Schema Replication', owner: 'Haris Arshad', role: 'Staff Eng', plannedPts: 2, completedPts: 0, remainingPts: 2, status: 'TO_DO', burn: '0%', notes: 'Foreign key cascade test' },
];

const QA_MATRIX_DATA = [
  { id: '1', key: 'REG-01', suite: 'Edge Worker Cold Start Latency', tester: 'Sarah Connor', testCount: 42, passed: 42, failed: 0, status: 'PASSED', coverage: '100%' },
  { id: '2', key: 'REG-02', suite: 'DND Issue Reordering Optimistic Rollback', tester: 'Michael Chen', testCount: 28, passed: 27, failed: 1, status: 'WARNING', coverage: '96.4%' },
  { id: '3', key: 'REG-03', suite: 'Cross-Tenant SQLite Query Isolation', tester: 'Haris Arshad', testCount: 35, passed: 35, failed: 0, status: 'PASSED', coverage: '100%' },
  { id: '4', key: 'REG-04', suite: 'Google Sheets Live Embed Sandbox Security', tester: 'Alex Rivera', testCount: 16, passed: 16, failed: 0, status: 'PASSED', coverage: '100%' },
];

const COST_DATA = [
  { id: '1', service: 'Cloudflare Workers (Edge Compute)', tier: 'Paid Unlimited', current: '1,420,000 reqs', projected: '2,800,000 reqs', unitCost: '$0.15 / 1M', total: '$0.42' },
  { id: '2', service: 'Cloudflare D1 (Serverless SQLite)', tier: 'Standard Plan', current: '840 MB Storage', projected: '1.2 GB Storage', unitCost: '$0.75 / GB-mo', total: '$0.90' },
  { id: '3', service: 'Cloudflare R2 (Document Assets)', tier: 'Zero Egress Plan', current: '4.8 GB Storage', projected: '8.4 GB Storage', unitCost: '$0.015 / GB-mo', total: '$0.13' },
  { id: '4', service: 'WebSockets & Collaborative Presence', tier: 'Durable Objects', current: '24,000 conn-hrs', projected: '48,000 conn-hrs', unitCost: '$0.125 / 1M reqs', total: '$1.25' },
];

export function GoogleSheetEmbedModal({
  item,
  isOpen,
  onClose,
}: GoogleSheetEmbedModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'embed'>('grid');
  const [activeTabName, setActiveTabName] = useState('Velocity Model');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; formula: string } | null>({
    row: 0,
    col: 1,
    formula: '=SUM(E2:E7) // Total Planned: 23 pts',
  });

  if (!isOpen || !item || item.type !== 'google_sheet' || !item.googleSheetMetadata) {
    return null;
  }

  const { spreadsheetUrl, embedUrl, sheetName } = item.googleSheetMetadata;

  const isQAMatrix = item.id.includes('qa') || item.name.toLowerCase().includes('defect') || item.name.toLowerCase().includes('regression');
  const isCostSheet = item.id.includes('cost') || item.name.toLowerCase().includes('cost');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(spreadsheetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setHasLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (isQAMatrix) {
      csvContent += 'Test ID,Suite Name,Tester,Tests,Passed,Failed,Status,Coverage\n';
      QA_MATRIX_DATA.forEach((r) => {
        csvContent += `${r.key},"${r.suite}",${r.tester},${r.testCount},${r.passed},${r.failed},${r.status},${r.coverage}\n`;
      });
    } else if (isCostSheet) {
      csvContent += 'Service,Tier,Current Usage,Projected 30d,Unit Cost,Total\n';
      COST_DATA.forEach((r) => {
        csvContent += `"${r.service}",${r.tier},${r.current},${r.projected},${r.unitCost},${r.total}\n`;
      });
    } else {
      csvContent += 'Key,Work Item,Owner,Role,Planned Pts,Completed Pts,Remaining Pts,Status,Burn Rate\n';
      SPRINT_14_DATA.forEach((r) => {
        csvContent += `${r.key},"${r.task}",${r.owner},${r.role},${r.plannedPts},${r.completedPts},${r.remainingPts},${r.status},${r.burn}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = useMemo(() => {
    if (isQAMatrix) {
      const tests = QA_MATRIX_DATA.reduce((acc, c) => acc + c.testCount, 0);
      const passed = QA_MATRIX_DATA.reduce((acc, c) => acc + c.passed, 0);
      return { label1: 'Total Tests', val1: tests, label2: 'Passed', val2: passed };
    }
    if (isCostSheet) {
      return { label1: 'Projected Total', val1: '$2.70 / mo', label2: 'Active Services', val2: '4 Edge Engines' };
    }
    const planned = SPRINT_14_DATA.reduce((acc, c) => acc + c.plannedPts, 0);
    const completed = SPRINT_14_DATA.reduce((acc, c) => acc + c.completedPts, 0);
    return { label1: 'Planned Points', val1: planned, label2: 'Completed Points', val2: completed };
  }, [isQAMatrix, isCostSheet]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none sm:rounded-none'
            : 'w-full max-w-6xl h-[88vh]'
        }`}
      >
        {/* Top Modal Header — 100% Solid & Opaque (No background bleed-through) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1524] flex-shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </h3>
                {sheetName && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {sheetName}
                  </span>
                )}
                {item.sprintName && (
                  <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {item.sprintName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                {item.description || 'Live Google Sheets interactive spreadsheet view'}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Actions Toolbar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Mode Toggle Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#1A2236] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Spreadsheet Grid</span>
              </button>
              <button
                onClick={() => setViewMode('embed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'embed'
                    ? 'bg-white dark:bg-[#1A2236] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web Embed</span>
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Download as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            {/* Copy Direct Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Copy Google Sheets Link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Copy Link</span>
                </>
              )}
            </button>

            {/* Direct Open in Google Sheets CTA */}
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
              title="Open directly in Google Sheets in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Sheets</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:inline-flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODE 1: NATIVE SPREADSHEET GRID (100% Guaranteed Reliability & Clean UI) */}
        {viewMode === 'grid' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#070A10] overflow-hidden">
            {/* Spreadsheet Formula / Summary Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#0F1424] border-b border-slate-200 dark:border-slate-800 text-xs flex-shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded">
                  <span>fx</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {selectedCell?.formula || '=SUM(E2:E7) // Total Planned: 23 pts'}
                </div>
              </div>

              {/* Dynamic Totals Capsule */}
              <div className="flex items-center gap-3 text-[11px] font-mono flex-shrink-0">
                <span className="text-slate-500">
                  {totals.label1}: <strong className="text-slate-900 dark:text-white font-bold">{totals.val1}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-slate-500">
                  {totals.label2}: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{totals.val2}</strong>
                </span>
              </div>
            </div>

            {/* Interactive Spreadsheet Table */}
            <div className="flex-1 overflow-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#131A2B] border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <tr>
                    <th className="w-10 px-2 py-2.5 text-center bg-slate-200/70 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700">
                      #
                    </th>
                    {isQAMatrix ? (
                      <>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Test ID</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Test Suite Description</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Tester</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Total</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Passed</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Status</th>
                        <th className="px-3 py-2.5 text-right">Coverage</th>
                      </>
                    ) : isCostSheet ? (
                      <>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Cloud Service</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Tier / Allocation</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Current Usage</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Projected 30d</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Unit Cost</th>
                        <th className="px-3 py-2.5 text-right">Projected Total</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Issue Key</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Sprint Work Item / Capability</th>
                        <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">Owner</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Planned</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Done</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Status</th>
                        <th className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">Burn %</th>
                        <th className="px-3 py-2.5">Verification Notes</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {isQAMatrix ? (
                    QA_MATRIX_DATA.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedCell({ row: idx, col: 1, formula: `="${row.suite}" (Pass rate: ${row.coverage})` })}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                          selectedCell?.row === idx ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                        }`}
                      >
                        <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px] bg-slate-50 dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800">
                          {row.key}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                          {row.suite}
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.tester}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.testCount}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800">
                          {row.passed}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'PASSED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {row.coverage}
                        </td>
                      </tr>
                    ))
                  ) : isCostSheet ? (
                    COST_DATA.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedCell({ row: idx, col: 1, formula: `="${row.service}" [Tier: ${row.tier}]` })}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                          selectedCell?.row === idx ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                        }`}
                      >
                        <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px] bg-slate-50 dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                          {row.service}
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                          {row.tier}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                          {row.current}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                          {row.projected}
                        </td>
                        <td className="px-3 py-2 text-slate-500 border-r border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                          {row.unitCost}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {row.total}
                        </td>
                      </tr>
                    ))
                  ) : (
                    SPRINT_14_DATA.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedCell({ row: idx, col: 1, formula: `=${row.key} ("${row.task}")` })}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                          selectedCell?.row === idx ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                        }`}
                      >
                        <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px] bg-slate-50 dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800">
                          {row.key}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                          {row.task}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {row.owner.slice(0, 1)}
                            </span>
                            <span>{row.owner}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.plannedPts}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800">
                          {row.completedPts}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'DONE'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : row.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: row.burn }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">{row.burn}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400 text-[11px]">
                          {row.notes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Spreadsheet Tabs (Excel Style) */}
            <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-100 dark:bg-[#0c121e] border-t border-slate-200 dark:border-slate-800 text-xs flex-shrink-0">
              {['Active Sprint 14', 'Developer Capacity', 'Burndown Calculation'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabName(tab)}
                  className={`px-3 py-1 rounded-t-lg font-medium text-[11px] transition ${
                    activeTabName === tab
                      ? 'bg-white dark:bg-[#141B2D] text-emerald-600 dark:text-emerald-400 font-bold border-t-2 border-emerald-500 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: WEB EMBED IFRAME (Optional fallback) */}
        {viewMode === 'embed' && (
          <div className="relative flex-1 w-full h-full bg-slate-100 dark:bg-[#070A10] overflow-hidden">
            {!hasLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-[#0D121F]/80 backdrop-blur-xs z-10">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Connecting to Google Sheets frame...
                </span>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={embedUrl}
              title={item.name}
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => setHasLoaded(true)}
            />
          </div>
        )}

        {/* Bottom Status Bar — 100% Solid & Opaque */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-white dark:bg-[#0F1524] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>
              If Google asks for sign-in or embedding is restricted by workspace domain policies, click{' '}
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline font-medium hover:text-emerald-700"
              >
                Open in Sheets
              </a>{' '}
              to view in full editor.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-slate-400">
            ID: {item.googleSheetMetadata.sheetId.slice(0, 14)}...
          </span>
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetEmbedModal;
