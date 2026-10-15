// Single source of truth for every URL in the app.
export const PATHS = {
  home: "/",
  lands: "/lands",
  land: (id) => `/lands/${id}`,
  vendors: "/vendors",
  vendor: (id) => `/vendors/${id}`,
  converter: "/area-converter",
  login: "/login",
  register: "/register",

  // Sends the visitor to the dashboard that matches their role
  dashboard: "/dashboard",
  // Profile and password: every role has it
  account: "/account",

  user: {
    dashboard: "/user/dashboard",
  },
  seller: {
    dashboard: "/seller/dashboard",
    listings: "/seller/listings",
    newListing: "/seller/listings/new",
    inquiries: "/seller/inquiries",
    demands: "/seller/demands",
    store: "/seller/store",
  },
  buyer: {
    dashboard: "/buyer/dashboard",
    saved: "/buyer/saved",
    inquiries: "/buyer/inquiries",
    demands: "/buyer/demands",
    purchases: "/buyer/purchases",
  },
  admin: {
    dashboard: "/admin/dashboard",
    listings: "/admin/listings",
    users: "/admin/users",
  },
};
