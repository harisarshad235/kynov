'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import { sanitizePlainText } from '@/lib/sanitize';
import {
  Organization,
  OrganizationRole,
  User,
  ACTIVE_ORG_COOKIE,
  OrgMemberRow,
  OrganizationInvite,
  OrganizationActivity,
} from '@/lib/types';
import { createProject } from './projects';

/**
 * Fetch all organizations the current authenticated user belongs to.
 */
export async function getUserOrganizationsAction(): Promise<Organization[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const db = getDb();
    await ensureEnterpriseSchema(db);

    const roleStr = String(currentUser.role || '');
    const isSuperAdmin = roleStr === 'Admin' || roleStr === 'ADMIN' || roleStr.toUpperCase() === 'ADMIN';

    // Super admins can view all organizations, regular users see only organizations they belong to
    let rows: any[] = [];
    if (isSuperAdmin) {
      rows = await db.all<any>(sql`
        SELECT
          o.id,
          o.name,
          o.slug,
          o.logo_url as logoUrl,
          o.owner_id as ownerId,
          o.plan,
          o.allowed_domain as allowedDomain,
          o.auto_join_enabled as autoJoinEnabled,
          o.created_at as createdAt,
          o.updated_at as updatedAt,
          COALESCE(om.role, 'OWNER') as userRole,
          (SELECT COUNT(*) FROM organization_members sub_om WHERE sub_om.organization_id = o.id) as memberCount,
          (SELECT COUNT(*) FROM projects p WHERE p.organization_id = o.id AND (p.is_archived = 0 OR p.is_archived IS NULL)) as projectCount
        FROM organizations o
        LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = ${currentUser.id}
        ORDER BY o.name ASC
      `);
    } else {
      rows = await db.all<any>(sql`
        SELECT
          o.id,
          o.name,
          o.slug,
          o.logo_url as logoUrl,
          o.owner_id as ownerId,
          o.plan,
          o.allowed_domain as allowedDomain,
          o.auto_join_enabled as autoJoinEnabled,
          o.created_at as createdAt,
          o.updated_at as updatedAt,
          om.role as userRole,
          (SELECT COUNT(*) FROM organization_members sub_om WHERE sub_om.organization_id = o.id) as memberCount,
          (SELECT COUNT(*) FROM projects p WHERE p.organization_id = o.id AND (p.is_archived = 0 OR p.is_archived IS NULL)) as projectCount
        FROM organizations o
        INNER JOIN organization_members om ON o.id = om.organization_id
        WHERE om.user_id = ${currentUser.id}
        ORDER BY o.name ASC
      `);
    }

    // Fallback: If user belongs to 0 orgs, ensure default organization exists and enroll user
    if (rows.length === 0) {
      await db.run(sql`
        INSERT OR IGNORE INTO organization_members (id, organization_id, user_id, role)
        VALUES (${'om-kynov-' + currentUser.id}, 'org-kynov', ${currentUser.id}, 'MEMBER')
      `);

      const defaultOrg = await db.all<any>(sql`
        SELECT
          o.id,
          o.name,
          o.slug,
          o.logo_url as logoUrl,
          o.owner_id as ownerId,
          o.plan,
          o.created_at as createdAt,
          o.updated_at as updatedAt,
          'MEMBER' as userRole,
          (SELECT COUNT(*) FROM organization_members sub_om WHERE sub_om.organization_id = o.id) as memberCount,
          (SELECT COUNT(*) FROM projects p WHERE p.organization_id = o.id AND (p.is_archived = 0 OR p.is_archived IS NULL)) as projectCount
        FROM organizations o
        WHERE o.id = 'org-kynov'
      `);

      if (defaultOrg && defaultOrg.length > 0) {
        rows = defaultOrg;
      }
    }

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl || null,
      ownerId: r.ownerId || null,
      plan: r.plan || 'team',
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      memberCount: Number(r.memberCount || 0),
      projectCount: Number(r.projectCount || 0),
      userRole: (r.userRole || 'MEMBER') as OrganizationRole,
    }));
  } catch (err) {
    console.error('Failed to get user organizations:', err);
    return [];
  }
}

/**
 * Get active organization from session cookie or default to first organization.
 */
export async function getActiveOrganizationAction(): Promise<Organization | null> {
  try {
    const orgs = await getUserOrganizationsAction();
    if (orgs.length === 0) return null;

    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

    if (activeOrgId) {
      const matched = orgs.find((o) => o.id === activeOrgId);
      if (matched) return matched;
    }

    return orgs[0] || null;
  } catch (err) {
    console.error('Failed to get active organization:', err);
    return null;
  }
}

/**
 * Switch the active organization for current session.
 */
export async function setActiveOrganizationAction(orgId: string) {
  try {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';

    cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
      path: '/',
      httpOnly: false, // Accessible to client-side components
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to switch organization';
    return { success: false, error: message };
  }
}

/**
 * Create a new Organization / Workspace tenant.
 * The creator is assigned as OWNER.
 */
export async function createOrganizationAction(data: {
  name: string;
  slug?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Unauthenticated: Please log in.' };
    }

    const cleanName = sanitizePlainText(data.name.trim());
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Organization name must be at least 2 characters.' };
    }

    let cleanSlug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    if (!cleanSlug || cleanSlug.length < 2) {
      cleanSlug = `org-${Date.now().toString(36)}`;
    }

    const db = getDb();
    await ensureEnterpriseSchema(db);

    // Verify unique slug
    const existing = await db.all<{ id: string }>(sql`
      SELECT id FROM organizations WHERE slug = ${cleanSlug} LIMIT 1
    `);
    if (existing && existing.length > 0) {
      cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const orgId = `org-${Date.now().toString(36)}`;

    // 1. Insert organization
    await db.run(sql`
      INSERT INTO organizations (id, name, slug, owner_id, plan)
      VALUES (${orgId}, ${cleanName}, ${cleanSlug}, ${currentUser.id}, 'team')
    `);

    // 2. Add creator as OWNER in organization_members
    const memberId = `om-${orgId}-${currentUser.id}`;
    await db.run(sql`
      INSERT INTO organization_members (id, organization_id, user_id, role)
      VALUES (${memberId}, ${orgId}, ${currentUser.id}, 'OWNER')
    `);

    // 3. Create initial starter project for this organization
    const starterKey = cleanSlug.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'CORE';
    await createProject({
      key: starterKey.length >= 2 ? starterKey : `${starterKey}1`,
      name: `${cleanName} Space`,
      description: `Default collaborative project workspace for ${cleanName}.`,
      category: 'Software',
      leadId: currentUser.id,
      organizationId: orgId,
    }).catch((e) => {
      console.warn('Initial project bootstrap warning:', e);
    });

    // 4. Set active organization cookie
    await setActiveOrganizationAction(orgId);

    revalidatePath('/');
    return {
      success: true,
      orgId,
      message: `Organization "${cleanName}" created successfully!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create organization';
    return { success: false, error: message };
  }
}

/**
 * Update organization metadata (name, slug, logo).
 */
export async function updateOrganizationAction(
  orgId: string,
  data: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
  }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated.' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    // Verify caller is OWNER or ADMIN
    const roleStr = String(currentUser.role || '');
    const isSuperAdmin = roleStr === 'Admin' || roleStr.toUpperCase() === 'ADMIN';

    if (!isSuperAdmin) {
      const membership = await db.all<{ role: string }>(sql`
        SELECT role FROM organization_members
        WHERE organization_id = ${orgId} AND user_id = ${currentUser.id}
      `);
      const role = membership[0]?.role;
      if (role !== 'OWNER' && role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Only Organization Owners and Admins can edit settings.' };
      }
    }

    const updates: any[] = [];
    if (data.name !== undefined) {
      const cleanName = sanitizePlainText(data.name.trim());
      if (cleanName.length < 2) return { success: false, error: 'Organization name must be at least 2 characters.' };
      await db.run(sql`UPDATE organizations SET name = ${cleanName}, updated_at = (unixepoch() * 1000) WHERE id = ${orgId}`);
    }

    if (data.slug !== undefined) {
      const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanSlug.length < 2) return { success: false, error: 'Slug must be at least 2 characters.' };
      const duplicate = await db.all<{ id: string }>(sql`
        SELECT id FROM organizations WHERE slug = ${cleanSlug} AND id != ${orgId} LIMIT 1
      `);
      if (duplicate && duplicate.length > 0) {
        return { success: false, error: 'This organization slug is already in use.' };
      }
      await db.run(sql`UPDATE organizations SET slug = ${cleanSlug}, updated_at = (unixepoch() * 1000) WHERE id = ${orgId}`);
    }

    if (data.logoUrl !== undefined) {
      await db.run(sql`UPDATE organizations SET logo_url = ${data.logoUrl}, updated_at = (unixepoch() * 1000) WHERE id = ${orgId}`);
    }

    revalidatePath('/');
    return { success: true, message: 'Organization updated successfully.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update organization';
    return { success: false, error: message };
  }
}

/**
 * Fetch all members of an organization.
 */
export async function getOrganizationMembersAction(orgId: string): Promise<OrgMemberRow[]> {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const rows = await db.all<any>(sql`
      SELECT
        om.id,
        om.organization_id as organizationId,
        om.user_id as userId,
        om.role,
        om.created_at as createdAt,
        u.name as userName,
        u.email as userEmail,
        u.avatar_url as userAvatarUrl,
        u.department as department
      FROM organization_members om
      INNER JOIN users u ON om.user_id = u.id
      WHERE om.organization_id = ${orgId}
      ORDER BY
        CASE om.role
          WHEN 'OWNER' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'MEMBER' THEN 3
          ELSE 4
        END,
        u.name ASC
    `);

    return rows.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      userId: r.userId,
      role: r.role as OrganizationRole,
      userName: r.userName,
      userEmail: r.userEmail,
      userAvatarUrl: r.userAvatarUrl || null,
      department: r.department || null,
      createdAt: Number(r.createdAt || 0),
    }));
  } catch (err) {
    console.error('Failed to get organization members:', err);
    return [];
  }
}

/**
 * Add or invite an existing workspace user to this Organization.
 */
export async function addOrganizationMemberAction(
  orgId: string,
  targetUserId: string,
  role: OrganizationRole = 'MEMBER'
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated.' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    const memberId = `om-${orgId}-${targetUserId}`;
    await db.run(sql`
      INSERT INTO organization_members (id, organization_id, user_id, role)
      VALUES (${memberId}, ${orgId}, ${targetUserId}, ${role})
      ON CONFLICT(organization_id, user_id) DO UPDATE SET role = excluded.role
    `);

    revalidatePath('/');
    return { success: true, message: 'Member added to organization successfully.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add member to organization';
    return { success: false, error: message };
  }
}

/**
 * Remove a user from an organization.
 */
export async function removeOrganizationMemberAction(orgId: string, targetUserId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated.' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    // Prevent removing the sole owner
    const member = await db.all<{ role: string }>(sql`
      SELECT role FROM organization_members
      WHERE organization_id = ${orgId} AND user_id = ${targetUserId}
    `);
    if (member[0]?.role === 'OWNER') {
      const ownerCount = await db.all<{ count: number }>(sql`
        SELECT count(*) as count FROM organization_members
        WHERE organization_id = ${orgId} AND role = 'OWNER'
      `);
      if (ownerCount[0]?.count <= 1) {
        return { success: false, error: 'Cannot remove the sole Organization Owner.' };
      }
    }

    await db.run(sql`
      DELETE FROM organization_members
      WHERE organization_id = ${orgId} AND user_id = ${targetUserId}
    `);

    // Log activity
    await logOrgActivityAction(
      orgId,
      'MEMBER_REMOVED',
      'MEMBER',
      targetUserId,
      `Member removed from organization.`
    );

    revalidatePath('/');
    return { success: true, message: 'Member removed from organization.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove member';
    return { success: false, error: message };
  }
}

/**
 * Create a shareable invite link for an organization.
 */
export async function createOrgInviteLinkAction(
  orgId: string,
  role: OrganizationRole = 'MEMBER',
  email?: string
): Promise<{ success: boolean; invite?: OrganizationInvite; inviteUrl?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated.' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    const roleStr = String(currentUser.role || '');
    const isSuperAdmin = roleStr === 'Admin' || roleStr.toUpperCase() === 'ADMIN';

    if (!isSuperAdmin) {
      const membership = await db.all<{ role: string }>(sql`
        SELECT role FROM organization_members
        WHERE organization_id = ${orgId} AND user_id = ${currentUser.id}
      `);
      const callerRole = membership[0]?.role;
      if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
        return { success: false, error: 'Only Organization Admins or Owners can generate invite links.' };
      }
    }

    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const inviteId = `inv-${crypto.randomUUID().slice(0, 12)}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days validity
    const cleanEmail = email ? sanitizePlainText(email.trim().toLowerCase()) : null;

    await db.run(sql`
      INSERT INTO organization_invites (id, organization_id, token, email, role, invited_by_id, expires_at, created_at)
      VALUES (
        ${inviteId},
        ${orgId},
        ${token},
        ${cleanEmail},
        ${role},
        ${currentUser.id},
        ${expiresAt},
        ${Date.now()}
      )
    `);

    await logOrgActivityAction(
      orgId,
      'INVITE_CREATED',
      'ORGANIZATION',
      inviteId,
      `Created shareable invite link with role ${role}${cleanEmail ? ` for ${cleanEmail}` : ''}`
    );

    const inviteUrl = `/join?token=${token}`;

    return {
      success: true,
      invite: {
        id: inviteId,
        organizationId: orgId,
        token,
        email: cleanEmail,
        role,
        invitedById: currentUser.id,
        inviterName: currentUser.name,
        expiresAt,
        createdAt: Date.now(),
      },
      inviteUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create invite link';
    return { success: false, error: message };
  }
}

/**
 * Fetch public metadata for an organization invite token.
 */
export async function getOrgInviteInfoAction(token: string): Promise<{
  success: boolean;
  invite?: {
    organizationName: string;
    organizationSlug: string;
    role: OrganizationRole;
    inviterName: string | null;
    isExpired: boolean;
    isAccepted: boolean;
  };
  error?: string;
}> {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const rows = await db.all<{
      id: string;
      organizationId: string;
      orgName: string;
      orgSlug: string;
      role: OrganizationRole;
      inviterName: string | null;
      expiresAt: number;
      acceptedAt: number | null;
    }>(sql`
      SELECT
        oi.id,
        oi.organization_id as organizationId,
        o.name as orgName,
        o.slug as orgSlug,
        oi.role,
        u.name as inviterName,
        oi.expires_at as expiresAt,
        oi.accepted_at as acceptedAt
      FROM organization_invites oi
      INNER JOIN organizations o ON oi.organization_id = o.id
      LEFT JOIN users u ON oi.invited_by_id = u.id
      WHERE oi.token = ${token}
      LIMIT 1
    `);

    if (!rows || rows.length === 0) {
      return { success: false, error: 'Invalid or nonexistent invitation link.' };
    }

    const row = rows[0];
    const isExpired = Date.now() > row.expiresAt;
    const isAccepted = !!row.acceptedAt;

    return {
      success: true,
      invite: {
        organizationName: row.orgName,
        organizationSlug: row.orgSlug,
        role: row.role,
        inviterName: row.inviterName,
        isExpired,
        isAccepted,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve invite';
    return { success: false, error: message };
  }
}

/**
 * Accept an invite link to join an organization.
 */
export async function acceptOrgInviteAction(token: string): Promise<{
  success: boolean;
  organizationId?: string;
  error?: string;
}> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Please sign in or create an account to accept this invite.' };
    }

    const db = getDb();
    await ensureEnterpriseSchema(db);

    const rows = await db.all<{
      id: string;
      organizationId: string;
      role: OrganizationRole;
      email: string | null;
      expiresAt: number;
      acceptedAt: number | null;
      orgName: string;
    }>(sql`
      SELECT
        oi.id,
        oi.organization_id as organizationId,
        oi.role,
        oi.email,
        oi.expires_at as expiresAt,
        oi.accepted_at as acceptedAt,
        o.name as orgName
      FROM organization_invites oi
      INNER JOIN organizations o ON oi.organization_id = o.id
      WHERE oi.token = ${token}
      LIMIT 1
    `);

    if (!rows || rows.length === 0) {
      return { success: false, error: 'Invitation not found.' };
    }

    const invite = rows[0];
    if (Date.now() > invite.expiresAt) {
      return { success: false, error: 'This invitation link has expired. Please ask an administrator for a new invite.' };
    }

    if (invite.email && invite.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      return { success: false, error: `This invite was sent specifically to ${invite.email}. Please switch accounts to accept.` };
    }

    // Upsert member into organization
    const memberId = `om-${crypto.randomUUID().slice(0, 12)}`;
    await db.run(sql`
      INSERT INTO organization_members (id, organization_id, user_id, role, created_at)
      VALUES (${memberId}, ${invite.organizationId}, ${currentUser.id}, ${invite.role}, ${Date.now()})
      ON CONFLICT(organization_id, user_id) DO UPDATE SET
        role = ${invite.role}
    `);

    // Mark invite as used
    await db.run(sql`
      UPDATE organization_invites
      SET accepted_at = ${Date.now()}
      WHERE id = ${invite.id}
    `);

    // Automatically set this organization as active
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_ORG_COOKIE, invite.organizationId, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    await logOrgActivityAction(
      invite.organizationId,
      'MEMBER_JOINED',
      'MEMBER',
      currentUser.id,
      `${currentUser.name} joined the organization via invite link with role ${invite.role}.`
    );

    revalidatePath('/');
    return { success: true, organizationId: invite.organizationId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to accept invitation';
    return { success: false, error: message };
  }
}

/**
 * Log an audit trail entry for an organization.
 */
export async function logOrgActivityAction(
  orgId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const logId = `act-${crypto.randomUUID().slice(0, 12)}`;
    await db.run(sql`
      INSERT INTO organization_activity (id, organization_id, actor_id, action, entity_type, entity_id, details, created_at)
      VALUES (
        ${logId},
        ${orgId},
        ${currentUser?.id || null},
        ${action},
        ${entityType},
        ${entityId || null},
        ${details || null},
        ${Date.now()}
      )
    `);
  } catch {
    // Fail-safe: audit logs do not break primary operations
  }
}

/**
 * Fetch organization audit logs and activity history.
 */
export async function getOrganizationActivityAction(orgId: string): Promise<OrganizationActivity[]> {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const rows = await db.all<{
      id: string;
      organizationId: string;
      actorId: string | null;
      actorName: string | null;
      actorAvatarUrl: string | null;
      action: string;
      entityType: string;
      entityId: string | null;
      details: string | null;
      createdAt: number;
    }>(sql`
      SELECT
        oa.id,
        oa.organization_id as organizationId,
        oa.actor_id as actorId,
        u.name as actorName,
        u.avatar_url as actorAvatarUrl,
        oa.action,
        oa.entity_type as entityType,
        oa.entity_id as entityId,
        oa.details,
        oa.created_at as createdAt
      FROM organization_activity oa
      LEFT JOIN users u ON oa.actor_id = u.id
      WHERE oa.organization_id = ${orgId}
      ORDER BY oa.created_at DESC
      LIMIT 40
    `);

    return rows.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      actorId: r.actorId,
      actorName: r.actorName || 'System',
      actorAvatarUrl: r.actorAvatarUrl,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      details: r.details,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Configure domain auto-join policies for an organization.
 */
export async function updateOrgDomainAutoJoinAction(
  orgId: string,
  allowedDomain: string | null,
  autoJoinEnabled: boolean
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated.' };

    const db = getDb();
    await ensureEnterpriseSchema(db);

    const roleStr = String(currentUser.role || '');
    const isSuperAdmin = roleStr === 'Admin' || roleStr.toUpperCase() === 'ADMIN';

    if (!isSuperAdmin) {
      const membership = await db.all<{ role: string }>(sql`
        SELECT role FROM organization_members
        WHERE organization_id = ${orgId} AND user_id = ${currentUser.id}
      `);
      const callerRole = membership[0]?.role;
      if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
        return { success: false, error: 'Only Organization Admins or Owners can modify domain policies.' };
      }
    }

    const cleanDomain = allowedDomain ? sanitizePlainText(allowedDomain.trim().toLowerCase().replace(/^@/, '')) : null;

    await db.run(sql`
      UPDATE organizations
      SET
        allowed_domain = ${cleanDomain},
        auto_join_enabled = ${autoJoinEnabled ? 1 : 0},
        updated_at = (unixepoch() * 1000)
      WHERE id = ${orgId}
    `);

    await logOrgActivityAction(
      orgId,
      'DOMAIN_POLICY_UPDATED',
      'ORGANIZATION',
      orgId,
      `Updated auto-join policy: domain=${cleanDomain || 'none'}, enabled=${autoJoinEnabled}`
    );

    revalidatePath('/');
    return { success: true, message: 'Domain auto-join policy updated.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update domain policy';
    return { success: false, error: message };
  }
}


