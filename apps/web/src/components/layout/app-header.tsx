import { Menu, Home, ChevronDown, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type AppSection =
  | "Home"
  | "Color Database"
  | "Shade Mapping"
  | "My Mappings"
  | "Color Bank"
  | "Report"
  | "Data Input"
  | "User Management";
export type Role = "PID" | "R&D" | "TSI" | "Website Admin";
const sections: AppSection[] = [
  "Home",
  "Color Database",
  "Shade Mapping",
  "My Mappings",
  "Color Bank",
  "Report",
  "Data Input",
  "User Management",
];

export function BrandLogo() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium tracking-tight">
      <span aria-hidden="true" className="flex gap-0.5">
        <i className="size-2 rounded-full bg-primary" />
        <i className="size-2 rounded-full bg-chart-3" />
        <i className="size-2 rounded-full bg-chart-2" />
      </span>
      <span>
        Color <span className="text-primary">Bank</span>
      </span>
    </span>
  );
}

export function AppHeader({
  activeSection,
  onNavigate,
  role,
  userName,
  onOpenSidebar,
  onProfile,
}: {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  role: Role;
  userName: string;
  onOpenSidebar?: () => void;
  onProfile: () => void;
}) {
  const items = sections.filter(
    (item) => item !== "User Management" || role === "Website Admin",
  );
  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("");
  return (
    <header className="flex min-h-14 shrink-0 items-center gap-4 border-b bg-card px-4">
      {onOpenSidebar && (
        <Button
          size="icon-sm"
          variant="ghost"
          className="lg:hidden"
          aria-label="Open product formats"
          onClick={onOpenSidebar}
        >
          <Menu />
        </Button>
      )}
      <BrandLogo />
      <nav
        aria-label="Main navigation"
        className="hidden min-w-0 flex-1 items-stretch self-stretch overflow-x-auto lg:flex"
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onNavigate(item)}
            aria-current={activeSection === item ? "page" : undefined}
            className="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-3 text-[11px] whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:font-medium aria-[current=page]:text-primary"
          >
            {item === "Home" && <Home className="size-3" />}
            {item}
          </button>
        ))}
      </nav>
      <div className="ml-auto lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            {activeSection}
            <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {items.map((item) => (
              <DropdownMenuItem key={item} onClick={() => onNavigate(item)}>
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge variant="secondary" className="hidden xl:inline-flex">
          {role === "Website Admin" ? "admin" : role}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-auto gap-2 p-0.5" />}
          >
            <span className="hidden text-[11px] xl:inline">{userName}</span>
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuItem disabled>{role} · Local preview</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfile}>
              <Palette />
              Preview identity & permissions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
