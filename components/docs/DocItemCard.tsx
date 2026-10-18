'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileSpreadsheet,
  FileText,
  FileCode,
  Image as ImageIcon,
  File,
  MoreVertical,
  ExternalLink,
  Eye,
  Trash2,
  Edit2,
  Copy,
  Check,
  Tag,
  Paperclip,
  Download,
  FolderInput,
} from 'lucide-react';
import { DocItem, DocViewMode } from '@/types/documentation';
import { formatFileSize, formatDocDate } from '@/utils/googleSheets';

interface DocItemCardProps {
  item: DocItem;
  viewMode: DocViewMode;
  onOpenFolder: (folderId: string) => void;
  onPreviewItem: (item: DocItem) => void;
  onEditItem: (item: DocItem) => void;
  onDeleteItem: (itemId: string) => void;
  onCopyLink: (item: DocItem) => void;
  isViewer?: boolean;
}

export function DocItemCard({
  item,
  viewMode,
  onOpenFolder,
  onPreviewItem,
  onEditItem,
  onDeleteItem,
  onCopyLink,
  isViewer = false,
}: DocItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [menuOpen]);

  const handleCardClick = () => {
    if (item.type === 'folder') {
      onOpenFolder(item.id);
    } else {
      onPreviewItem(item);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyLink(item);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1500);
  };

  // Helper icon by type
  const renderIcon = () => {
    switch (item.type) {
      case 'folder':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:scale-105 transition shadow-2xs">
            <Folder className="w-5 h-5 fill-blue-500/20" />
          </div>
        );
      case 'google_sheet':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:scale-105 transition shadow-2xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        );
      case 'file_pdf':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0 group-hover:scale-105 transition shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'file_image':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0 group-hover:scale-105 transition shadow-2xs">
            <ImageIcon className="w-5 h-5" />
          </div>
        );
      case 'markdown':
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-105 transition shadow-2xs">
            <FileCode className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 dark:bg-slate-500/20 border border-slate-500/20 flex items-center justify-center text-slate-600 dark:text-slate-400 flex-shrink-0 group-hover:scale-105 transition shadow-2xs">
            <File className="w-5 h-5" />
          </div>
        );
    }
  };

  // Helper badge text & color
  const renderBadge = () => {
    switch (item.type) {
      case 'folder':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
            {item.itemCount !== undefined ? `${item.itemCount} items` : 'Folder'}
          </span>
        );
      case 'google_sheet':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3" />
            <span>Google Sheet</span>
          </span>
        );
      case 'file_pdf':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80">
            PDF {item.fileMetadata?.fileSize ? `• ${formatFileSize(item.fileMetadata.fileSize)}` : ''}
          </span>
        );
      case 'file_image':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80">
            IMAGE {item.fileMetadata?.fileSize ? `• ${formatFileSize(item.fileMetadata.fileSize)}` : ''}
          </span>
        );
      case 'markdown':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
            Markdown Spec
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Attachment
          </span>
        );
    }
  };

  // ==========================================
  // TABLE / ROW VIEW
  // ==========================================
  if (viewMode === 'table') {
    return (
      <tr
        onClick={handleCardClick}
        className="group hover:bg-slate-50 dark:hover:bg-[#141B2D]/60 transition-colors border-b border-slate-100 dark:border-slate-800/70 cursor-pointer text-xs"
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3 min-w-0">
            {renderIcon()}
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 dark:text-white truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {item.name}
              </span>
              {item.description && (
                <span className="text-[11px] text-slate-400 truncate block max-w-xs">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        </td>

        <td className="py-3 px-4 hidden sm:table-cell">{renderBadge()}</td>

        <td className="py-3 px-4 hidden md:table-cell">
          {item.sprintName ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Tag className="w-3 h-3 text-indigo-500" />
              {item.sprintName}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">—</span>
          )}
        </td>

        <td className="py-3 px-4 hidden lg:table-cell">
          <div className="flex items-center gap-2">
            {item.createdBy.avatarUrl ? (
              <img
                src={item.createdBy.avatarUrl}
                alt={item.createdBy.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                {item.createdBy.name.charAt(0)}
              </div>
            )}
            <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[100px]">
              {item.createdBy.name}
            </span>
          </div>
        </td>

        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
          {formatDocDate(item.updatedAt)}
        </td>

        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {item.type === 'google_sheet' && item.googleSheetMetadata && (
              <a
                href={item.googleSheetMetadata.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                title="Open in Google Sheets"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={() => onPreviewItem(item)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
              title="Preview / Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {!isViewer && (
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // ==========================================
  // GRID CARD VIEW (Default)
  // ==========================================
  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-[#0D121F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:shadow-xl dark:hover:shadow-indigo-950/20 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top Row: Icon + Badge + Action Menu */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div>{renderBadge()}</div>
        </div>

        {/* Action Menu (Three dots) */}
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 animate-scale-in text-xs font-medium">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onPreviewItem(item);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>Open / Preview</span>
              </button>

              {item.type === 'google_sheet' && item.googleSheetMetadata && (
                <a
                  href={item.googleSheetMetadata.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Open in Sheets</span>
                </a>
              )}

              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {!isViewer && (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditItem(item);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Rename / Edit</span>
                  </button>

                  <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteItem(item.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Thumbnail preview if available */}
      {item.type === 'file_image' && item.fileMetadata?.thumbnailUrl && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
          <img
            src={item.fileMetadata.thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Middle: Title & Description */}
      <div className="mb-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
          {item.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
          {item.description ||
            (item.type === 'folder'
              ? 'Folder containing sprint assets and specifications'
              : item.content
              ? item.content.replace(/[#*`_]/g, '').slice(0, 80)
              : 'Direct asset item linked to project workspace')}
        </p>
      </div>

      {/* Tags row */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#141B2D] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] font-medium text-slate-400 self-center">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer: Sprint Tag + Author + Date */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate max-w-[150px]">
          {item.createdBy.avatarUrl ? (
            <img
              src={item.createdBy.avatarUrl}
              alt={item.createdBy.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold">
              {item.createdBy.name.charAt(0)}
            </div>
          )}
          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
            {item.createdBy.name}
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {formatDocDate(item.updatedAt)}
        </span>
      </div>

      {/* Special Quick Action for Google Sheet Card */}
      {item.type === 'google_sheet' && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreviewItem(item);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 transition active:scale-98"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Embed Preview</span>
          </button>

          {item.googleSheetMetadata && (
            <a
              href={item.googleSheetMetadata.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Open directly in Google Sheets"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
