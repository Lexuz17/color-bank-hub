import { useState, type ReactNode } from "react";
import { AppHeader, type AppSection, type Role } from "./app-header";
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
            className="hidden w-51 shrink-0 flex-col border-r lg:flex"
          >
            <div className="min-h-0 flex-1">{sidebar}</div>
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
            className="hidden min-h-0 w-68 shrink-0 self-stretch overflow-y-auto border-l bg-card xl:block"
          >
            {detailPanel}
          </aside>
        )}
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-65! gap-0">
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
