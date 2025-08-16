import { db } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

export async function getUserOrgRole(orgId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');

  const membership = await db.organizationMembership.findUnique({
    where: { user_id_organization_id: { user_id: userId, organization_id: orgId } },
    select: { role: true },
  });

  if (!membership) {
    throw new Error('NOT_MEMBER');
  }

  return { userId, role: membership.role };
}

// Helper to check if user has admin privileges
export function isAdmin(role: Role): boolean {
  return role === 'ADMIN' || role === 'OWNER';
}

// Helper to check if user can manage organization
export function canManageOrg(role: Role): boolean {
  return role === 'ADMIN';
}

// Helper to check if user can write notes
export function canWriteNotes(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(role);
}

// Helper to check if user can invite/remove members
export function canManageMembers(role: Role): boolean {
  return role === 'ADMIN' || role === 'OWNER';
}
