import { useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AppHeader, type AppSection, type Role } from "./app-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function WorkspaceLayout({
  children,
  sidebar,
  detailPanel,
  footer,
  activeSection,
  onNavigate,
  role,
  userName,
  onProfile,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
  detailPanel?: ReactNode;
  footer?: ReactNode;
  activeSection: AppSection | null;
  onNavigate: (section: AppSection) => void;
  role: Role;
  userName: string;
  onProfile: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <a
        href="#workspace-main"
        className="sr-only z-50 bg-card p-3 focus:not-sr-only focus:absolute"
      >
        Skip to content
      </a>
      <AppHeader
        activeSection={activeSection}
        onNavigate={onNavigate}
        role={role}
        userName={userName}
        onProfile={onProfile}
        onOpenSidebar={sidebar ? () => setMobileOpen(true) : undefined}
      />
      <div className="flex min-h-0 flex-1">
        {sidebar && (
          <aside
            aria-label="Workspace sidebar"
            className={`hidden shrink-0 flex-col border-r lg:flex ${collapsed ? "w-11" : "w-[204px]"}`}
          >
            <div className="flex h-9 shrink-0 items-center justify-between border-b px-2">
              {!collapsed && (
                <span className="pl-2 text-[9px] tracking-wide text-muted-foreground">
                  WORKSPACE
                </span>
              )}
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </Button>
            </div>
            {!collapsed && <div className="min-h-0 flex-1">{sidebar}</div>}
          </aside>
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main
            id="workspace-main"
            className="min-h-0 min-w-0 flex-1 overflow-y-auto"
          >
            {children}
          </main>
          {footer && <div className="shrink-0 bg-background">{footer}</div>}
        </div>
        {detailPanel && (
          <aside
            aria-label="Product detail"
            className="hidden min-h-0 w-[272px] shrink-0 self-stretch overflow-y-auto border-l bg-card xl:block"
          >
            {detailPanel}
          </aside>
        )}
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px]! gap-0">
          <SheetHeader>
            <SheetTitle>Product formats</SheetTitle>
            <SheetDescription>Select a format to explore.</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1">{sidebar}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
