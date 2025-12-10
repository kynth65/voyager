import { Link } from "react-router-dom";
import {
  Ship,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  // Smooth scroll to section helper
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      // If section doesn't exist (e.g., on a different page), scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="py-16 md:py-20"
      style={{
        background: "#272343",
        color: "#ffffff",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#bae8e8" }}
              >
                <Ship className="w-6 h-6 text-[#272343]" />
              </div>
              <span className="text-2xl font-medium text-white">Voyager</span>
            </div>
            <p
              className="mb-8 leading-relaxed font-light"
              style={{ color: "#bae8e8", fontSize: "15px" }}
            >
              Your trusted partner for seamless ferry bookings across the
              Philippine islands.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(186, 232, 232, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#bae8e8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(186, 232, 232, 0.1)";
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#bae8e8" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-medium mb-6 text-lg">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  onClick={scrollToTop}
                  className="transition-colors font-light flex items-center gap-2 group"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/routes"
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Routes
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/#how-it-works"
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      scrollToSection("how-it-works");
                    }
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    FAQ
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-medium mb-6 text-lg">Support</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Help Center
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Booking Terms
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Privacy Policy
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Refund Policy
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition-colors font-light flex items-center gap-2 group text-left"
                  style={{
                    color: "#bae8e8",
                    fontSize: "15px",
                  }}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Contact Us
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h3 className="text-white font-medium mb-6 text-lg">
              Get In Touch
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@voyager.com"
                  className="flex items-center gap-3 transition-all font-light group hover:translate-x-1"
                  style={{ color: "#bae8e8", fontSize: "15px" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(186, 232, 232, 0.1)" }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>support@voyager.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 transition-all font-light group hover:translate-x-1"
                  style={{ color: "#bae8e8", fontSize: "15px" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(186, 232, 232, 0.1)" }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+1 (234) 567-890</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t"
          style={{ borderColor: "rgba(186, 232, 232, 0.1)" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-sm font-light text-center md:text-left"
              style={{ color: "#8a8494" }}
            >
              © 2024 Voyager Ferry Booking. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-light">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="transition-colors whitespace-nowrap hover:text-[#bae8e8]"
                style={{ color: "#8a8494" }}
              >
                Terms of Service
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="transition-colors whitespace-nowrap hover:text-[#bae8e8]"
                style={{ color: "#8a8494" }}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="transition-colors whitespace-nowrap hover:text-[#bae8e8]"
                style={{ color: "#8a8494" }}
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
