'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Building2,
  FolderKanban,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Kanban,
  Sparkles,
  Info,
  ChevronRight,
  UserPlus,
  RefreshCw,
  X,
  BadgeAlert,
  Edit3,
  Settings,
  Trash2,
  Link as LinkIcon,
  Activity,
  History,
  Globe,
} from 'lucide-react';
import { User, Project, UserRole, Organization, OrganizationRole, OrgMemberRow, OrganizationActivity } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  getAllOrganizationProjectsAction,
  getAllUserProjectAssignmentsAction,
  assignUserToProject,
  removeUserFromProject,
  OrganizationProjectSummary,
  UserProjectAssignment,
} from '@/app/actions/projects';
import { approveUser, updateUserRole } from '@/app/actions/team';
import {
  updateOrganizationAction,
  addOrganizationMemberAction,
  removeOrganizationMemberAction,
  getOrganizationMembersAction,
  getOrganizationActivityAction,
  updateOrgDomainAutoJoinAction,
} from '@/app/actions/org';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';
import { InviteMemberModal } from './InviteMemberModal';

interface OrganizationViewProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  organizations?: Organization[];
  currentOrganization?: Organization | null;
  onSelectProject: (projectId: string) => void;
  onSelectOrganization?: (orgId: string) => void;
  onOpenCreateOrganization?: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCreateProject?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export function OrganizationView({
  currentUser,
  users: initialUsers,
  projects: initialProjects,
  organizations = [],
  currentOrganization,
  onSelectProject,
  onSelectOrganization,
  onOpenCreateOrganization,
  onNavigateTab,
  onOpenCreateProject,
  onShowToast,
}: OrganizationViewProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'governance' | 'activity'>('projects');
  const [orgProjects, setOrgProjects] = useState<OrganizationProjectSummary[]>([]);
  const [userAssignments, setUserAssignments] = useState<Record<string, UserProjectAssignment[]>>({});
  const [orgMembers, setOrgMembers] = useState<OrgMemberRow[]>([]);
  const [activities, setActivities] = useState<OrganizationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<OrganizationProjectSummary | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Edit Organization Modal state
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);
  const [editOrgName, setEditOrgName] = useState(currentOrganization?.name || 'Kynov Technologies');
  const [editOrgSlug, setEditOrgSlug] = useState(currentOrganization?.slug || 'kynov');
  const [domainInput, setDomainInput] = useState(currentOrganization?.allowedDomain || '');
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(!!currentOrganization?.autoJoinEnabled);
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  // Add Member to Org state
  const [isAddOrgMemberOpen, setIsAddOrgMemberOpen] = useState(false);
  const [targetAddUserId, setTargetAddUserId] = useState('');
  const [targetAddRole, setTargetAddRole] = useState<OrganizationRole>('MEMBER');

  // Quick Assign Project Modal state
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [selectedAssignProjectId, setSelectedAssignProjectId] = useState<string>('');
  const [selectedAssignRole, setSelectedAssignRole] = useState<'MEMBER' | 'PROJECT_MANAGER' | 'VIEWER'>('MEMBER');

  const [isPending, startTransition] = useTransition();

  const activeOrg = currentOrganization || organizations[0] || {
    id: 'org-kynov',
    name: 'Kynov Technologies',
    slug: 'kynov',
    plan: 'enterprise',
  };

  const isOrgAdminOrOwner =
    currentUser.role === 'Admin' ||
    activeOrg.userRole === 'OWNER' ||
    activeOrg.userRole === 'ADMIN';

  const loadOrgData = async () => {
    try {
      setLoading(true);
      const [projectsData, assignmentsData, membersData, activitiesData] = await Promise.all([
        getAllOrganizationProjectsAction(activeOrg.id),
        getAllUserProjectAssignmentsAction(),
        getOrganizationMembersAction(activeOrg.id),
        getOrganizationActivityAction(activeOrg.id),
      ]);
      setOrgProjects(projectsData.length > 0 ? projectsData : initialProjects.map((p) => ({ ...p, memberCount: 1 })));
      setUserAssignments(assignmentsData);
      setOrgMembers(membersData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to load organization data:', err);
      setOrgProjects(initialProjects.map((p) => ({ ...p, memberCount: 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditOrgName(activeOrg.name);
    setEditOrgSlug(activeOrg.slug);
    setDomainInput(activeOrg.allowedDomain || '');
    setAutoJoinEnabled(!!activeOrg.autoJoinEnabled);
    loadOrgData();
  }, [activeOrg.id, initialProjects]);

  const filteredProjects = orgProjects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
  });

  const filteredMembers = orgMembers.length > 0
    ? orgMembers.filter((m) => {
        const q = searchQuery.toLowerCase();
        return m.userName.toLowerCase().includes(q) || m.userEmail.toLowerCase().includes(q) || (m.department || '').toLowerCase().includes(q);
      })
    : initialUsers.filter((u) => {
        const q = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q);
      }).map((u) => ({
        id: `temp-${u.id}`,
        organizationId: activeOrg.id,
        userId: u.id,
        role: (u.role === 'Admin' ? 'OWNER' : 'MEMBER') as OrganizationRole,
        userName: u.name,
        userEmail: u.email,
        userAvatarUrl: u.avatarUrl,
        department: u.department,
        createdAt: Date.now(),
      }));

  const unassignedUsersCount = filteredMembers.filter((m) => {
    const assigned = userAssignments[m.userId] || [];
    return assigned.length === 0 && m.role !== 'OWNER' && m.role !== 'ADMIN';
  }).length;

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrgAdminOrOwner) return;

    startTransition(async () => {
      const res = await updateOrganizationAction(activeOrg.id, {
        name: editOrgName,
        slug: editOrgSlug,
      });

      if (res.success) {
        onShowToast?.(res.message || 'Organization updated', 'success');
        setIsEditOrgOpen(false);
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        onShowToast?.(res.error || 'Failed to update organization', 'error');
      }
    });
  };

  const handleAddOrgMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAddUserId || !isOrgAdminOrOwner) return;

    startTransition(async () => {
      const res = await addOrganizationMemberAction(activeOrg.id, targetAddUserId, targetAddRole);
      if (res.success) {
        onShowToast?.(res.message || 'Member added to organization', 'success');
        setIsAddOrgMemberOpen(false);
        setTargetAddUserId('');
        await loadOrgData();
      } else {
        onShowToast?.(res.error || 'Failed to add member', 'error');
      }
    });
  };

  const handleRemoveOrgMember = (userId: string) => {
    if (!isOrgAdminOrOwner) return;

    startTransition(async () => {
      const res = await removeOrganizationMemberAction(activeOrg.id, userId);
      if (res.success) {
        onShowToast?.(res.message || 'Member removed', 'success');
        await loadOrgData();
      } else {
        onShowToast?.(res.error || 'Failed to remove member', 'error');
      }
    });
  };

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUser || !selectedAssignProjectId) return;

    startTransition(async () => {
      const res = await assignUserToProject({
        projectId: selectedAssignProjectId,
        targetUserId: assigningUser.id,
        projectRole: selectedAssignRole,
      });

      if (res.success) {
        onShowToast?.(res.message || 'Assigned user to project', 'success');
        setAssigningUser(null);
        setSelectedAssignProjectId('');
        await loadOrgData();
      } else {
        onShowToast?.(res.error || 'Failed to assign user', 'error');
      }
    });
  };

  const availableUsersToEnroll = initialUsers.filter(
    (u) => !orgMembers.some((m) => m.userId === u.id)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Organization Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest">
                Tenant: {activeOrg.slug}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                {activeOrg.plan || 'team'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {activeOrg.name}
              </h1>
              {isOrgAdminOrOwner && (
                <button
                  onClick={() => setIsEditOrgOpen(true)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Organization Name & Settings"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Multi-tenant organization workspace. Configure projects, assign team members, and manage access permissions specifically within {activeOrg.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenCreateProject && (
              <button
                onClick={onOpenCreateProject}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-98"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            )}

            {onOpenCreateOrganization && (
              <button
                onClick={onOpenCreateOrganization}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                <Building2 className="w-4 h-4" /> New Organization
              </button>
            )}
          </div>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-left">
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Projects in Org</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{orgProjects.length}</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Org Members</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{filteredMembers.length}</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your Role</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-2 truncate">
              {activeOrg.userRole || 'MEMBER'}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <BadgeAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Unassigned Seats</span>
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{unassignedUsersCount}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Projects & Access Matrix</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono">
              {orgProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Organization Members</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono">
              {filteredMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'governance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Multi-Tenant Policies</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('activity');
              getOrganizationActivityAction(activeOrg.id).then(setActivities);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity Audit Log</span>
          </button>
        </div>

        {activeTab !== 'governance' && activeTab !== 'activity' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'projects' ? 'Filter projects...' : 'Filter members...'}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 transition"
            />
          </div>
        )}
      </div>

      {/* TAB 1: PROJECTS & ACCESS MATRIX */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {filteredProjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <FolderKanban className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Projects in {activeOrg.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Create a dedicated project space for this organization to begin tracking issues, sprints, and roadmaps.
              </p>
              {onOpenCreateProject && (
                <button
                  onClick={onOpenCreateProject}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-4 h-4" /> Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const leadUser = initialUsers.find((u) => u.id === project.leadId);
                return (
                  <div
                    key={project.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Project Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                            {project.key}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {project.name}
                            </h3>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {project.category || 'Software'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {project.description || 'Enterprise project workspace for tracking tasks and workflows.'}
                      </p>

                      {/* Lead Information */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
                        {leadUser ? (
                          <>
                            <UserAvatar user={leadUser} size="xs" />
                            <div className="text-[11px] text-slate-600 dark:text-slate-400">
                              <span className="text-slate-400">Lead: </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{leadUser.name}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Unassigned Lead
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => setSelectedProjectForMembers(project)}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        <Users className="w-3.5 h-3.5" /> Manage Members
                      </button>

                      <button
                        onClick={() => {
                          onSelectProject(project.id);
                          onNavigateTab('board');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 py-2 rounded-xl text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60 transition"
                      >
                        <Kanban className="w-3.5 h-3.5" /> View Board
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBER PROJECT ROSTER */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Members of {activeOrg.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage organization tenant roles and project assignments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOrgAdminOrOwner && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-500" /> Invite via Link
                </button>
              )}
              {isOrgAdminOrOwner && availableUsersToEnroll.length > 0 && (
                <button
                  onClick={() => setIsAddOrgMemberOpen(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Enroll Member
                </button>
              )}
              <button
                onClick={loadOrgData}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Organization Role</th>
                  <th className="py-3 px-4">Assigned Projects</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredMembers.map((member) => {
                  const assignments = userAssignments[member.userId] || [];
                  const isUserOrgAdmin = member.role === 'OWNER' || member.role === 'ADMIN';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={{
                              name: member.userName,
                              email: member.userEmail,
                              avatarUrl: member.userAvatarUrl,
                            }}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {member.userName}
                              {member.userId === currentUser.id && (
                                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {member.userEmail} • {member.department || 'Engineering'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                            member.role === 'OWNER'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : member.role === 'ADMIN'
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {(member.role === 'OWNER' || member.role === 'ADMIN') && <Shield className="w-3 h-3" />}
                          {member.role}
                        </span>
                      </td>

                      {/* Project Assignments */}
                      <td className="py-3.5 px-4">
                        {isUserOrgAdmin ? (
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                            Global Bypass (All Projects in {activeOrg.name})
                          </span>
                        ) : assignments.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {assignments.map((a) => (
                              <span
                                key={a.projectId}
                                className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                              >
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{a.projectKey}</span>
                                <span className="text-slate-400 text-[9px] uppercase">({a.projectRole})</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                            <Info className="w-3 h-3" /> Unassigned (Zero Project Access)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOrgAdminOrOwner && (
                            <button
                              onClick={() => {
                                const matched = initialUsers.find((u) => u.id === member.userId);
                                if (matched) setAssigningUser(matched);
                                setSelectedAssignProjectId(orgProjects[0]?.id || '');
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1.5 rounded-xl transition"
                            >
                              <UserPlus className="w-3 h-3" /> Assign Project
                            </button>
                          )}

                          {isOrgAdminOrOwner && member.userId !== currentUser.id && member.role !== 'OWNER' && (
                            <button
                              onClick={() => handleRemoveOrgMember(member.userId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                              title="Remove member from organization"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-TENANT POLICIES & CAPABILITY MATRIX */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain Auto-Join Provisioning Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Globe className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Domain Auto-Join Provisioning
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Allow new employees with verified corporate emails to automatically join this organization.
                  </p>
                </div>
              </div>

              {isOrgAdminOrOwner ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingDomain(true);
                    try {
                      const res = await updateOrgDomainAutoJoinAction(activeOrg.id, domainInput || null, autoJoinEnabled);
                      if (res.success) {
                        onShowToast?.(res.message || 'Domain policy updated', 'success');
                        await loadOrgData();
                      } else {
                        onShowToast?.(res.error || 'Failed to update', 'error');
                      }
                    } catch (err: any) {
                      onShowToast?.(err.message || 'Error occurred', 'error');
                    } finally {
                      setIsSavingDomain(false);
                    }
                  }}
                  className="space-y-4 pt-2"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Corporate Domain (e.g. acme.com)
                    </label>
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="autoJoinCheck"
                      checked={autoJoinEnabled}
                      onChange={(e) => setAutoJoinEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="autoJoinCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      Enable instant auto-join for anyone with <span className="font-mono text-indigo-600 dark:text-indigo-400">@{domainInput || 'your-domain'}</span> email
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingDomain}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition shadow-sm"
                  >
                    {isSavingDomain ? 'Saving Policy...' : 'Save Domain Policy'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <p>Auto-join domain: <strong className="text-slate-900 dark:text-white font-mono">{activeOrg.allowedDomain || 'None configured'}</strong></p>
                  <p className="mt-1">Status: {activeOrg.autoJoinEnabled ? 'Active (Auto-join enabled)' : 'Disabled'}</p>
                </div>
              )}
            </div>

            {/* Project-Level Isolation Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FolderKanban className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Zero-Trust Project Isolation
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                In strict accordance with Jira and Linear security schemes:
              </p>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc pl-5">
                <li>Newly registered users join with viewing access to the workspace shell.</li>
                <li>Confidential sprint tickets, backlogs, and metrics remain hidden until an admin assigns the user to a project team.</li>
                <li>Organizations can maintain distinct projects (e.g. Core Engine, Mobile, Operations) without cross-team leakage.</li>
              </ul>
            </div>
          </div>

          {/* Role Capability Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 space-y-4 shadow-xs">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Enterprise Role Capability Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Formal capability matrix defining tenant administration vs project-scoped permissions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Capability / Operation</th>
                    <th className="py-3 px-4 text-center text-amber-600 dark:text-amber-400">Owner</th>
                    <th className="py-3 px-4 text-center text-purple-600 dark:text-purple-400">Admin</th>
                    <th className="py-3 px-4 text-center text-blue-600 dark:text-blue-400">Member</th>
                    <th className="py-3 px-4 text-center text-slate-500">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { cap: 'Rename Organization & Delete Tenant', owner: true, admin: false, member: false, viewer: false },
                    { cap: 'Configure Domain Auto-Join & Security Policies', owner: true, admin: true, member: false, viewer: false },
                    { cap: 'Generate Shareable Invite Links (/join)', owner: true, admin: true, member: false, viewer: false },
                    { cap: 'Create & Archive Projects in Organization', owner: true, admin: true, member: false, viewer: false },
                    { cap: 'Assign Users to Project Teams', owner: true, admin: true, member: false, viewer: false },
                    { cap: 'Create, Edit, and Transition Issues on Assigned Projects', owner: true, admin: true, member: true, viewer: false },
                    { cap: 'Start & Complete Sprints on Assigned Projects', owner: true, admin: true, member: true, viewer: false },
                    { cap: 'Read-Only Access to Assigned Projects & Docs', owner: true, admin: true, member: true, viewer: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{row.cap}</td>
                      <td className="py-3 px-4 text-center">{row.owner ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">—</span>}</td>
                      <td className="py-3 px-4 text-center">{row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">—</span>}</td>
                      <td className="py-3 px-4 text-center">{row.member ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">—</span>}</td>
                      <td className="py-3 px-4 text-center">{row.viewer ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-700">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {isEditOrgOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsEditOrgOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Edit Organization Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Update organization branding and URL identifier.
            </p>

            <form onSubmit={handleUpdateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={editOrgName}
                  onChange={(e) => setEditOrgName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workspace Slug
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500">
                  <span className="text-xs text-slate-400 font-mono">kynov.io/</span>
                  <input
                    type="text"
                    required
                    value={editOrgSlug}
                    onChange={(e) => setEditOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-transparent p-1 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOrgOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !editOrgName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Organization Activity & Audit Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time security and operational events across the {activeOrg.name} tenant.
              </p>
            </div>
            <button
              onClick={() => getOrganizationActivityAction(activeOrg.id).then(setActivities)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">No recorded activity yet for this organization.</p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {activities.map((act) => {
                const date = new Date(act.createdAt);
                const timeStr = date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={act.id} className="relative flex items-start gap-4 pl-1 text-xs">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center relative z-10 shrink-0">
                      <UserAvatar
                        user={{
                          name: act.actorName,
                          avatarUrl: act.actorAvatarUrl,
                        }}
                        size="xs"
                      />
                    </div>
                    <div className="flex-1 bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {act.actorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {timeStr}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs">
                        {act.details || act.action}
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                        {act.action}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Enroll Existing Member to this Org Modal */}
      {isAddOrgMemberOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddOrgMemberOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Enroll Member into {activeOrg.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Select an account to add to this organization.
            </p>

            <form onSubmit={handleAddOrgMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select User
                </label>
                <select
                  value={targetAddUserId}
                  onChange={(e) => setTargetAddUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {availableUsersToEnroll.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organization Role
                </label>
                <select
                  value={targetAddRole}
                  onChange={(e) => setTargetAddRole(e.target.value as OrganizationRole)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="MEMBER">Member (Standard collaborator)</option>
                  <option value="ADMIN">Admin (Can manage projects and members)</option>
                  <option value="VIEWER">Viewer (Read-only observer)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOrgMemberOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !targetAddUserId}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isPending ? 'Enrolling...' : 'Enroll Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Project Members Modal */}
      {selectedProjectForMembers && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedProjectForMembers(null);
                loadOrgData();
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                {selectedProjectForMembers.key}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Project Permissions: {selectedProjectForMembers.name}
              </h2>
            </div>

            <ProjectMembersPanel
              projectId={selectedProjectForMembers.id}
              currentUser={currentUser}
              allUsers={initialUsers}
              onShowToast={onShowToast}
            />
          </div>
        </div>
      )}

      {/* Quick Assign Project Popover/Modal */}
      {assigningUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setAssigningUser(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Assign Project to {assigningUser.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Select the team project and project-level role within {activeOrg.name}.
            </p>

            <form onSubmit={handleQuickAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Project
                </label>
                <select
                  value={selectedAssignProjectId}
                  onChange={(e) => setSelectedAssignProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  required
                >
                  {orgProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Role
                </label>
                <select
                  value={selectedAssignRole}
                  onChange={(e) => setSelectedAssignRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="MEMBER">Member (Create and edit issues)</option>
                  <option value="PROJECT_MANAGER">Project Manager (Manage project & members)</option>
                  <option value="VIEWER">Viewer (Read-only on project board)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningUser(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedAssignProjectId}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isPending ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shareable Invite Link Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        orgId={activeOrg.id}
        orgName={activeOrg.name}
        onClose={() => setIsInviteModalOpen(false)}
        onShowToast={onShowToast}
      />
    </div>
  );
}
