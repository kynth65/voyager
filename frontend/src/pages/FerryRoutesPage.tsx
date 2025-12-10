import { useEffect } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import RouteSearchSection from "../components/common/RouteSearchSection";

export default function FerryRoutesPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Sticky Navigation Bar */}
      <Navbar transparent={false} showAuthButtons={true} />

      {/* Route Search Section */}
      <RouteSearchSection />

      <Footer />
    </div>
  );
}
