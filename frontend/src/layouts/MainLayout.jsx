import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
