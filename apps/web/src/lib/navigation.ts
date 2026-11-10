import type { Permission } from "@color-bank-hub/contracts/rbac";
import { Home, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  permission?: Permission; //Hidden from users without it; keep in sync with the route's beforeLoad guard.
}

export const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Color Database", to: "/color-database" },
  { label: "Shade Mapping", to: "/shade-mapping" },
  { label: "My Mappings", to: "/my-mappings" },
  { label: "Color Bank", to: "/color-bank" },
  { label: "Report", to: "/report" },
  { label: "Data Input", to: "/data-input", permission: "catalog:write" },
  {
    label: "User Management",
    to: "/user-management",
    permission: "user:manage",
  },
] as const satisfies readonly NavItem[];

export type AppSection = (typeof navItems)[number]["label"];
