'use client';
import { ChevronsUpDown, LogOut, User2, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { useClerk, useUser } from '@clerk/nextjs';

export const SideFooter1 = () => {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <SidebarMenuButton>
                <User2 className="w-8 h-8" />
                <div className="ml-2">
                  <span className="flex flex-col font-medium">
                    {user?.fullName}
                  </span>
                  <div className="text-gray-500 text-xs">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                <ChevronsUpDown className="ml-auto" size={16} />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openUserProfile()}
                className="cursor-pointer"
              >
                <UserCircle2 className="w-8 h-8" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};
