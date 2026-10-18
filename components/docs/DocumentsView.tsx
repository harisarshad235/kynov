'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Paperclip,
  Search,
  FileText,
  Clock,
  Download,
  BookOpen,
} from 'lucide-react';
import { FullDocument, User } from '@/lib/types';

interface DocumentsViewProps {
  docs: FullDocument[];
  users: User[];
  onSelectDoc: (doc: FullDocument) => void;
  onEditDoc: (doc: FullDocument) => void;
  onDeleteDoc: (docId: string) => void;
  onCreateDoc: () => void;
  isViewer: boolean;
}

export function DocumentsView({
  docs,
  users,
  onSelectDoc,
  onEditDoc,
  onDeleteDoc,
  onCreateDoc,
  isViewer,
}: DocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set(docs.map((d) => d.category || 'General'));
    return ['ALL', ...Array.from(set)];
  }, [docs]);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const matchesCategory =
        selectedCategory === 'ALL' || (doc.category || 'General') === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [docs, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Clean Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Documentation
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {docs.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Architecture decision records, sprint specs, and engineering guidelines.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <a
            href="/api/docs/prd"
            download="KYNOV_PRD.md"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-98 shadow-2xs"
            title="Download living PRD specification"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PRD</span>
          </a>

          {!isViewer && (
            <button
              onClick={onCreateDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/25 transition active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat === 'ALL' ? docs.length : docs.filter((d) => (d.category || 'General') === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Docs' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Instant Search Bar */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Document Grid / Clean Minimal Cards */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const author = doc.author;
            const updatedDate = new Date(doc.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const cleanSnippet = doc.content
              .replace(/[#*`_\[\]()]/g, '')
              .replace(/\s+/g, ' ')
              .trim();

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-[#0c1017] hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-150 cursor-pointer"
              >
                <div>
                  {/* Category and Actions */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                      {doc.category || 'General'}
                    </span>

                    {!isViewer && (
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onEditDoc(doc)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Edit document"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                    {doc.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {cleanSnippet || 'No additional content provided.'}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    {author?.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                        {author?.name?.[0] || 'U'}
                      </div>
                    )}
                    <span className="truncate">{author?.name || 'Workspace Member'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {doc.attachments?.length > 0 && (
                      <span className="flex items-center gap-1" title={`${doc.attachments.length} attachments`}>
                        <Paperclip className="w-3 h-3" />
                        <span>{doc.attachments.length}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{updatedDate}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Minimal Empty State */
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {searchQuery ? 'No documents match your search' : 'No documentation articles yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different term or clearing your category filter.'
              : 'Create your first architecture decision record or sprint guide for your team.'}
          </p>
          {!isViewer && !searchQuery && (
            <button
              onClick={onCreateDoc}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Document</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentsView;
