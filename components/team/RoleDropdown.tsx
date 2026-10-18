'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shield, UserCheck, Eye, ChevronDown, Check } from 'lucide-react';
import { UserRole } from '@/lib/types';

export interface RoleDropdownProps {
  currentRole: UserRole;
  onSelectRole: (newRole: UserRole) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

interface RoleConfig {
  role: UserRole;
  label: string;
  badgeLabel: string;
  description: string;
  badgeClass: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const ROLES: RoleConfig[] = [
  {
    role: 'Admin',
    label: 'Admin (Full Control)',
    badgeLabel: 'Admin',
    description: 'Full workspace permissions, member seats, projects & roadmaps',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/15',
    icon: Shield,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/15',
  },
  {
    role: 'Member',
    label: 'Member (Read/Write)',
    badgeLabel: 'Member',
    description: 'Create & edit issues, manage backlogs, sprints, and documentation',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/15',
    icon: UserCheck,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/15',
  },
  {
    role: 'Viewer',
    label: 'Viewer (Read-Only)',
    badgeLabel: 'Viewer',
    description: 'Explore team boards, sprints & roadmaps with read-only stakeholder access',
    badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 hover:border-slate-500/50 hover:bg-slate-500/15',
    icon: Eye,
    iconColor: 'text-slate-500 dark:text-slate-400',
    iconBg: 'bg-slate-500/15',
  },
];

export function RoleDropdown({
  currentRole,
  onSelectRole,
  disabled = false,
  compact = false,
  className = '',
}: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = ROLES.find((r) => r.role === currentRole) || ROLES[1];
  const ActiveIcon = activeConfig.icon;

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (role: UserRole) => {
    if (role !== currentRole) {
      onSelectRole(role);
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer shadow-2xs select-none ${
          activeConfig.badgeClass
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]'}`}
        title={`Role: ${activeConfig.label}`}
      >
        <ActiveIcon className={`w-3.5 h-3.5 ${activeConfig.iconColor} flex-shrink-0`} />
        <span className="truncate">
          {compact ? activeConfig.badgeLabel : activeConfig.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 animate-scale-in">
          <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span>Role & Permissions</span>
            <span className="text-[9px] font-mono opacity-70">RBAC</span>
          </div>

          <div className="space-y-1">
            {ROLES.map((r) => {
              const isSelected = r.role === currentRole;
              const Icon = r.icon;

              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleSelect(r.role)}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${r.iconBg} ${r.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {r.label}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
