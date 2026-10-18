import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.status === 'PENDING') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? Number(sinceParam) : 0;

    const db = getDb();

    let query;
    if (projectId && projectId !== 'default') {
      if (since > 0) {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          WHERE (project_id = ${projectId} OR project_id IS NULL)
            AND updated_at > ${since}
          ORDER BY updated_at ASC
        `;
      } else {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          WHERE project_id = ${projectId} OR project_id IS NULL
          ORDER BY updated_at ASC
        `;
      }
    } else {
      if (since > 0) {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          WHERE updated_at > ${since}
          ORDER BY updated_at ASC
        `;
      } else {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          ORDER BY updated_at ASC
        `;
      }
    }

    const updatedIssues = await db.all(query);

    // Fetch latest user status and role in real time
    const freshUserRows = await db.all<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      department: string | null;
      avatar_url: string | null;
    }>(sql`
      SELECT id, name, email, role, status, department, avatar_url
      FROM users
      WHERE id = ${currentUser.id}
      LIMIT 1
    `).catch(() => []);
    const freshUser = freshUserRows[0] || currentUser;

    // Fetch accessible projects for this session user in real time
    const roleStr = String(freshUser.role || '');
    const isAdmin = roleStr === 'Admin' || roleStr === 'ADMIN' || roleStr.toUpperCase() === 'ADMIN';

    let accessibleProjects: any[] = [];
    if (isAdmin) {
      accessibleProjects = await db.all(sql`
        SELECT p.*
        FROM projects p
        WHERE (p.is_archived = 0 OR (p.is_archived IS NULL AND p.status != 'archived'))
        ORDER BY p.name ASC
      `).catch(() => []);
    } else {
      accessibleProjects = await db.all(sql`
        SELECT DISTINCT p.*
        FROM projects p
        INNER JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = ${currentUser.id}
          AND (p.is_archived = 0 OR (p.is_archived IS NULL AND p.status != 'archived'))
        ORDER BY p.name ASC
      `).catch(() => []);
    }

    // If session user is an Admin, return active users roster for instant sync
    let allUsersList: any[] | undefined = undefined;
    if (isAdmin) {
      allUsersList = await db.all(sql`
        SELECT id, name, email, role, status, department, avatar_url as avatarUrl
        FROM users
        ORDER BY name ASC
      `).catch(() => []);
    }

    // Fetch user organizations with fresh projectCount and memberCount
    let freshOrganizations: any[] = [];
    try {
      const orgRows = await db.all<any>(sql`
        SELECT
          o.id,
          o.name,
          o.slug,
          o.logo_url as logoUrl,
          o.owner_id as ownerId,
          o.plan,
          COALESCE(om.role, 'MEMBER') as userRole,
          (SELECT COUNT(*) FROM organization_members sub_om WHERE sub_om.organization_id = o.id) as memberCount,
          (SELECT COUNT(*) FROM projects p WHERE p.organization_id = o.id AND (p.is_archived = 0 OR p.is_archived IS NULL)) as projectCount
        FROM organizations o
        LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = ${currentUser.id}
        ORDER BY o.name ASC
      `);
      freshOrganizations = orgRows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        logoUrl: r.logoUrl || null,
        ownerId: r.ownerId || null,
        plan: r.plan || 'team',
        memberCount: Number(r.memberCount || 0),
        projectCount: Number(r.projectCount || 0),
        userRole: r.userRole || 'MEMBER',
      }));
    } catch (e) {
      // Non-fatal if organization tables are undergoing migration
    }

    return NextResponse.json(
      {
        issues: updatedIssues,
        projects: accessibleProjects,
        currentUser: freshUser,
        users: allUsersList,
        organizations: freshOrganizations,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/issues/sync:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync issues' },
      { status: 500 }
    );
  }
}
