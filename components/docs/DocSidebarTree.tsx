'use client';

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  FileSpreadsheet,
  FileText,
  Upload,
  HardDrive,
  FolderPlus,
  Layers,
  Sparkles,
  Tag,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { DocFilterType, DocItem } from '@/types/documentation';

interface DocSidebarTreeProps {
  items: DocItem[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  activeFilter: DocFilterType;
  onSelectFilter: (filter: DocFilterType) => void;
  onOpenNewModal: (tab: 'upload' | 'sheet' | 'folder' | 'doc') => void;
  isViewer?: boolean;
}

export function DocSidebarTree({
  items,
  currentFolderId,
  onSelectFolder,
  activeFilter,
  onSelectFilter,
  onOpenNewModal,
  isViewer = false,
}: DocSidebarTreeProps) {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true,
  });

  // Calculate folder tree
  const folders = items.filter((item) => item.type === 'folder');
  const rootFolders = folders.filter((f) => f.parentId === null);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Counts for filter chips
  const counts = {
    all: items.length,
    sheets: items.filter((i) => i.type === 'google_sheet').length,
    docs: items.filter((i) => i.type === 'markdown' || i.type === 'file_pdf').length,
    images: items.filter((i) => i.type === 'file_image').length,
    sprint: items.filter((i) => !!i.sprintId).length,
  };

  // Approximate storage calculation
  const totalBytes = items.reduce((acc, curr) => {
    return acc + (curr.fileMetadata?.fileSize || 12000);
  }, 0);
  const formattedStorage = (totalBytes / (1024 * 1024)).toFixed(1);

  const renderFolderItem = (folder: DocItem, depth: number = 0) => {
    const isExpanded = expandedFolders[folder.id] ?? false;
    const isSelected = currentFolderId === folder.id;
    const childFolders = folders.filter((f) => f.parentId === folder.id);
    const hasChildren = childFolders.length > 0;
    const childItemCount = items.filter((i) => i.parentId === folder.id).length;

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => onSelectFolder(folder.id)}
          style={{ paddingLeft: `${12 + depth * 14}px` }}
          className={`flex items-center justify-between py-1.5 pr-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all group ${
            isSelected
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleFolder(folder.id, e)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-indigo-500 fill-indigo-500/20 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500 fill-blue-500/20 flex-shrink-0" />
            )}

            <span className="truncate" title={folder.name}>{folder.name}</span>
          </div>

          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
              isSelected
                ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {childItemCount}
          </span>
        </div>

        {/* Subfolders */}
        {isExpanded && hasChildren && (
          <div className="space-y-0.5 mt-0.5">
            {childFolders.map((child) => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm h-full">
      {/* "New" Dropdown Action Button */}
      {!isViewer && (
        <div className="relative mb-5">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="w-full flex items-center justify-center gap-2 bg-[#2D3FEA] hover:bg-[#2031D8] text-white py-2.5 px-4 rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/20 transition active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Asset / Folder</span>
            <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-80" />
          </button>

          {isNewMenuOpen && (
            <div
              className="absolute left-0 right-0 top-12 z-30 bg-white dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 animate-scale-in text-xs font-medium"
              onClick={() => setIsNewMenuOpen(false)}
            >
              <button
                onClick={() => onOpenNewModal('folder')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <FolderPlus className="w-4 h-4 text-blue-500" />
                <span>New Folder</span>
              </button>

              <button
                onClick={() => onOpenNewModal('sheet')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Link Google Sheet</span>
              </button>

              <button
                onClick={() => onOpenNewModal('upload')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <Upload className="w-4 h-4 text-indigo-500" />
                <span>Upload Files & Media</span>
              </button>

              <button
                onClick={() => onOpenNewModal('doc')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <FileText className="w-4 h-4 text-purple-500" />
                <span>New Markdown Document</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Filter Section */}
      <div className="space-y-1 mb-6">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1.5">
          Quick Filters
        </span>

        <button
          onClick={() => {
            onSelectFilter('ALL');
            onSelectFolder(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'ALL' && currentFolderId === null
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            <span>All Assets</span>
          </div>
          <span className="font-mono text-[10px] opacity-80">{counts.all}</span>
        </button>

        <button
          onClick={() => onSelectFilter('GOOGLE_SHEET')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'GOOGLE_SHEET'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Sheets</span>
          </div>
          <span className="font-mono text-[10px] opacity-80">{counts.sheets}</span>
        </button>

        <button
          onClick={() => onSelectFilter('DOCS')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'DOCS'
              ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>PDFs & Docs</span>
          </div>
          <span className="font-mono text-[10px] opacity-80">{counts.docs}</span>
        </button>

        <button
          onClick={() => onSelectFilter('IMAGES')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'IMAGES'
              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Images & Media</span>
          </div>
          <span className="font-mono text-[10px] opacity-80">{counts.images}</span>
        </button>

        <button
          onClick={() => onSelectFilter('SPRINT_LINKED')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'SPRINT_LINKED'
              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Sprint Linked</span>
          </div>
          <span className="font-mono text-[10px] opacity-80">{counts.sprint}</span>
        </button>
      </div>

      {/* Directory Folders Tree */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-4 pr-1">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Folder Directory
          </span>
          <button
            onClick={() => onSelectFolder(null)}
            className={`text-[10px] font-semibold hover:underline ${
              currentFolderId === null ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
            }`}
          >
            Root
          </button>
        </div>

        {rootFolders.map((folder) => renderFolderItem(folder, 0))}

        {rootFolders.length === 0 && (
          <p className="text-[11px] text-slate-400 px-3 py-2 italic">
            No folders created yet.
          </p>
        )}
      </div>

      {/* Bottom Storage & Item Meter */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-medium">{counts.all} items</span>
        </div>
        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {formattedStorage} MB stored
        </span>
      </div>
    </aside>
  );
}
