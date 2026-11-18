export const roles = ["admin", "rnd", "pid", "tsi"] as const;
export type Role = (typeof roles)[number];

export const roleLabels = {
  admin: "Admin",
  rnd: "R&D",
  pid: "PID",
  tsi: "TSI",
} as const satisfies Record<Role, string>;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

// The API enforces it with `requirePermission()` and the web reads it with
// `useCan()` to hide UI. Change access by editing a role list; add a
const permissionRoles = {
  // Brands, product formats, products, shades and imports.
  "catalog:write": ["admin", "rnd"],

  // Field-level: shade composition is confidential formulation data.
  "shade:viewComposition": ["admin", "rnd", "tsi"],
  "report:create": ["admin", "rnd", "pid", "tsi"],
  "report:resolve": ["admin", "rnd"],
  "prototype:create": ["admin", "pid", "tsi"],

  // Approve, decline, formulate and complete prototype requests.
  "prototype:process": ["admin", "rnd"],
  "user:manage": ["admin"],

  // Cut-offs per category; saving re-classifies the category's shades.
  "classification:manage": ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof permissionRoles;

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (permissionRoles[permission] as readonly Role[]).includes(role);
}
