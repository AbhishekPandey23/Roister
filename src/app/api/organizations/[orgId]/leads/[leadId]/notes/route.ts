import { NextRequest, NextResponse } from 'next/server';
import { getUserOrgRole, canWriteNotes } from '@/lib/authorization';
import { db } from '@/lib/prisma';

// POST - Create a note on a lead
export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string; leadId: string } }
) {
  try {
    // Get user's role in this organization
    const { userId, role } = await getUserOrgRole(params.orgId);
    
    // Check if user can write notes
    if (!canWriteNotes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to write notes' },
        { status: 403 }
      );
    }

    const { content } = await req.json();

    // Create the note
    const note = await db.leadNote.create({
      data: {
        content,
        leadId: params.leadId,
        createdById: userId,
      },
    });

    return NextResponse.json(note, { status: 201 });
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

// GET - Get all notes for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string; leadId: string } }
) {
  try {
    // Get user's role in this organization
    const { role } = await getUserOrgRole(params.orgId);
    
    // Check if user can view notes (same permission as writing)
    if (!canWriteNotes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view notes' },
        { status: 403 }
      );
    }

    // Get all notes for this lead
    const notes = await db.leadNote.findMany({
      where: { leadId: params.leadId },
      include: {
        createdBy: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(notes);
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
