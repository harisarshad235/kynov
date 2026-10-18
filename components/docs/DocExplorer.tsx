'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  FolderPlus,
  FileSpreadsheet,
  Upload,
  ChevronRight,
  Folder,
  Home,
  FileText,
  Filter,
  Sparkles,
  Layers,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import {
  DocItem,
  DocFilterType,
  DocViewMode,
  BreadcrumbItem,
} from '@/types/documentation';
import { DocSidebarTree } from './DocSidebarTree';
import { DocItemCard } from './DocItemCard';
import { GoogleSheetEmbedModal } from './GoogleSheetEmbedModal';
import { UploadDropzoneModal } from './UploadDropzoneModal';
import { DocItemPreviewModal } from './DocItemPreviewModal';
import { parseGoogleSheetUrl } from '@/utils/googleSheets';

// INITIAL SAMPLE ASSETS & LIVE SPREADSHEETS
const INITIAL_DOC_ITEMS: DocItem[] = [
  // ROOT FOLDERS
  {
    id: 'folder-sprint14',
    name: 'Sprint 14 — Velocity & Planning',
    description: 'Sprint capacity worksheets, burndown targets, and epic breakdown',
    type: 'folder',
    parentId: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    itemCount: 4,
    tags: ['Sprint', 'Velocity'],
  },
  {
    id: 'folder-adrs',
    name: 'Architecture Decision Records (ADRs)',
    description: 'Official RFCs and architectural blueprints for Kynov engine',
    type: 'folder',
    parentId: null,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    itemCount: 3,
    tags: ['Architecture', 'Core'],
  },
  {
    id: 'folder-qa',
    name: 'QA & Compliance Governance',
    description: 'Automated test suite reports, defect matrices, and audit logs',
    type: 'folder',
    parentId: null,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdBy: {
      id: 'usr-sarah',
      name: 'Sarah Connor',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    itemCount: 2,
    tags: ['Quality', 'Testing'],
  },

  // GOOGLE SHEETS (DEDICATED TYPE)
  {
    id: 'sheet-velocity',
    name: 'Sprint 14 Velocity & Capacity Model',
    description: 'Live collaborative story point burndown, developer capacity & milestone estimates',
    type: 'google_sheet',
    parentId: 'folder-sprint14',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    tags: ['Capacity', 'Planning', 'Google Sheets'],
    googleSheetMetadata: {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
      embedUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview?widget=true&headers=false',
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      sheetName: 'Active Sprint 14',
    },
  },
  {
    id: 'sheet-qa-matrix',
    name: 'End-to-End Regression & Defect Matrix',
    description: 'E2E testing checklist across Edge workers, WebSocket synchronization, and DB migrations',
    type: 'google_sheet',
    parentId: 'folder-qa',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdBy: {
      id: 'usr-sarah',
      name: 'Sarah Connor',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    tags: ['QA', 'Regression', 'Google Sheets'],
    googleSheetMetadata: {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1qpyC0XzvTcKWFx0nNWMI8i2cHY40KgPEKy3NFQ848NY/edit#gid=0',
      embedUrl: 'https://docs.google.com/spreadsheets/d/1qpyC0XzvTcKWFx0nNWMI8i2cHY40KgPEKy3NFQ848NY/preview?widget=true&headers=false',
      sheetId: '1qpyC0XzvTcKWFx0nNWMI8i2cHY40KgPEKy3NFQ848NY',
      sheetName: 'Release Candidate v1.4',
    },
  },
  {
    id: 'sheet-infra-cost',
    name: 'Cloudflare D1 & Edge Workers Cost Projections',
    description: 'Detailed financial forecast for serverless executions, D1 read/write limits, and R2 storage',
    type: 'google_sheet',
    parentId: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    tags: ['Finances', 'Infrastructure'],
    googleSheetMetadata: {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1_o3rA3fCj7Bvh3VjXg9G4L6t5uVv2y_N7s9B7l8Yq3M/edit#gid=0',
      embedUrl: 'https://docs.google.com/spreadsheets/d/1_o3rA3fCj7Bvh3VjXg9G4L6t5uVv2y_N7s9B7l8Yq3M/preview?widget=true&headers=false',
      sheetId: '1_o3rA3fCj7Bvh3VjXg9G4L6t5uVv2y_N7s9B7l8Yq3M',
      sheetName: '2026 Projections',
    },
  },

  // MARKDOWN DOCUMENTS
  {
    id: 'doc-living-prd',
    name: 'KYNOV Master Product Requirements Document (PRD.md)',
    description: 'Living architecture specification, RBAC matrix, and sprint roadmap. Synchronized with every feature update in the app.',
    type: 'markdown',
    parentId: null,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    tags: ['PRD', 'Specification', 'Living Doc'],
    fileMetadata: {
      fileUrl: '/api/docs/prd',
      fileSize: 19800,
      mimeType: 'text/markdown',
    },
    content: `# Product Requirements Document (PRD) — KYNOV

**Document Version**: 2.0.0
**Status**: Living Master Specification (Source of Truth)
**Product**: Kynov — Edge-Native Agile Velocity, Sprint Tracking & Knowledge Platform

> [!TIP]
> **Live Download**: This document is continuously synchronized with the application codebase. You can download the latest offline markdown bundle anytime using the **Download Living PRD.md** action or via \`/api/docs/prd\`.

---

## 1. Executive Summary & Value Proposition
Kynov is a zero-per-seat-cost, high-performance agile management and engineering intelligence platform built on serverless edge primitives (Cloudflare D1 distributed SQLite, Next.js 16 Edge runtime, and Cloudflare R2 zero-egress object storage).

### Core Differentiators
- **Sub-25ms Global Edge Latency**: Direct edge query execution with zero Cold Start penalty.
- **Unified Engineering Hub**: Combines an ultra-responsive Kanban workflow engine, Confluence-style living architecture documentation, 3D interactive glass folders, live Google Sheets embeds, and real-time multi-browser presence.
- **Zero Seat Penalties**: Unlimited contractors, engineers, and stakeholders without per-seat SaaS taxation.

---

## 2. Core User Journeys
1. **New User Onboarding & Gated Approval**: New registrations enter \`status: PENDING\` in a secure holding room until elevated by an administrator.
2. **Sub-16ms Drag-and-Drop Sprint Board**: Dragging issue cards across swimlanes (\`To Do\` -> \`In Progress\` -> \`In Review\` -> \`Done\`) with optimistic client transitions and automatic rollbacks.
3. **Compound JQL-lite Filtering**: Instant compound queries supporting priority, issue type, currentUser(), story points, and epics.
4. **Living Architecture & Google Sheets**: Direct integration of living RFCs, Google Sheets capacity burndown models, and 3D glass folders.
5. **Real-Time Cross-Browser Presence**: Server-side presence heartbeat tracking active users with pulsating beacons.

---

## 3. RBAC & Access Matrix
- **Super Admin**: Full platform ownership, database governance, organization settings.
- **Admin**: User approval gates, team member elevation, sprint management.
- **Member**: Create, edit, and transition sprint issues, create documents, upload assets.
- **Viewer**: Read-only stakeholder access without licensing cost.
- **Pending**: Gated holding room with restricted access pending approval.`,
  },
  {
    id: 'doc-adr-004',
    name: 'ADR-004: Multi-Tenant Schema Isolation via SQLite & D1',
    description: 'Architecture decision regarding organization data isolation, cross-tenant leaks, and SQLite foreign keys',
    type: 'markdown',
    parentId: 'folder-adrs',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    tags: ['Architecture', 'Database', 'ADR'],
    content: `# ADR-004: Multi-Tenant Schema Isolation via SQLite & D1

## Status
**Accepted** (Implemented in Sprint 13)

## Context
Kynov powers multi-company workspaces where users collaborate across distinct corporate boundaries. We required sub-50ms query latencies at global edge locations without cross-tenant memory leakage.

## Decision
We enforce organization partitioning at the database level with strict foreign key constraints:
- All core entities (\`projects\`, \`swimlanes\`, \`issues\`, \`documents\`) maintain explicit \`organization_id\` references.
- Server Actions enforce session-authenticated corporate boundary checks prior to query execution.

## Consequences
- **Positive**: Zero latency overhead from complex tenant sharding.
- **Positive**: Simple single-command database backups and SQLite replication.
- **Trade-off**: Soft-delete cascades must be evaluated with transactional rollbacks.`,
  },
  {
    id: 'doc-sprint14-notes',
    name: 'Sprint 14 Team Retrospective & Velocity Goals',
    description: 'Action items, burndown accuracy metrics, and engineering velocity takeaways',
    type: 'markdown',
    parentId: 'folder-sprint14',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    createdBy: {
      id: 'usr-sarah',
      name: 'Sarah Connor',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    tags: ['Sprint', 'Retrospective'],
    content: `# Sprint 14 Retrospective & Objectives

### Key Achievements
- **Sub-50ms Kanban Board**: Drag-and-drop workflow latency reduced by 40% with optimistic React transitions.
- **Live Google Sheets Integration**: Embed spreadsheets directly inside workspace folders with instant preview.

### Focus for Sprint 15
1. Full offline sync for mobile client.
2. Direct GitHub PR branch link preview.`,
  },

  // PDF ATTACHMENTS
  {
    id: 'file-platform-spec',
    name: 'Kynov Platform Architecture Specification v2.pdf',
    description: 'Comprehensive 24-page system architecture, network topologies, and security whitepaper',
    type: 'file_pdf',
    parentId: 'folder-adrs',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    tags: ['PDF', 'Specification'],
    fileMetadata: {
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: 1845000,
      mimeType: 'application/pdf',
      pageCount: 24,
    },
  },

  // IMAGE ASSETS & DIAGRAMS
  {
    id: 'file-burndown-chart',
    name: 'Sprint 14 Real-Time Velocity Trajectory.png',
    description: 'High-resolution burndown trajectory comparison between planned story points and completed PRs',
    type: 'file_image',
    parentId: 'folder-sprint14',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: {
      id: 'usr-haris',
      name: 'Haris Arshad',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    sprintId: 'sprint-14',
    sprintName: 'Sprint 14',
    tags: ['Analytics', 'Image', 'Velocity'],
    fileMetadata: {
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      fileSize: 840000,
      mimeType: 'image/png',
    },
  },
];

interface DocExplorerProps {
  isViewer?: boolean;
}

export function DocExplorer({ isViewer = false }: DocExplorerProps) {
  const [items, setItems] = useState<DocItem[]>(INITIAL_DOC_ITEMS);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<DocFilterType>('ALL');
  const [viewMode, setViewMode] = useState<DocViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'updated' | 'name' | 'type'>('updated');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDefaultTab, setUploadDefaultTab] = useState<'upload' | 'sheet' | 'folder' | 'doc'>('upload');
  const [activeSheetItem, setActiveSheetItem] = useState<DocItem | null>(null);
  const [previewItem, setPreviewItem] = useState<DocItem | null>(null);

  // Compute breadcrumb path
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const list: BreadcrumbItem[] = [{ id: null, name: 'Knowledge Hub' }];
    if (!currentFolderId) return list;

    const path: BreadcrumbItem[] = [];
    let curr = items.find((i) => i.id === currentFolderId);
    while (curr) {
      path.unshift({ id: curr.id, name: curr.name });
      curr = items.find((i) => i.id === curr?.parentId);
    }
    return [...list, ...path];
  }, [currentFolderId, items]);

  // Current folder object
  const currentFolder = useMemo(() => {
    return items.find((i) => i.id === currentFolderId) || null;
  }, [currentFolderId, items]);

  // Filter & Search Items
  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Filter by Folder location:
      // If a specific filter is selected (e.g. Google Sheets, PDFs, Images), search across ALL folders!
      // Otherwise, show only items inside the currently navigated folder.
      if (activeFilter === 'ALL') {
        if (item.parentId !== currentFolderId) return false;
      } else if (activeFilter === 'GOOGLE_SHEET') {
        if (item.type !== 'google_sheet') return false;
      } else if (activeFilter === 'DOCS') {
        if (item.type !== 'markdown' && item.type !== 'file_pdf') return false;
      } else if (activeFilter === 'IMAGES') {
        if (item.type !== 'file_image') return false;
      } else if (activeFilter === 'SPRINT_LINKED') {
        if (!item.sprintId) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesContent = (item.content || '').toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesTags || matchesContent;
      }

      return true;
    }).sort((a, b) => {
      // Always put folders first in grid/table view
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      if (sortOrder === 'type') return a.type.localeCompare(b.type);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [items, currentFolderId, activeFilter, searchQuery, sortOrder]);

  // Add Item Handler
  const handleAddItem = (newItemData: Partial<DocItem>) => {
    const newItem: DocItem = {
      id: `item-${Date.now()}`,
      name: newItemData.name || 'Untitled Document',
      description: newItemData.description,
      type: newItemData.type || 'markdown',
      parentId: newItemData.parentId !== undefined ? newItemData.parentId : currentFolderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'usr-current',
        name: 'You (Current User)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
      sprintId: newItemData.sprintId,
      sprintName: newItemData.sprintName,
      tags: newItemData.tags || [],
      fileMetadata: newItemData.fileMetadata,
      googleSheetMetadata: newItemData.googleSheetMetadata,
      content: newItemData.content,
      itemCount: newItemData.type === 'folder' ? 0 : undefined,
    };

    setItems((prev) => [newItem, ...prev]);

    // If new item added inside a folder, bump folder count
    if (newItem.parentId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === newItem.parentId
            ? { ...i, itemCount: (i.itemCount || 0) + 1 }
            : i
        )
      );
    }
  };

  // Delete Item Handler
  const handleDeleteItem = (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId && i.parentId !== itemId));
  };

  // Preview or Open Item
  const handlePreviewItem = (item: DocItem) => {
    if (item.type === 'google_sheet') {
      setActiveSheetItem(item);
    } else {
      setPreviewItem(item);
    }
  };

  // Copy Link
  const handleCopyLink = (item: DocItem) => {
    const url = item.googleSheetMetadata?.spreadsheetUrl || window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 w-full min-h-[750px] relative">
      {/* 1. Left Sidebar: Folder Directory Tree */}
      <DocSidebarTree
        items={items}
        currentFolderId={currentFolderId}
        onSelectFolder={(folderId) => {
          setCurrentFolderId(folderId);
          setActiveFilter('ALL');
        }}
        activeFilter={activeFilter}
        onSelectFilter={(f) => {
          setActiveFilter(f);
        }}
        onOpenNewModal={(tab) => {
          setUploadDefaultTab(tab);
          setIsUploadModalOpen(true);
        }}
        isViewer={isViewer}
      />

      {/* 2. Main Content & Explorer View */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Explorer Header & Breadcrumbs */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#101522]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              onClick={() => {
                setCurrentFolderId(null);
                setActiveFilter('ALL');
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Docs</span>
            </button>

            {breadcrumbs.slice(1).map((crumb, idx) => (
              <React.Fragment key={crumb.id || idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`font-semibold truncate max-w-[160px] transition cursor-pointer ${
                    idx === breadcrumbs.length - 2
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}

            {activeFilter !== 'ALL' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold ml-1">
                Filter: {activeFilter}
              </span>
            )}
          </nav>

          {/* Search & Layout Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents, sheets, tags..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="flex items-center bg-slate-100 dark:bg-[#141B2D] p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Explorer Body: Content Grid / Table / Empty States */}
        <div className="flex-1 p-5 overflow-y-auto">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-4 shadow-sm border border-indigo-200/60 dark:border-indigo-900/40">
                <Folder className="w-8 h-8 fill-indigo-500/20" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No files in this folder yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                Drag and drop files, attach Google Sheets, or create new sprint markdown specifications to get started.
              </p>
              {!isViewer && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => {
                      setUploadDefaultTab('sheet');
                      setIsUploadModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Link Google Sheet</span>
                  </button>
                  <button
                    onClick={() => {
                      setUploadDefaultTab('upload');
                      setIsUploadModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
              {displayedItems.map((item) => (
                <DocItemCard
                  key={item.id}
                  item={item}
                  viewMode="grid"
                  onOpenFolder={(fId) => setCurrentFolderId(fId)}
                  onPreviewItem={handlePreviewItem}
                  onEditItem={(it) => {
                    const newName = prompt('Enter new title:', it.name);
                    if (newName && newName.trim()) {
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === it.id ? { ...i, name: newName.trim() } : i
                        )
                      );
                    }
                  }}
                  onDeleteItem={handleDeleteItem}
                  onCopyLink={handleCopyLink}
                  isViewer={isViewer}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Type</th>
                    <th className="py-3 px-4 hidden md:table-cell">Sprint Tag</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Author</th>
                    <th className="py-3 px-4">Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {displayedItems.map((item) => (
                    <DocItemCard
                      key={item.id}
                      item={item}
                      viewMode="table"
                      onOpenFolder={(fId) => setCurrentFolderId(fId)}
                      onPreviewItem={handlePreviewItem}
                      onEditItem={(it) => {
                        const newName = prompt('Enter new title:', it.name);
                        if (newName && newName.trim()) {
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === it.id ? { ...i, name: newName.trim() } : i
                            )
                          );
                        }
                      }}
                      onDeleteItem={handleDeleteItem}
                      onCopyLink={handleCopyLink}
                      isViewer={isViewer}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Modals */}
      {/* Google Sheets Live Embedded Viewer */}
      <GoogleSheetEmbedModal
        item={activeSheetItem}
        isOpen={!!activeSheetItem}
        onClose={() => setActiveSheetItem(null)}
      />

      {/* Upload Dropzone & New Item Modal */}
      <UploadDropzoneModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        parentId={currentFolderId}
        onAddItem={handleAddItem}
        defaultTab={uploadDefaultTab}
      />

      {/* Markdown / PDF / Image Lightbox Preview Modal */}
      <DocItemPreviewModal
        item={previewItem}
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onUpdateContent={(itemId, newContent) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === itemId
                ? { ...i, content: newContent, updatedAt: new Date().toISOString() }
                : i
            )
          );
        }}
        isViewer={isViewer}
      />
    </div>
  );
}
