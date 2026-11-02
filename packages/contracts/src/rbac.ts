export const roles = ["website_admin", "rnd", "pid", "tsi"] as const;
export type Role = (typeof roles)[number];

export const roleLabels = {
  website_admin: "Website Admin",
  rnd: "R&D",
  pid: "PID",
  tsi: "TSI",
} as const satisfies Record<Role, string>;

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" && (roles as readonly string[]).includes(value)
  );
}

// The API enforces it with `requirePermission()` and the web reads it with
// `useCan()` to hide UI. Change access by editing a role list; add a
const permissionRoles = {
  // Brands, product formats, products, shades and imports.
  "catalog:write": ["website_admin", "rnd"],

  // Field-level: shade composition is confidential formulation data.
  "shade:viewComposition": ["website_admin", "rnd", "tsi"],
  "report:create": ["website_admin", "rnd", "pid", "tsi"],
  "report:resolve": ["website_admin", "rnd"],
  "prototype:create": ["website_admin", "pid", "tsi"],

  // Approve, decline, formulate and complete prototype requests.
  "prototype:process": ["website_admin", "rnd"],
  "user:manage": ["website_admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof permissionRoles;

export function can(
  role: Role | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return (permissionRoles[permission] as readonly Role[]).includes(role);
}
