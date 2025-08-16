'use client';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { Activity, Home, Users } from 'lucide-react'; // Assuming you are using lucide-react for icons

const items = [
  {
    url: '/dashboard',
    title: 'Home',
    icon: Home,
  },
  {
    url: '/dashboard/activity',
    title: 'Activity',
    icon: Activity,
  },
  {
    url: '/dashboard/leads',
    title: 'Leads',
    icon: Users,
  },
];
export const Menu = () => {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
