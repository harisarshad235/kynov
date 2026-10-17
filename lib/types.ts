import {
  User,
  Project,
  Swimlane,
  ProjectStatus,
  Issue,
  Comment,
  HistoryEntry,
  Document,
  Attachment,
  Sprint,
  UserRole,
  UserStatus,
  IssueType,
  IssuePriority,
  IssueStatus,
  Subtask,
  IssueLink,
  Notification as AppNotification,
  IssueComment,
  IssueAuditLog,
  ProjectWorkflowStatus,
  WorkflowTransitionRule,
  IssueGitLink,
  AgileIssueType,
  WorkflowCategory,
  EnterpriseLinkType,
} from '@/db/schema';

export type {
  User,
  Project,
  Swimlane,
  ProjectStatus,
  Issue,
  Comment,
  HistoryEntry,
  Document,
  Attachment,
  Sprint,
  UserRole,
  UserStatus,
  IssueType,
  IssuePriority,
  IssueStatus,
  Subtask,
  IssueLink,
  AppNotification,
  IssueComment,
  IssueAuditLog,
  ProjectWorkflowStatus,
  WorkflowTransitionRule,
  IssueGitLink,
  AgileIssueType,
  WorkflowCategory,
  EnterpriseLinkType,
};

export interface FullIssue extends Issue {
  labels: string[];
  comments: (Comment & { author?: User | null })[];
  customComments?: (IssueComment & { author?: User | null })[];
  history: HistoryEntry[];
  auditLogs?: IssueAuditLog[];
  attachments: Attachment[];
  subtasks: Subtask[];
  links: IssueLink[];
  gitLinks?: IssueGitLink[];
  parent?: FullIssue | null;
  children?: FullIssue[];
  blockedByIssues?: FullIssue[];
  blockingIssues?: FullIssue[];
  assignee?: User | null;
  reporter?: User | null;
  sprint?: Sprint | null;
  project?: Project | null;
}

export function isDemoIssue(issue: { environment?: string | null; labels?: string[] }): boolean {
  if (issue.environment) return issue.environment.toUpperCase() === 'DEMO';
  return issue.labels?.some((l) => l.toLowerCase() === 'demo') ?? false;
}

export interface FullDocument extends Document {
  author?: User | null;
  attachments: Attachment[];
}

export interface WorkspaceMetrics {
  total: number;
  completed: number;
  inProgress: number;
  openBugs: number;
  totalPoints: number;
  completedPoints: number;
  completionRate: number;
}

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const ACTIVE_ORG_COOKIE = 'kynov_active_org';

export interface OrgMemberRow {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  userName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  department: string | null;
  createdAt: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  ownerId?: string | null;
  plan?: string | null;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  memberCount?: number;
  projectCount?: number;
  userRole?: OrganizationRole;
}


