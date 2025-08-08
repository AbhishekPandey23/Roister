'use client';
import { Bell } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { Skeleton } from '../ui/skeleton';

export const Navbar = () => {
  const { user, isLoaded } = useUser();
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      {/* Left Side */}
      <div>
        <SidebarTrigger />
        Navbar
      </div>
      {/* Right Side */}
      <div className="flex space-x-4">
        <Bell />
        {!isLoaded ? (
          <Skeleton className="rounded-full size-7" />
        ) : (
          <UserButton />
        )}
      </div>
    </nav>
  );
};
