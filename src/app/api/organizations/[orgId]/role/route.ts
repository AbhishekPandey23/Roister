import { NextRequest, NextResponse } from 'next/server';
import { getUserOrgRole } from '@/lib/authorization';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const { role } = await getUserOrgRole(params.orgId);
    
    return NextResponse.json({ role });
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
