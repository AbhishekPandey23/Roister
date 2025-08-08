import { Separator } from '../ui/separator';
import {
  SidebarContent,
  Sidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '../ui/sidebar';
import { SideFooter } from './footer';
import { SideHeader } from './header';
import { Menu } from './menu';
export const AppSidebar = () => {
  return (
    <Sidebar collapsible='icon'>
      <SideHeader />
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <Menu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SideFooter />
    </Sidebar>
  );
};
