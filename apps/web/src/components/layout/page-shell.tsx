import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { WorkspaceLayout } from "./workspace-layout";
import type { AppSection } from "./app-header";
import { ProductFormatSidebar } from "@/components/product-format/product-format-sidebar";
import { sectionPaths } from "@/lib/navigation";

export function PageShell({
  section,
  children,
  format,
  onFormatChange,
  detailPanel,
  sidebar,
}: {
  section: AppSection;
  children: ReactNode;
  format?: string;
  onFormatChange?: (format: string) => void;
  detailPanel?: ReactNode;
  sidebar?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <WorkspaceLayout
      activeSection={section}
      onNavigate={(item) => {
        void navigate({ to: sectionPaths[item] });
      }}
      role="Website Admin"
      userName="John doe"
      onProfile={() => {
        void navigate({ to: "/user-management" });
      }}
      sidebar={
        format && onFormatChange ? (
          <ProductFormatSidebar value={format} onValueChange={onFormatChange} />
        ) : (
          sidebar
        )
      }
      detailPanel={detailPanel}
      footer={
        <footer className="mx-5 flex flex-wrap justify-between gap-2 border-t py-3 text-[10px] text-muted-foreground">
          <span>Color Bank & Shade Mapping Hub · Local prototype</span>
          <Link to="/showcase" className="text-primary hover:underline">
            Component showcase
          </Link>
        </footer>
      }
    >
      {children}
    </WorkspaceLayout>
  );
}
