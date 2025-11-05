import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ship } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
  showAuthButtons?: boolean;
}

export default function Navbar({
  transparent = false,
  showAuthButtons = true,
}: NavbarProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine navbar styles based on scroll state and transparent prop
  const shouldBeTransparent = transparent && !isScrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldBeTransparent ? "bg-transparent py-6" : "bg-white py-4"
      }`}
    >
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div
              className={`p-2 rounded-xl transition-colors`}
              style={{
                background: shouldBeTransparent ? "#ffffff" : "#272343",
              }}
            >
              <Ship
                className={`w-6 h-6`}
                style={{
                  color: shouldBeTransparent ? "#272343" : "#ffffff",
                }}
              />
            </div>
            <span
              className={`text-2xl font-bold transition-colors`}
              style={{
                color: shouldBeTransparent ? "#ffffff" : "#272343",
              }}
            >
              Voyager
            </span>
          </div>
          {showAuthButtons && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200`}
                style={shouldBeTransparent ? { color: "#ffffff" } : {}}
                onMouseEnter={(e) => {
                  if (shouldBeTransparent) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.2)";
                  } else {
                    e.currentTarget.style.background = "#e3f6f5";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  background: "#272343",
                  boxShadow: "0 10px 15px -3px rgba(39, 35, 67, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1829";
                  e.currentTarget.style.boxShadow =
                    "0 20px 25px -5px rgba(39, 35, 67, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#272343";
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgba(39, 35, 67, 0.3)";
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
