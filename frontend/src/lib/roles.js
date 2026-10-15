import { PATHS } from "@/routes/paths";

// "user" is a registered member who has not picked buying or selling yet.
export const ROLES = {
  USER: "user",
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [ROLES.USER]: "Member",
  [ROLES.BUYER]: "Buyer",
  [ROLES.SELLER]: "Seller",
  [ROLES.ADMIN]: "Admin",
};

// Badge colours (see Badge.jsx)
export const ROLE_TONES = {
  [ROLES.USER]: "gray",
  [ROLES.BUYER]: "green",
  [ROLES.SELLER]: "gold",
  [ROLES.ADMIN]: "river",
};

const HOME = {
  [ROLES.USER]: PATHS.user.dashboard,
  [ROLES.BUYER]: PATHS.buyer.dashboard,
  [ROLES.SELLER]: PATHS.seller.dashboard,
  [ROLES.ADMIN]: PATHS.admin.dashboard,
};

// Unknown or missing roles fall back to the home page instead of looping.
export const dashboardPath = (role) => HOME[role] ?? PATHS.home;
