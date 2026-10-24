import { Routes, Route } from "react-router-dom";

import { ROLES } from "@/lib/roles";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import RoleRedirect from "@/routes/RoleRedirect";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Public
import Home from "@/pages/public/Home";
import Lands from "@/pages/public/Lands";
import LandDetail from "@/pages/public/LandDetail";
import Vendors from "@/pages/public/Vendors";
import VendorProfile from "@/pages/public/VendorProfile";
import AreaConverter from "@/pages/public/AreaConverter";
import NotFound from "@/pages/public/NotFound";

// Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Every role
import Account from "@/pages/account/Account";

// User (member)
import UserDashboard from "@/pages/user/UserDashboard";

// Seller
import SellerOverview from "@/pages/seller/SellerOverview";
import SellerListings from "@/pages/seller/SellerListings";
import AddListing from "@/pages/seller/AddListing";
import SellerInquiries from "@/pages/seller/SellerInquiries";
import SellerDemands from "@/pages/seller/SellerDemands";
import SellerStore from "@/pages/seller/SellerStore";

// Buyer
import BuyerOverview from "@/pages/buyer/BuyerOverview";
import BuyerSaved from "@/pages/buyer/BuyerSaved";
import BuyerInquiries from "@/pages/buyer/BuyerInquiries";
import BuyerDemands from "@/pages/buyer/BuyerDemands";
import BuyerPurchases from "@/pages/buyer/BuyerPurchases";

// Admin
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminListings from "@/pages/admin/AdminListings";
import AdminUsers from "@/pages/admin/AdminUsers";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public site: Navbar + Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/lands" element={<Lands />} />
        <Route path="/lands/:id" element={<LandDetail />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorProfile />} />
        <Route path="/area-converter" element={<AreaConverter />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* /dashboard sends each person to the dashboard for their role */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Any logged-in role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Route>

      {/* User (member who has not chosen buying or selling yet) */}
      <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>
      </Route>

      {/* Buyer */}
      <Route element={<ProtectedRoute roles={[ROLES.BUYER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/buyer/dashboard" element={<BuyerOverview />} />
          <Route path="/buyer/saved" element={<BuyerSaved />} />
          <Route path="/buyer/inquiries" element={<BuyerInquiries />} />
          <Route path="/buyer/demands" element={<BuyerDemands />} />
          <Route path="/buyer/purchases" element={<BuyerPurchases />} />
        </Route>
      </Route>

      {/* Seller */}
      <Route element={<ProtectedRoute roles={[ROLES.SELLER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/seller/dashboard" element={<SellerOverview />} />
          <Route path="/seller/listings" element={<SellerListings />} />
          <Route path="/seller/listings/new" element={<AddListing />} />
          <Route path="/seller/inquiries" element={<SellerInquiries />} />
          <Route path="/seller/demands" element={<SellerDemands />} />
          <Route path="/seller/store" element={<SellerStore />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminOverview />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  );
}
