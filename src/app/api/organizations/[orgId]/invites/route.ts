import { NextRequest, NextResponse } from 'next/server';
import { getUserOrgRole, canManageMembers } from '@/lib/authorization';
import { db } from '@/lib/prisma';

// POST - Invite a new member (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    // Get user's role in this organization
    const { userId, role } = await getUserOrgRole(params.orgId);
    
    // Check if user can manage members
    if (!canManageMembers(role)) {
      return NextResponse.json(
        { error: 'Only admins and owners can invite members' },
        { status: 403 }
      );
    }

    const { email, role: inviteRole } = await req.json();

    // Validate the invite role
    if (!['MEMBER', 'ADMIN'].includes(inviteRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be MEMBER or ADMIN' },
        { status: 400 }
      );
    }

    // Check if user is trying to invite someone as ADMIN (only ADMIN can do this)
    if (inviteRole === 'ADMIN' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can invite other admins' },
        { status: 403 }
      );
    }

    // Here you would typically:
    // 1. Send an email invitation
    // 2. Create a pending invitation record
    // 3. Or integrate with Clerk's invitation system

    // For now, we'll just return success
    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitedEmail: email,
      role: inviteRole,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'NOT_MEMBER') {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all pending invitations (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    // Get user's role in this organization
    const { role } = await getUserOrgRole(params.orgId);
    
    // Check if user can manage members
    if (!canManageMembers(role)) {
      return NextResponse.json(
        { error: 'Only admins and owners can view invitations' },
        { status: 403 }
      );
    }

    // Here you would fetch pending invitations from your database
    // For now, return empty array
    return NextResponse.json([]);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'NOT_MEMBER') {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
