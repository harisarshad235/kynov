'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FolderPlus,
  FileText,
  CheckCircle2,
  AlertCircle,
  File,
  Image as ImageIcon,
  Tag,
  Layers,
} from 'lucide-react';
import { DocItem, DocItemType } from '@/types/documentation';
import { parseGoogleSheetUrl } from '@/utils/googleSheets';

interface UploadDropzoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  onAddItem: (item: Partial<DocItem>) => void;
  defaultTab?: 'upload' | 'sheet' | 'folder' | 'doc';
  availableSprints?: { id: string; name: string }[];
}

export function UploadDropzoneModal({
  isOpen,
  onClose,
  parentId,
  onAddItem,
  defaultTab = 'upload',
  availableSprints = [
    { id: 'sprint-14', name: 'Sprint 14 — Velocity & Docs' },
    { id: 'sprint-15', name: 'Sprint 15 — Enterprise SSO' },
    { id: 'sprint-16', name: 'Sprint 16 — Edge Caching' },
  ],
}: UploadDropzoneModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'sheet' | 'folder' | 'doc'>(defaultTab);

  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileSprintId, setFileSprintId] = useState('');
  const [fileTags, setFileTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Sheet Link State
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [sheetDescription, setSheetDescription] = useState('');
  const [sheetSprintId, setSheetSprintId] = useState('');
  const [sheetTags, setSheetTags] = useState('');
  const [sheetUrlError, setSheetUrlError] = useState<string | null>(null);

  // New Folder State
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [folderSprintId, setFolderSprintId] = useState('');

  // New Markdown Doc State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docSprintId, setDocSprintId] = useState('');
  const [docTags, setDocTags] = useState('');

  if (!isOpen) return null;

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Submit File Uploads
  const handleSubmitFiles = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
      let type: DocItemType = 'file_generic';
      if (file.type.includes('pdf')) type = 'file_pdf';
      else if (file.type.includes('image')) type = 'file_image';

      // Realistic Unsplash fallback placeholder for image previews
      const mockThumbnail =
        type === 'file_image'
          ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
          : undefined;

      const sprintMatch = availableSprints.find((s) => s.id === fileSprintId);

      onAddItem({
        name: file.name,
        type,
        parentId,
        sprintId: fileSprintId || undefined,
        sprintName: sprintMatch?.name,
        tags: fileTags
          ? fileTags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        fileMetadata: {
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          thumbnailUrl: mockThumbnail,
        },
      });
    });

    onClose();
  };

  // Submit Google Sheet Link
  const handleSubmitGoogleSheet = (e: React.FormEvent) => {
    e.preventDefault();
    setSheetUrlError(null);

    const parsed = parseGoogleSheetUrl(sheetUrl);
    if (!parsed.isValid || !parsed.sheetId || !parsed.embedUrl) {
      setSheetUrlError(parsed.error || 'Invalid Google Sheets URL.');
      return;
    }

    const sprintMatch = availableSprints.find((s) => s.id === sheetSprintId);

    onAddItem({
      name: sheetName.trim() || 'Untitled Google Spreadsheet',
      description: sheetDescription.trim() || undefined,
      type: 'google_sheet',
      parentId,
      sprintId: sheetSprintId || undefined,
      sprintName: sprintMatch?.name,
      tags: sheetTags
        ? sheetTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Spreadsheet', 'Google Sheets'],
      googleSheetMetadata: {
        spreadsheetUrl: parsed.canonicalUrl || sheetUrl.trim(),
        embedUrl: parsed.embedUrl,
        sheetId: parsed.sheetId,
        gid: parsed.gid || undefined,
      },
    });

    onClose();
  };

  // Submit New Folder
  const handleSubmitFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const sprintMatch = availableSprints.find((s) => s.id === folderSprintId);

    onAddItem({
      name: folderName.trim(),
      description: folderDescription.trim() || undefined,
      type: 'folder',
      parentId,
      sprintId: folderSprintId || undefined,
      sprintName: sprintMatch?.name,
      itemCount: 0,
    });

    onClose();
  };

  // Submit Markdown Doc
  const handleSubmitMarkdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const sprintMatch = availableSprints.find((s) => s.id === docSprintId);

    onAddItem({
      name: docTitle.trim(),
      content: docContent.trim() || '# ' + docTitle.trim() + '\n\nAdd content here...',
      type: 'markdown',
      parentId,
      sprintId: docSprintId || undefined,
      sprintName: sprintMatch?.name,
      tags: docTags
        ? docTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Documentation'],
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#121826]/70">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Add to Knowledge Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload files, link live Google Spreadsheets, or create folders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/40 dark:bg-[#101522]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition -mb-px ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition -mb-px ${
              activeTab === 'sheet'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Link Google Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('folder')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition -mb-px ${
              activeTab === 'folder'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => setActiveTab('doc')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition -mb-px ${
              activeTab === 'doc'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Markdown Doc</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <form onSubmit={handleSubmitFiles} className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-[#121826]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Drag and drop files here, or{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Supports PDFs, PNG, JPG, SVG, WebP, DOCX, and CSV files (up to 50MB)
                </p>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-2 justify-center">
                    {selectedFiles.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-medium"
                      >
                        <File className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{f.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Associate with Sprint
                  </label>
                  <select
                    value={fileSprintId}
                    onChange={(e) => setFileSprintId(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None (Workspace General)</option>
                    {availableSprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={fileTags}
                    onChange={(e) => setFileTags(e.target.value)}
                    placeholder="e.g. Design, PRD, Architecture"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md transition"
                >
                  Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Google Sheet Link */}
          {activeTab === 'sheet' && (
            <form onSubmit={handleSubmitGoogleSheet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Sheets URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={sheetUrl}
                  onChange={(e) => {
                    setSheetUrl(e.target.value);
                    setSheetUrlError(null);
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                {sheetUrlError && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-500 mt-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{sheetUrlError}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Paste any Google Sheets sharing or edit link. We automatically generate a seamless embed viewer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="e.g. Sprint 14 Velocity & Capacity Model"
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Context (optional)
                </label>
                <input
                  type="text"
                  value={sheetDescription}
                  onChange={(e) => setSheetDescription(e.target.value)}
                  placeholder="e.g. Live tracking for team story points, burndown estimates, and headcount allocation"
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Associate with Sprint
                  </label>
                  <select
                    value={sheetSprintId}
                    onChange={(e) => setSheetSprintId(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">None (Workspace General)</option>
                    {availableSprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={sheetTags}
                    onChange={(e) => setSheetTags(e.target.value)}
                    placeholder="e.g. Finance, Capacity, Planning"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!sheetUrl.trim() || !sheetName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md transition"
                >
                  Save Google Sheet Link
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: New Folder */}
          {activeTab === 'folder' && (
            <form onSubmit={handleSubmitFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Folder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Architecture Decision Records (ADRs)"
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="e.g. Specifications, technical drawings, and database models"
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associate with Sprint (optional)
                </label>
                <select
                  value={folderSprintId}
                  onChange={(e) => setFolderSprintId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Global Folder)</option>
                  {availableSprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!folderName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md transition"
                >
                  Create Folder
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Markdown Doc */}
          {activeTab === 'doc' && (
            <form onSubmit={handleSubmitMarkdown} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. ADR-009: SQLite Cloudflare D1 Migration Architecture"
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Content (Markdown supported)
                </label>
                <textarea
                  rows={4}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="## Summary&#10;&#10;Document technical decision, trade-offs, and implementation plan..."
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Associate with Sprint
                  </label>
                  <select
                    value={docSprintId}
                    onChange={(e) => setDocSprintId(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None (Workspace General)</option>
                    {availableSprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={docTags}
                    onChange={(e) => setDocTags(e.target.value)}
                    placeholder="e.g. ADR, Edge, Database"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-[#141B2D] border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!docTitle.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md transition"
                >
                  Create Document
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
