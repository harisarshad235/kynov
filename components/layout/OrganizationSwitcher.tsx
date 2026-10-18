'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Settings,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { Organization } from '@/lib/types';

interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrganization: Organization | null;
  onSelectOrganization: (orgId: string) => void;
  onOpenCreateOrg: () => void;
  onNavigateToOrgSettings?: () => void;
  collapsed?: boolean;
}

export function OrganizationSwitcher({
  organizations = [],
  currentOrganization,
  onSelectOrganization,
  onOpenCreateOrg,
  onNavigateToOrgSettings,
  collapsed = false,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const activeOrg = currentOrganization || organizations[0] || {
    id: 'org-kynov',
    name: 'Kynov Technologies',
    slug: 'kynov',
    plan: 'enterprise',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (collapsed) {
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs hover:border-indigo-500 transition shadow-xs cursor-pointer"
          title={`Active Org: ${activeOrg.name}`}
        >
          {getInitials(activeOrg.name)}
        </button>

        {isOpen && (
          <div className="absolute left-12 top-0 z-50 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-scale-in">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
              Select Organization
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {organizations.map((org) => {
                const isSelected = org.id === activeOrg.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      onSelectOrganization(org.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0">
                        {getInitials(org.name)}
                      </div>
                      <span className="truncate">{org.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-1.5 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateOrg();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Organization</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800 transition cursor-pointer shadow-xs group"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20 flex-shrink-0">
            {getInitials(activeOrg.name)}
          </div>
          <div className="text-left truncate">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {activeOrg.name}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <span className="capitalize">{activeOrg.plan || 'team'}</span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {activeOrg.userRole || 'Member'}
              </span>
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-scale-in">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span>Organizations</span>
            <span>{organizations.length}</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {organizations.map((org) => {
              const isSelected = org.id === activeOrg.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    onSelectOrganization(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      {getInitials(org.name)}
                    </div>
                    <div className="truncate">
                      <div className="truncate font-semibold">{org.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {org.projectCount || 0} projects • {org.memberCount || 1} members
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateOrg();
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Organization</span>
            </button>

            {onNavigateToOrgSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToOrgSettings();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Organization Settings</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
