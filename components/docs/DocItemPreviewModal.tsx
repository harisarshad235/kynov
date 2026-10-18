'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileText,
  FileCode,
  Image as ImageIcon,
  Edit3,
  Calendar,
  User as UserIcon,
  Tag,
  Maximize2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DocItem } from '@/types/documentation';
import { formatFileSize, formatDocDate } from '@/utils/googleSheets';

interface DocItemPreviewModalProps {
  item: DocItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateContent?: (itemId: string, content: string) => void;
  isViewer?: boolean;
}

export function DocItemPreviewModal({
  item,
  isOpen,
  onClose,
  onUpdateContent,
  isViewer = false,
}: DocItemPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item?.content || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      item.content || item.fileMetadata?.fileUrl || window.location.href
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onUpdateContent) {
      onUpdateContent(item.id, content);
    }
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#121826]/80 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              {item.type === 'file_image' ? (
                <ImageIcon className="w-5 h-5" />
              ) : item.type === 'file_pdf' ? (
                <FileText className="w-5 h-5 text-rose-500" />
              ) : (
                <FileCode className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>By {item.createdBy.name}</span>
                <span>•</span>
                <span>{formatDocDate(item.updatedAt)}</span>
                {item.fileMetadata?.fileSize && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{formatFileSize(item.fileMetadata.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.type === 'markdown' && !isViewer && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  isEditing
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Preview' : 'Edit'}</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
              title="Copy Content / Link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {item.fileMetadata?.fileUrl && (
              <a
                href={item.fileMetadata.fileUrl}
                download={item.name}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0A0E18]">
          {/* IMAGE PREVIEW */}
          {item.type === 'file_image' && (
            <div className="flex flex-col items-center justify-center">
              <div className="max-w-2xl max-h-[60vh] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-black/5 dark:bg-black/30">
                <img
                  src={
                    item.fileMetadata?.thumbnailUrl ||
                    item.fileMetadata?.fileUrl ||
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'
                  }
                  alt={item.name}
                  className="max-h-[60vh] w-auto object-contain mx-auto"
                />
              </div>
              <p className="text-xs text-slate-400 mt-3 font-mono">
                {item.fileMetadata?.mimeType || 'image/png'} •{' '}
                {item.fileMetadata?.fileSize ? formatFileSize(item.fileMetadata.fileSize) : 'High Resolution'}
              </p>
            </div>
          )}

          {/* PDF PREVIEW */}
          {item.type === 'file_pdf' && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0D121F] rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm border border-rose-200 dark:border-rose-900/60">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {item.name}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                Portable Document Format (PDF) with full text and vector drawings.
              </p>
              <div className="flex gap-3">
                {item.fileMetadata?.fileUrl ? (
                  <a
                    href={item.fileMetadata.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition"
                  >
                    <ExternalLink className="w-4 h-4" /> Open in Viewer
                  </a>
                ) : (
                  <button
                    onClick={() => alert('PDF document loaded from workspace storage')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition"
                  >
                    <ExternalLink className="w-4 h-4" /> View Document
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MARKDOWN VIEWER & EDITOR */}
          {item.type === 'markdown' && (
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    rows={16}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-xs font-mono p-4 rounded-xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed bg-white dark:bg-[#0D121F] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || item.content || '*(Empty document)*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* GENERIC FILE */}
          {item.type === 'file_generic' && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0D121F] rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4">
                <FileCode className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {item.name}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                Attached file document
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
