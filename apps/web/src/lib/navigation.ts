import type { Permission } from "@color-bank-hub/contracts/rbac";
import type { AppSection } from "@/components/layout/app-header";
export const sectionPaths = {
  Home: "/",
  "Color Database": "/color-database",
  "Shade Mapping": "/shade-mapping",
  "My Mappings": "/my-mappings",
  "Color Bank": "/color-bank",
  Report: "/report",
  "Data Input": "/data-input",
  "User Management": "/user-management",
} as const satisfies Record<AppSection, string>;
/** Sections hidden from users without the permission; keep in sync with route guards. */
export const sectionPermissions: Partial<Record<AppSection, Permission>> = {
  "Data Input": "catalog:write",
  "User Management": "user:manage",
};
