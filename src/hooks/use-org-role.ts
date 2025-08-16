'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Role } from '@prisma/client';

interface OrgRoleData {
  role: Role | null;
  isLoading: boolean;
  error: string | null;
  permissions: {
    canManageOrg: boolean;
    canWriteNotes: boolean;
    canManageMembers: boolean;
    isAdmin: boolean;
  };
}

export function useOrgRole(orgId: string): OrgRoleData {
  const { user } = useUser();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !orgId) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/organizations/${orgId}/role`);
        if (!response.ok) {
          throw new Error('Failed to fetch role');
        }
        
        const data = await response.json();
        setRole(data.role);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user, orgId]);

  // Calculate permissions based on role
  const permissions = {
    canManageOrg: role === 'ADMIN',
    canWriteNotes: ['OWNER', 'ADMIN', 'MEMBER'].includes(role || ''),
    canManageMembers: role === 'ADMIN' || role === 'OWNER',
    isAdmin: role === 'ADMIN' || role === 'OWNER',
  };

  return {
    role,
    isLoading,
    error,
    permissions,
  };
}
