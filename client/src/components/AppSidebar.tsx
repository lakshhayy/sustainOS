import { Home, BarChart2, Zap, Settings, Leaf } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "wouter"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Simulation",
    url: "/simulate",
    icon: Zap,
  },
  {
    title: "Recommendations",
    url: "/recommendations",
    icon: Leaf,
  },
]

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary tracking-tight w-full px-2 group-data-[collapsible=icon]:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
             <div className="w-4 h-4 rounded-full bg-primary" />
          </div>
          SustainOS
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex w-full items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={item.title}
                    size="lg"
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold"
                  >
                    <Link href={item.url}>
                      <item.icon className="!size-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="group-data-[collapsible=icon]:hidden text-xs text-muted-foreground text-center">
          v1.0.4 stable
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
