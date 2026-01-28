import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const userRole = ac.newRole({
  user: [],
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
});

export const roleObjects = {
  [ROLES.USER]: userRole,
  [ROLES.ADMIN]: adminRole,
} as const;
