export const ROLES = {
  ADMIN: "admin",
  CASHIER: "kasir",
};

export const checkPermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
