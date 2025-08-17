import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';

export default async function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <KBar>
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar/>
      <SidebarInset>
      <Header/>
      {/* page main content */}
      {children}
      {/* page main content end*/}
      </SidebarInset>
    </SidebarProvider></KBar>
  );
}
