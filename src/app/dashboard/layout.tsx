import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <Separator />
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
