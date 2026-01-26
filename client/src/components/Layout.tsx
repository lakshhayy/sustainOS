import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Link, useLocation } from "wouter";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  const getPageTitle = (path: string) => {
    switch (path) {
      case "/": return "Dashboard";
      case "/simulate": return "Policy Simulation";
      case "/recommendations": return "Recommendations";
      default: return "SustainOS";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background overflow-hidden flex flex-col h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1 flex justify-between items-center">
             <h1 className="font-heading font-medium text-lg">{getPageTitle(location)}</h1>
             <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Online
                </span>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
