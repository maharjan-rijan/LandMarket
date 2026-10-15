import { ROLES } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import {
  BookmarkIcon,
  DemandIcon,
  GridIcon,
  InboxIcon,
  ListingsIcon,
  PeopleIcon,
  ShieldIcon,
  StoreIcon,
  UserIcon,
} from "@/hooks/icons";

// One sidebar per role. Add a page to a role by adding a line here and a route in routes/index.jsx.
const account = { to: PATHS.account, label: "My account", icon: UserIcon };

export const DASHBOARD_NAV = {
  [ROLES.USER]: [
    {
      to: PATHS.user.dashboard,
      label: "Get started",
      icon: GridIcon,
      end: true,
    },
    account,
  ],
  [ROLES.BUYER]: [
    { to: PATHS.buyer.dashboard, label: "Overview", icon: GridIcon, end: true },
    { to: PATHS.buyer.saved, label: "Saved lands", icon: BookmarkIcon },
    { to: PATHS.buyer.inquiries, label: "My inquiries", icon: InboxIcon },
    { to: PATHS.buyer.demands, label: "My demands", icon: DemandIcon },
    { to: PATHS.buyer.purchases, label: "Purchases", icon: ShieldIcon },
    account,
  ],
  [ROLES.SELLER]: [
    {
      to: PATHS.seller.dashboard,
      label: "Overview",
      icon: GridIcon,
      end: true,
    },
    { to: PATHS.seller.listings, label: "My listings", icon: ListingsIcon },
    { to: PATHS.seller.inquiries, label: "Inquiries", icon: InboxIcon },
    { to: PATHS.seller.demands, label: "Buyer demands", icon: DemandIcon },
    { to: PATHS.seller.store, label: "Store profile", icon: StoreIcon },
    account,
  ],
  [ROLES.ADMIN]: [
    { to: PATHS.admin.dashboard, label: "Overview", icon: GridIcon, end: true },
    { to: PATHS.admin.listings, label: "Listings", icon: ListingsIcon },
    { to: PATHS.admin.users, label: "Users", icon: PeopleIcon },
    account,
  ],
};
