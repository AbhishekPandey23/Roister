'use client';

import { useOrgRole } from '@/hooks/use-org-role';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, FileText, Plus } from 'lucide-react';

interface OrgManagementProps {
  orgId: string;
}

export function OrgManagement({ orgId }: OrgManagementProps) {
  const { role, isLoading, error, permissions } = useOrgRole(orgId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!role) {
    return <div>Not a member of this organization</div>;
  }

  return (
    <div className="space-y-6">
      {/* Role Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={role === 'ADMIN' ? 'destructive' : role === 'OWNER' ? 'default' : 'secondary'}>
              {role}
            </Badge>
            <span className="text-sm text-gray-600">
              {role === 'ADMIN' && 'You can manage the organization and invite members'}
              {role === 'OWNER' && 'You own this organization and can manage everything'}
              {role === 'MEMBER' && 'You can write notes on leads and invite other members'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Organization Management (Admin Only) */}
      {permissions.canManageOrg && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organization Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Create New Organization
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Organization Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lead Notes (All Members) */}
      {permissions.canWriteNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lead Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Write Notes on Leads
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              View All Leads
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Member Management (Admin & Owner) */}
      {permissions.canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Invite New Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Remove Members
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
