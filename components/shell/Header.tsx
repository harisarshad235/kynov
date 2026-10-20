'use client';

import React from 'react';
import {
  Search,
  Plus,
  X,
  LogOut,
  Menu,
  Clock,
  ChevronRight,
  Command,
  Globe,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { logoutUser } from '@/app/actions/auth';
import { User } from '@/lib/types';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User;
  isViewer: boolean;
  onOpenCreateIssue: () => void;
  onOpenCreateDoc: () => void;
  onOpenProfileModal: () => void;
  onSelectIssue?: (issueKey: string) => void;
  onToggleMobileSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
  activeProjectName?: string;
  activeTab?: string;
  users?: User[];
  daysRemaining?: number;
}

export function Header({
  searchQuery,
  setSearchQuery,
  currentUser,
  isViewer,
  onOpenCreateIssue,
  onOpenProfileModal,
  onSelectIssue,
  onToggleMobileSidebar,
  onOpenCommandPalette,
  onOpenShortcuts,
  activeProjectName = 'Core Engine',
  activeTab = 'dashboard',
  users = [],
  daysRemaining = 6,
}: HeaderProps) {
  // Real-time Collaborative Presence Engine (Cross-Browser, Cross-Device, Multi-Session)
  const [onlineUserIds, setOnlineUserIds] = React.useState<Set<string>>(() => new Set([currentUser.id]));
  const [onlineEmails, setOnlineEmails] = React.useState<Set<string>>(() => new Set(currentUser.email ? [currentUser.email.toLowerCase().trim()] : []));
  const [onlineNames, setOnlineNames] = React.useState<Set<string>>(() => new Set(currentUser.name ? [currentUser.name.toLowerCase().trim()] : []));
  const [userStatuses, setUserStatuses] = React.useState<Record<string, 'ONLINE' | 'AWAY'>>({});
  const [presenceMode, setPresenceMode] = React.useState<'ONLINE' | 'AWAY'>('ONLINE');
  const [isPresencePopoverOpen, setIsPresencePopoverOpen] = React.useState(false);
  const presencePopoverRef = React.useRef<HTMLDivElement>(null);

  // Close presence popover when clicking outside
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (presencePopoverRef.current && !presencePopoverRef.current.contains(e.target as Node)) {
        setIsPresencePopoverOpen(false);
      }
    };
    if (isPresencePopoverOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isPresencePopoverOpen]);

  // ---------------------------------------------------------------------------
  // Real-time Collaborative Presence Engine
  //
  // Architecture (Cloudflare Workers + D1-backed):
  //   • POST heartbeat every 4 s  → writes current user's record to D1
  //   • GET  poll    every 5 s   → reads all online users from D1 (shared state)
  //   • BroadcastChannel          → instant same-browser tab notifications
  //   • visibilitychange / focus  → instant refresh when switching back to tab
  //   • sendBeacon on unload      → marks user offline immediately
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    let isMounted = true;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kynov:presence_channel');
    } catch {}

    // Helper: apply a presence payload from the server into local state
    const applyPresenceData = (data: any) => {
      if (!isMounted || !data) return;

      if (Array.isArray(data.onlineUserIds)) {
        const activeSet = new Set<string>([currentUser.id, ...data.onlineUserIds]);
        setOnlineUserIds(activeSet);
      }
      if (Array.isArray(data.onlineEmails)) {
        const emailSet = new Set<string>(data.onlineEmails.map((e: string) => String(e).toLowerCase().trim()));
        if (currentUser.email) emailSet.add(currentUser.email.toLowerCase().trim());
        setOnlineEmails(emailSet);
      }
      if (Array.isArray(data.onlineNames)) {
        const nameSet = new Set<string>(data.onlineNames.map((n: string) => String(n).toLowerCase().trim()));
        if (currentUser.name) nameSet.add(currentUser.name.toLowerCase().trim());
        setOnlineNames(nameSet);
      }
      if (Array.isArray(data.activeUsers)) {
        const stMap: Record<string, 'ONLINE' | 'AWAY'> = {};
        data.activeUsers.forEach((u: any) => {
          if (u.userId) stMap[u.userId] = u.status;
          if (u.email) stMap[String(u.email).toLowerCase().trim()] = u.status;
          if (u.name) stMap[String(u.name).toLowerCase().trim()] = u.status;
        });
        setUserStatuses(stMap);
      }
    };

    // POST heartbeat — announces this user as online and returns full list
    const postHeartbeat = async (statusOverride?: 'ONLINE' | 'AWAY' | 'OFFLINE') => {
      try {
        const currentStatus = statusOverride ?? presenceMode;

        // Broadcast to same browser tabs immediately
        bc?.postMessage({
          userId: currentUser.id,
          email: currentUser.email?.toLowerCase().trim(),
          name: currentUser.name,
          status: currentStatus,
        });

        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            email: currentUser.email?.toLowerCase().trim(),
            name: currentUser.name,
            status: currentStatus,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          applyPresenceData(json);
        }
      } catch { /* network resilience */ }
    };

    // GET poll — reads shared presence state from D1 (no writes)
    const pollPresence = async () => {
      try {
        const res = await fetch('/api/presence', { method: 'GET' });
        if (res.ok) {
          const json = await res.json();
          applyPresenceData(json);
        }
      } catch { /* network resilience */ }
    };

    // Fire immediately on mount
    postHeartbeat();
    pollPresence();

    // POST every 4 s to keep this user's D1 record fresh (TTL = 45 s)
    const heartbeatInterval = setInterval(postHeartbeat, 4000);

    // GET every 5 s to pull other users' presence updates from D1
    const pollInterval = setInterval(pollPresence, 5000);

    // BroadcastChannel — instant same-browser-session updates
    if (bc) {
      bc.onmessage = (event) => {
        const data = event.data;
        if (!data || (!data.userId && !data.email && !data.name)) return;
        const normalizedEmail = data.email ? String(data.email).toLowerCase().trim() : null;
        const normalizedName = data.name ? String(data.name).toLowerCase().trim() : null;

        if (data.status === 'OFFLINE') {
          if (data.userId && data.userId !== currentUser.id) {
            setOnlineUserIds((prev) => { const n = new Set(prev); n.delete(data.userId); return n; });
          }
          if (normalizedEmail && normalizedEmail !== currentUser.email?.toLowerCase().trim()) {
            setOnlineEmails((prev) => { const n = new Set(prev); n.delete(normalizedEmail); return n; });
          }
          if (normalizedName && normalizedName !== currentUser.name?.toLowerCase().trim()) {
            setOnlineNames((prev) => { const n = new Set(prev); n.delete(normalizedName); return n; });
          }
          if (data.userId) setUserStatuses((prev) => { const n = { ...prev }; delete n[data.userId]; return n; });
        } else {
          if (data.userId) setOnlineUserIds((prev) => new Set([...prev, data.userId]));
          if (normalizedEmail) setOnlineEmails((prev) => new Set([...prev, normalizedEmail]));
          if (normalizedName) setOnlineNames((prev) => new Set([...prev, normalizedName]));
          if (data.userId && data.status) setUserStatuses((prev) => ({ ...prev, [data.userId]: data.status }));
        }
      };
    }

    // Refresh instantly when user returns to tab or window gains focus
    const handleFocus = () => {
      postHeartbeat();
      pollPresence();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        postHeartbeat();
        pollPresence();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Offline beacon on tab close / reload
    const handleUnload = () => {
      try {
        bc?.postMessage({
          userId: currentUser.id,
          email: currentUser.email?.toLowerCase().trim(),
          name: currentUser.name,
          status: 'OFFLINE',
          timestamp: Date.now(),
        });
        navigator.sendBeacon(
          '/api/presence',
          JSON.stringify({
            userId: currentUser.id,
            email: currentUser.email?.toLowerCase().trim(),
            name: currentUser.name,
            status: 'OFFLINE',
          })
        );
      } catch {}
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      isMounted = false;
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
      try { bc?.close(); } catch {}
    };
  }, [currentUser.id, currentUser.name, currentUser.email, presenceMode]);

  // Helper to determine if a member is currently active/online
  const isMemberOnline = React.useCallback(
    (member: User) => {
      if (member.id === currentUser.id) return true;
      if (onlineUserIds.has(member.id)) return true;
      if (member.email && onlineEmails.has(member.email.toLowerCase().trim())) return true;
      if (member.name && onlineNames.has(member.name.toLowerCase().trim())) return true;
      return false;
    },
    [currentUser.id, onlineUserIds, onlineEmails, onlineNames]
  );

  // Helper to get effective status for a member
  const getMemberStatus = React.useCallback(
    (member: User, isOnline: boolean): 'ONLINE' | 'AWAY' | 'OFFLINE' => {
      if (!isOnline) return 'OFFLINE';
      if (member.id === currentUser.id) return presenceMode;
      const idStatus = userStatuses[member.id];
      if (idStatus) return idStatus;
      const emailStatus = member.email ? userStatuses[member.email.toLowerCase().trim()] : undefined;
      if (emailStatus) return emailStatus;
      const nameStatus = member.name ? userStatuses[member.name.toLowerCase().trim()] : undefined;
      if (nameStatus) return nameStatus;
      return 'ONLINE';
    },
    [currentUser.id, presenceMode, userStatuses]
  );

  // Active approved members for the collaborative workspace facepile
  const approvedMembers = React.useMemo(() => {
    return users.filter((u) => u.status === 'APPROVED');
  }, [users]);
  // Sorted approved members (Current user first, then active/online members, then offline members)
  const sortedMembers = React.useMemo(() => {
    return [...approvedMembers].sort((a, b) => {
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      const aOnline = isMemberOnline(a);
      const bOnline = isMemberOnline(b);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [approvedMembers, currentUser.id, isMemberOnline]);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'board':
        return 'Kanban Board';
      case 'backlog':
        return 'Sprint Backlog';
      case 'documents':
        return 'Knowledge Base';
      case 'organization':
        return 'Organization Hub';
      case 'team':
        return 'Team Management';
      case 'metrics':
        return 'Velocity & Metrics';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="relative h-16 bg-white dark:bg-[#0D121D] border-b border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0 transition-colors w-full">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {getTabLabel(activeTab)}
          </h1>
          {activeTab !== 'dashboard' && (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium pl-2 border-l border-slate-200 dark:border-slate-800">
              <span>{activeProjectName}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Tools: Search Bar, Actions, Theme, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
        {/* Global Search Bar (SaaSable Screenshot 2 Search Pill) */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenCommandPalette}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer transition"
                  title="Command Palette (⌘K)"
                >
                  <span>⌘</span>
                  <span>K</span>
                </button>
                {onOpenShortcuts && (
                  <button
                    onClick={onOpenShortcuts}
                    className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer transition"
                    title="Keyboard Shortcuts (?)"
                  >
                    ?
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Workspace Presence Facepile */}
        {approvedMembers.length > 0 && (
          <div className="relative" ref={presencePopoverRef}>
            <button
              onClick={() => setIsPresencePopoverOpen(!isPresencePopoverOpen)}
              className="flex items-center gap-1.5 sm:gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition cursor-pointer"
              title="Click to view real-time member presence"
            >
              <div className="flex items-center -space-x-2 overflow-visible">
                {sortedMembers.slice(0, 4).map((member) => {
                  const isOnline = isMemberOnline(member);
                  const memberStatus = getMemberStatus(member, isOnline);

                  return (
                    <div
                      key={member.id}
                      className="relative group transition-transform hover:scale-110 hover:z-20"
                    >
                      <UserAvatar
                        user={member}
                        size="xs"
                        className={`ring-2 ${
                          isOnline
                            ? memberStatus === 'AWAY'
                              ? 'ring-amber-400 dark:ring-amber-500'
                              : 'ring-emerald-400 dark:ring-emerald-500'
                            : 'ring-white dark:ring-[#0D121D] opacity-75'
                        }`}
                      />
                      {/* Real-time Presence Beacon */}
                      {isOnline ? (
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1.5 ring-white dark:ring-[#0D121D] ${
                            memberStatus === 'AWAY' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                          title={`${member.name} • ${memberStatus === 'AWAY' ? 'Away' : 'Active Online Now'}`}
                        />
                      ) : (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 ring-1 ring-white dark:ring-[#0D121D]"
                          title={`${member.name} • Offline`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {approvedMembers.length > 4 && (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-0.5 font-mono">
                  +{approvedMembers.length - 4}
                </span>
              )}

              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {approvedMembers.filter(isMemberOnline).length} online
                </span>
              </div>
            </button>

            {/* Real-time Presence Popover */}
            {isPresencePopoverOpen && (
              <div className="absolute right-0 top-11 z-50 w-72 bg-white dark:bg-[#0F1424] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-3 animate-scale-in text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Live Workspace Presence
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Real-time Sync
                  </span>
                </div>

                {/* Current User Status Toggle */}
                <div className="bg-slate-50 dark:bg-[#141B2D] p-2 rounded-xl mb-3 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Your Status
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ● Active Now
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPresenceMode('ONLINE')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        presenceMode === 'ONLINE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setPresenceMode('AWAY')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        presenceMode === 'AWAY'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Away
                    </button>
                  </div>
                </div>

                {/* Member Roster List (Online users always prioritized at top) */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {sortedMembers.map((member) => {
                    const isOnline = isMemberOnline(member);
                    const isSelf = member.id === currentUser.id;
                    const memberStatus = getMemberStatus(member, isOnline);

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <div className="relative flex-shrink-0">
                            <UserAvatar user={member} size="xs" />
                            {isOnline ? (
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white dark:ring-slate-900 ${
                                  memberStatus === 'AWAY' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                                }`}
                              />
                            ) : (
                              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-slate-400 ring-1 ring-white dark:ring-slate-900" />
                            )}
                          </div>
                          <div className="truncate min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {member.name}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {member.role || 'Member'} • {member.department || 'Engineering'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                            isOnline
                              ? memberStatus === 'AWAY'
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {isOnline ? (memberStatus === 'AWAY' ? 'Away' : 'Online') : 'Offline'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Go to Landing / Feature Page Link */}
        <a
          href="/landing"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-[#161C2E] dark:hover:bg-[#1E2538] border border-slate-200/80 dark:border-slate-800 transition shadow-2xs active:scale-95 flex-shrink-0"
          title="Visit Public Landing & Features"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden xl:inline">Landing Page</span>
        </a>

        {/* Quick Issue Creation Button */}
        {!isViewer && (
          <button
            onClick={onOpenCreateIssue}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#2D3FEA] hover:bg-[#2031D8] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        )}

        {/* Theme Toggle (Sun/Moon) */}
        <ThemeToggle />

        {/* In-app Notifications Bell with unread dot */}
        <NotificationBell onSelectIssue={onSelectIssue} />

        {/* User Profile Lockup (Matching SaaSable Screenshot 2 Header) */}
        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          title={`Signed in as ${currentUser.name}`}
        >
          <UserAvatar user={currentUser} size="sm" />
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium capitalize">
              {currentUser.role === 'Admin' ? 'Super Admin' : currentUser.role}
            </span>
          </div>
        </button>

        {/* Sign Out */}
        <form action={logoutUser}>
          <button
            type="submit"
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}

export default Header;
