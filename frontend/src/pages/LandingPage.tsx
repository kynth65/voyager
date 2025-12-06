import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Ship,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Calendar,
  Shield,
  CreditCard,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Heart,
  Award,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Star,
  Compass,
} from "lucide-react";
import { routeService } from "../services/route";
import type { Route } from "../types/route";
import Navbar from "../components/common/Navbar";
import { getVesselImage } from "../utils/vesselImages";

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");

  // Refs for drag scrolling
  const routesScrollRef = useRef<HTMLDivElement>(null);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);

  // Drag to scroll functionality
  const useDragScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!ref.current) return;
      setIsDragging(true);
      setStartX(e.pageX - ref.current.offsetLeft);
      setScrollLeft(ref.current.scrollLeft);
      ref.current.style.cursor = "grabbing";
      ref.current.style.userSelect = "none";
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 2; // Multiply for faster scroll
      ref.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (ref.current) {
        ref.current.style.cursor = "grab";
        ref.current.style.userSelect = "auto";
      }
    };

    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        if (ref.current) {
          ref.current.style.cursor = "grab";
          ref.current.style.userSelect = "auto";
        }
      }
    };

    return {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
    };
  };

  const routesDragHandlers = useDragScroll(routesScrollRef);
  const testimonialsDragHandlers = useDragScroll(testimonialsScrollRef);

  // Fetch all routes
  const { data } = useQuery({
    queryKey: ["routes", { status: "active" }],
    queryFn: () => routeService.getRoutes({ status: "active", per_page: 100 }),
  });

  const routes = data?.data || [];

  // Get unique origins and destinations for filters
  const origins = Array.from(new Set(routes.map((route) => route.origin)));
  const destinations = Array.from(
    new Set(routes.map((route) => route.destination))
  );

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      searchTerm === "" ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.vessel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesOrigin =
      selectedOrigin === "" || route.origin === selectedOrigin;
    const matchesDestination =
      selectedDestination === "" || route.destination === selectedDestination;

    return matchesSearch && matchesOrigin && matchesDestination;
  });

  const handleBookRoute = (route: Route) => {
    // Navigate directly to booking page - no login required
    navigate(`/booking/${route.id}`);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Sticky Navigation Bar */}
      <Navbar transparent={true} showAuthButtons={true} />

      {/* Hero Section - Unique Asymmetric Design with Diagonal Split */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Diagonal Background Split */}
        <div className="absolute inset-0">
          {/* Mobile: Simple full-width background */}
          <div className="lg:hidden absolute inset-0">
            <img
              src="/src/assets/Cebu-island.jpg"
              alt="Cebu Island"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#272343]/95 via-[#272343]/85 to-[#272343]/90"></div>
          </div>

          {/* Desktop: Diagonal split design */}
          <div className="hidden lg:block absolute inset-0">
            {/* Left side - Image with diagonal cut */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 65% 0, 55% 100%, 0 100%)",
              }}
            >
              <img
                src="/src/assets/Cebu-island.jpg"
                alt="Cebu Island"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#272343]/90 via-[#272343]/70 to-transparent"></div>
            </div>

            {/* Right side - Solid color */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(65% 0, 100% 0, 100% 100%, 55% 100%)",
                background: "linear-gradient(135deg, #e3f6f5 0%, #bae8e8 100%)",
              }}
            ></div>
          </div>
        </div>

        <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20 sm:py-24 md:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left content - Text */}
              <div className="text-white z-10">
                {/* Eyebrow text */}
                <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                  <div className="h-[1px] w-12 bg-[#bae8e8]"></div>
                  <span className="text-[#bae8e8] uppercase tracking-widest text-xs font-medium">
                    Philippine Ferry Booking
                  </span>
                </div>

                {/* Main heading with unique typography */}
                <h1 className="mb-8 animate-fade-in-up delay-200">
                  <span
                    className="block text-white mb-2"
                    style={{
                      fontFamily: '"Fraunces", "Zodiak", serif',
                      fontSize: "clamp(2.5rem, 7vw, 6rem)",
                      fontWeight: 300,
                      letterSpacing: "-0.04em",
                      lineHeight: "0.95",
                    }}
                  >
                    Journey
                  </span>
                  <span
                    className="block mb-3"
                    style={{
                      fontFamily: '"Fraunces", "Zodiak", serif',
                      fontSize: "clamp(2.5rem, 7vw, 6rem)",
                      fontWeight: 300,
                      letterSpacing: "-0.04em",
                      lineHeight: "0.95",
                      background:
                        "linear-gradient(135deg, #bae8e8 0%, #e3f6f5 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Beyond
                  </span>
                  <span
                    className="block text-white"
                    style={{
                      fontFamily: '"Fraunces", "Zodiak", serif',
                      fontSize: "clamp(2rem, 5vw, 4rem)",
                      fontWeight: 300,
                      letterSpacing: "-0.03em",
                      lineHeight: "1.1",
                    }}
                  >
                    The Horizon
                  </span>
                </h1>

                <p
                  className="text-sm sm:text-base max-w-md mb-10 leading-relaxed animate-fade-in-up delay-300"
                  style={{ color: "#e3f6f5" }}
                >
                  Discover the Philippines island by island. Book premium ferry
                  routes with instant confirmation and seamless boarding
                  experience.
                </p>

                {/* Unique CTA - Pill with expanding hover */}
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-400">
                  <button
                    onClick={() => {
                      const searchSection =
                        document.getElementById("search-routes");
                      searchSection?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group relative overflow-hidden px-8 py-4 rounded-full font-medium text-base transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                    style={{
                      background: "#bae8e8",
                      color: "#272343",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Explore Routes
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    {/* Hover effect background */}
                    <div
                      className="absolute inset-0 bg-[#272343] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
                      style={{ zIndex: 0 }}
                    ></div>
                    <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore Routes
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 rounded-full font-medium text-base border-2 transition-all duration-300 hover:bg-white/10"
                    style={{
                      borderColor: "#bae8e8",
                      color: "#bae8e8",
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Right content - Floating Info Cards */}
              <div className="relative hidden lg:block h-[500px] animate-fade-in delay-500">
                {/* Floating card 1 - Top right */}
                <div
                  className="absolute top-0 right-0 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl animate-float"
                  style={{
                    width: "280px",
                    transform: "rotate(-3deg)",
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "#e3f6f5" }}
                    >
                      <Ship className="w-7 h-7 text-[#272343]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#272343]">
                        50+
                      </div>
                      <div className="text-sm text-[#5d576b]">
                        Active Routes
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#bae8e8]" />
                    <span className="text-xs text-[#5d576b]">
                      98% On-time departures
                    </span>
                  </div>
                </div>

                {/* Floating card 2 - Center */}
                <div
                  className="absolute top-32 right-16 bg-[#272343] rounded-3xl p-6 shadow-2xl animate-float-delayed"
                  style={{
                    width: "260px",
                    transform: "rotate(2deg)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="w-5 h-5 text-[#bae8e8] fill-[#bae8e8]" />
                    <Star className="w-5 h-5 text-[#bae8e8] fill-[#bae8e8]" />
                    <Star className="w-5 h-5 text-[#bae8e8] fill-[#bae8e8]" />
                    <Star className="w-5 h-5 text-[#bae8e8] fill-[#bae8e8]" />
                    <Star className="w-5 h-5 text-[#bae8e8] fill-[#bae8e8]" />
                  </div>
                  <p className="text-white text-sm mb-3 leading-relaxed">
                    "Best ferry booking experience! Smooth, fast, and reliable."
                  </p>
                  <div className="text-[#bae8e8] text-xs font-medium">
                    Sarah Chen, Manila
                  </div>
                </div>

                {/* Floating card 3 - Bottom */}
                <div
                  className="absolute bottom-0 right-8 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl animate-float"
                  style={{
                    width: "300px",
                    transform: "rotate(-2deg)",
                  }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: Shield, label: "Secure", color: "#272343" },
                      { icon: Zap, label: "Instant", color: "#272343" },
                      { icon: Heart, label: "Trusted", color: "#272343" },
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2"
                          style={{ background: "#e3f6f5" }}
                        >
                          <item.icon
                            className="w-5 h-5"
                            style={{ color: item.color }}
                          />
                        </div>
                        <div className="text-xs text-[#5d576b] font-medium">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[#bae8e8] flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#bae8e8] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section - Unique Bento Grid Layout */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e3f6f5] mb-4">
              <Zap className="w-4 h-4 text-[#272343]" />
              <span className="text-[#272343] text-sm font-medium uppercase tracking-wider">
                Why Choose Us
              </span>
            </div>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-light mb-6"
              style={{
                color: "#272343",
                letterSpacing: "-0.03em",
                fontFamily: '"Fraunces", serif',
              }}
            >
              Designed for{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #272343 0%, #5d576b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Travelers
              </span>
            </h2>
          </div>

          {/* Bento Grid - Asymmetric Layout */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
            {/* Large feature card - spans 4 columns */}
            <div
              className="md:col-span-4 bg-gradient-to-br from-[#272343] to-[#3d3851] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group"
              style={{ minHeight: "400px" }}
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <Ship className="w-full h-full transform rotate-12 group-hover:rotate-[18deg] transition-transform duration-700" />
              </div>
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(186, 232, 232, 0.2)" }}
                >
                  <Zap className="w-8 h-8 text-[#bae8e8]" />
                </div>
                <h3 className="text-3xl md:text-4xl font-light mb-4">
                  Lightning Fast Booking
                </h3>
                <p className="text-[#bae8e8] text-lg leading-relaxed max-w-md">
                  Complete your ferry reservation in under 60 seconds. Our
                  streamlined process eliminates unnecessary steps and gets you
                  on board faster.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="px-4 py-2 rounded-full bg-white/10 text-sm">
                    ⚡ Instant confirmation
                  </div>
                  <div className="px-4 py-2 rounded-full bg-white/10 text-sm">
                    📱 Mobile tickets
                  </div>
                  <div className="px-4 py-2 rounded-full bg-white/10 text-sm">
                    🎫 QR boarding
                  </div>
                </div>
              </div>
            </div>

            {/* Two stacked cards - spans 2 columns */}
            <div className="md:col-span-2 flex flex-col gap-4 md:gap-6">
              {/* Security card */}
              <div className="bg-[#e3f6f5] rounded-3xl p-8 flex-1 group hover:bg-[#bae8e8] transition-all duration-500">
                <Shield className="w-12 h-12 text-[#272343] mb-4 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-medium text-[#272343] mb-2">
                  Bank-Level Security
                </h3>
                <p className="text-[#5d576b] leading-relaxed">
                  Your payment data is encrypted and protected with
                  industry-leading security.
                </p>
              </div>

              {/* Support card */}
              <div className="bg-[#bae8e8] rounded-3xl p-8 flex-1 group hover:bg-[#272343] transition-all duration-500">
                <Heart className="w-12 h-12 text-[#272343] group-hover:text-[#bae8e8] mb-4 transition-colors duration-500" />
                <h3 className="text-2xl font-medium text-[#272343] group-hover:text-white mb-2 transition-colors duration-500">
                  24/7 Support
                </h3>
                <p className="text-[#5d576b] group-hover:text-[#e3f6f5] leading-relaxed transition-colors duration-500">
                  Our dedicated team is always ready to assist you anytime.
                </p>
              </div>
            </div>

            {/* Three equal cards */}
            <div className="md:col-span-2 bg-white border-2 border-[#e3f6f5] rounded-3xl p-8 hover:border-[#bae8e8] transition-all duration-300 hover:shadow-xl group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: "#e3f6f5" }}
              >
                <Calendar className="w-7 h-7 text-[#272343]" />
              </div>
              <h3 className="text-xl font-medium text-[#272343] mb-2">
                Flexible Schedules
              </h3>
              <p className="text-[#5d576b] leading-relaxed">
                Multiple daily departures that fit your travel plans perfectly.
              </p>
            </div>

            <div className="md:col-span-2 bg-white border-2 border-[#e3f6f5] rounded-3xl p-8 hover:border-[#bae8e8] transition-all duration-300 hover:shadow-xl group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: "#e3f6f5" }}
              >
                <CreditCard className="w-7 h-7 text-[#272343]" />
              </div>
              <h3 className="text-xl font-medium text-[#272343] mb-2">
                Easy Refunds
              </h3>
              <p className="text-[#5d576b] leading-relaxed">
                Hassle-free cancellation and modification process for peace of
                mind.
              </p>
            </div>

            <div className="md:col-span-2 bg-white border-2 border-[#e3f6f5] rounded-3xl p-8 hover:border-[#bae8e8] transition-all duration-300 hover:shadow-xl group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: "#e3f6f5" }}
              >
                <Award className="w-7 h-7 text-[#272343]" />
              </div>
              <h3 className="text-xl font-medium text-[#272343] mb-2">
                Best Prices
              </h3>
              <p className="text-[#5d576b] leading-relaxed">
                Competitive rates guaranteed on all ferry routes across
                Philippines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Unique Horizontal Scroll Cards */}
      <section
        className="py-24 md:py-32 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #e3f6f5 0%, #bae8e8 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-light mb-6"
              style={{
                color: "#272343",
                letterSpacing: "-0.03em",
                fontFamily: '"Fraunces", serif',
              }}
            >
              Book in{" "}
              <span className="relative inline-block">
                <span className="relative z-10">3 Steps</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 200 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10 Q50 0, 100 8 T200 6"
                    stroke="#272343"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          {/* Connected step cards */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              {[
                {
                  step: "01",
                  title: "Find Your Route",
                  description:
                    "Search from 50+ active routes across Philippine islands. Filter by origin, destination, and departure time.",
                  icon: Search,
                  color: "#272343",
                  bgColor: "#ffffff",
                },
                {
                  step: "02",
                  title: "Passenger Info",
                  description:
                    "Enter traveler details and select seats. Our smart form remembers your preferences for faster checkout.",
                  icon: Users,
                  color: "#ffffff",
                  bgColor: "#272343",
                },
                {
                  step: "03",
                  title: "Instant Ticket",
                  description:
                    "Complete secure payment and receive your digital boarding pass immediately via email.",
                  icon: CheckCircle,
                  color: "#272343",
                  bgColor: "#bae8e8",
                },
              ].map((step, index) => (
                <div key={index} className="relative group">
                  {/* Step number circle */}
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-20 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background:
                        step.bgColor === "#272343" ? "#bae8e8" : "#272343",
                    }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color:
                          step.bgColor === "#272343" ? "#272343" : "#ffffff",
                      }}
                    >
                      {step.step}
                    </span>
                  </div>

                  {/* Card */}
                  <div
                    className="pt-16 pb-8 px-8 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2"
                    style={{
                      background: step.bgColor,
                      minHeight: "320px",
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background:
                          step.bgColor === "#272343"
                            ? "rgba(186, 232, 232, 0.2)"
                            : "#e3f6f5",
                      }}
                    >
                      <step.icon
                        className="w-8 h-8"
                        style={{ color: step.color }}
                      />
                    </div>
                    <h3
                      className="text-2xl font-medium mb-4 text-center"
                      style={{ color: step.color }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="leading-relaxed text-center"
                      style={{
                        color:
                          step.bgColor === "#272343" ? "#bae8e8" : "#5d576b",
                        fontSize: "15px",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector (desktop only) */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-10 lg:-right-10 z-30">
                      <ArrowRight className="w-8 h-8 lg:w-10 lg:h-10 text-[#272343]/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Routes Section - Creative Card Design */}
      <section id="search-routes" className="py-24 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Box - Floating Design */}
          <div className="relative mb-20">
            {/* Decorative background blob */}
            <div
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30 blur-3xl"
              style={{ background: "#e3f6f5" }}
            ></div>
            <div
              className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-30 blur-3xl"
              style={{ background: "#bae8e8" }}
            ></div>

            <div
              className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl"
              style={{
                border: "2px solid #e3f6f5",
              }}
            >
              <div className="text-center mb-10">
                <h2
                  className="text-4xl sm:text-5xl font-light mb-4"
                  style={{
                    color: "#272343",
                    letterSpacing: "-0.02em",
                    fontFamily: '"Fraunces", serif',
                  }}
                >
                  Discover Your Route
                </h2>
                <p
                  className="text-base font-light flex items-center justify-center gap-2"
                  style={{ color: "#5d576b" }}
                >
                  <Compass className="w-5 h-5" />
                  {routes.length} routes ready to explore
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative group">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-[#272343] transition-colors"
                    style={{ color: "#5d576b" }}
                  />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all font-light focus:border-[#272343] focus:outline-none focus:shadow-lg"
                    style={{
                      borderColor: "#e3f6f5",
                      color: "#272343",
                      fontSize: "15px",
                    }}
                  />
                </div>

                {/* Origin Filter */}
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-[#272343] transition-colors"
                    style={{ color: "#5d576b" }}
                  />
                  <select
                    value={selectedOrigin}
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl appearance-none transition-all font-light focus:border-[#272343] focus:outline-none focus:shadow-lg"
                    style={{
                      borderColor: "#e3f6f5",
                      color: "#272343",
                      fontSize: "15px",
                    }}
                  >
                    <option value="">From anywhere</option>
                    {origins.map((origin) => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Filter */}
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-[#272343] transition-colors"
                    style={{ color: "#5d576b" }}
                  />
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl appearance-none transition-all font-light focus:border-[#272343] focus:outline-none focus:shadow-lg"
                    style={{
                      borderColor: "#e3f6f5",
                      color: "#272343",
                      fontSize: "15px",
                    }}
                  >
                    <option value="">To anywhere</option>
                    {destinations.map((destination) => (
                      <option key={destination} value={destination}>
                        {destination}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters - Unique Design */}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedOrigin("");
                    setSelectedDestination("");
                  }}
                  className="group px-6 py-4 rounded-2xl transition-all font-medium flex items-center justify-center gap-2 hover:shadow-lg relative overflow-hidden"
                  style={{
                    background: "#272343",
                    color: "#ffffff",
                    fontSize: "15px",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Reset
                  </span>
                  <div className="absolute inset-0 bg-[#bae8e8] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-[#272343] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Filter className="w-5 h-5" />
                    Reset
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Routes Grid - Unique Card Design */}
          <div>
            <div className="flex items-center justify-between mb-12">
              <h3
                className="text-3xl sm:text-4xl font-light flex items-baseline gap-3"
                style={{ color: "#272343" }}
              >
                Available Routes
                <span
                  className="text-2xl font-light px-4 py-1 rounded-full"
                  style={{
                    color: "#272343",
                    background: "#e3f6f5",
                  }}
                >
                  {filteredRoutes.length}
                </span>
              </h3>
              {filteredRoutes.length > 0 && (
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light"
                  style={{
                    color: "#5d576b",
                    background: "#e3f6f5",
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Popular routes</span>
                </div>
              )}
            </div>

            {filteredRoutes.length === 0 ? (
              <div
                className="text-center py-24 bg-[#e3f6f5]/30 rounded-3xl border-2 border-dashed"
                style={{ borderColor: "#bae8e8" }}
              >
                <Ship
                  className="w-20 h-20 mx-auto mb-6"
                  style={{ color: "#272343", opacity: 0.2 }}
                />
                <p
                  className="text-2xl font-medium mb-3"
                  style={{ color: "#272343" }}
                >
                  No routes found
                </p>
                <p
                  className="text-base font-light px-4"
                  style={{ color: "#5d576b" }}
                >
                  Try adjusting your search filters or browse all routes
                </p>
              </div>
            ) : (
              <>
                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredRoutes.map((route, index) => (
                    <div
                      key={route.id}
                      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                      style={{
                        border: "2px solid #e3f6f5",
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      {/* Vessel Image with overlay gradient */}
                      <div className="relative h-56 overflow-hidden">
                        {route.vessel?.image ||
                        getVesselImage(route.vessel?.name) ? (
                          <img
                            src={
                              route.vessel?.image ||
                              getVesselImage(route.vessel?.name) ||
                              ""
                            }
                            alt={route.vessel?.name || "Ferry"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center h-full"
                            style={{ background: "#e3f6f5" }}
                          >
                            <Ship
                              className="w-20 h-20"
                              style={{ color: "#272343", opacity: 0.2 }}
                            />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Price tag - unique position */}
                        <div
                          className="absolute top-4 right-4 px-5 py-3 rounded-2xl backdrop-blur-md shadow-lg"
                          style={{ background: "rgba(255, 255, 255, 0.95)" }}
                        >
                          <div className="text-2xl font-bold text-[#272343]">
                            ${route.price}
                          </div>
                          <div className="text-xs text-[#5d576b] font-medium">
                            per person
                          </div>
                        </div>

                        {/* Vessel name at bottom of image */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
                            style={{ background: "rgba(186, 232, 232, 0.9)" }}
                          >
                            <Ship className="w-5 h-5 text-[#272343]" />
                          </div>
                          <span className="text-white font-medium text-lg">
                            {route.vessel?.name || "Ferry"}
                          </span>
                        </div>
                      </div>

                      {/* Route Details */}
                      <div className="p-6">
                        {/* Route Path - Creative Design */}
                        <div className="mb-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="text-xs text-[#5d576b] mb-1 uppercase tracking-wide font-medium">
                                From
                              </div>
                              <div className="text-lg font-medium text-[#272343] truncate">
                                {route.origin}
                              </div>
                            </div>

                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:rotate-90 transition-transform duration-500"
                              style={{ background: "#e3f6f5" }}
                            >
                              <ArrowRight className="w-5 h-5 text-[#272343]" />
                            </div>

                            <div className="flex-1 text-right">
                              <div className="text-xs text-[#5d576b] mb-1 uppercase tracking-wide font-medium">
                                To
                              </div>
                              <div className="text-lg font-medium text-[#272343] truncate">
                                {route.destination}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          <div
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                            style={{ background: "#e3f6f5", color: "#272343" }}
                          >
                            <Clock className="w-4 h-4" />
                            <span>{route.duration} min</span>
                          </div>
                          {route.vessel?.capacity && (
                            <div
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                              style={{
                                background: "#e3f6f5",
                                color: "#272343",
                              }}
                            >
                              <Users className="w-4 h-4" />
                              <span>{route.vessel.capacity} seats</span>
                            </div>
                          )}
                        </div>

                        {/* Book Button - Unique Design */}
                        <button
                          onClick={() => handleBookRoute(route)}
                          className="group/btn relative w-full py-4 text-white rounded-2xl font-medium transition-all duration-300 overflow-hidden"
                          style={{
                            background: "#272343",
                            fontSize: "15px",
                          }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Book This Route
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                          {/* Animated background */}
                          <div className="absolute inset-0 bg-[#bae8e8] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></div>
                          <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-[#272343] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                            Book This Route
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile: Horizontal Scroll */}
                <div className="md:hidden relative">
                  <div
                    ref={routesScrollRef}
                    className="overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar"
                    style={{ cursor: "grab" }}
                    onMouseDown={routesDragHandlers.handleMouseDown}
                    onMouseMove={routesDragHandlers.handleMouseMove}
                    onMouseUp={routesDragHandlers.handleMouseUp}
                    onMouseLeave={routesDragHandlers.handleMouseLeave}
                  >
                    <div
                      className="flex gap-6"
                      style={{ width: "max-content" }}
                    >
                      {filteredRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="snap-center relative bg-white rounded-3xl overflow-hidden shadow-lg flex-shrink-0"
                          style={{
                            border: "2px solid #e3f6f5",
                            width: "320px",
                          }}
                        >
                          {/* Vessel Image with overlay gradient */}
                          <div className="relative h-56 overflow-hidden">
                            {route.vessel?.image ||
                            getVesselImage(route.vessel?.name) ? (
                              <img
                                src={
                                  route.vessel?.image ||
                                  getVesselImage(route.vessel?.name) ||
                                  ""
                                }
                                alt={route.vessel?.name || "Ferry"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div
                                className="flex items-center justify-center h-full"
                                style={{ background: "#e3f6f5" }}
                              >
                                <Ship
                                  className="w-20 h-20"
                                  style={{ color: "#272343", opacity: 0.2 }}
                                />
                              </div>
                            )}
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                            {/* Price tag - unique position */}
                            <div
                              className="absolute top-4 right-4 px-5 py-3 rounded-2xl backdrop-blur-md shadow-lg"
                              style={{
                                background: "rgba(255, 255, 255, 0.95)",
                              }}
                            >
                              <div className="text-2xl font-bold text-[#272343]">
                                ${route.price}
                              </div>
                              <div className="text-xs text-[#5d576b] font-medium">
                                per person
                              </div>
                            </div>

                            {/* Vessel name at bottom of image */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
                                style={{
                                  background: "rgba(186, 232, 232, 0.9)",
                                }}
                              >
                                <Ship className="w-5 h-5 text-[#272343]" />
                              </div>
                              <span className="text-white font-medium text-lg">
                                {route.vessel?.name || "Ferry"}
                              </span>
                            </div>
                          </div>

                          {/* Route Details */}
                          <div className="p-6">
                            {/* Route Path - Creative Design */}
                            <div className="mb-6">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="text-xs text-[#5d576b] mb-1 uppercase tracking-wide font-medium">
                                    From
                                  </div>
                                  <div className="text-lg font-medium text-[#272343] truncate">
                                    {route.origin}
                                  </div>
                                </div>

                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:rotate-90 transition-transform duration-500"
                                  style={{ background: "#e3f6f5" }}
                                >
                                  <ArrowRight className="w-5 h-5 text-[#272343]" />
                                </div>

                                <div className="flex-1 text-right">
                                  <div className="text-xs text-[#5d576b] mb-1 uppercase tracking-wide font-medium">
                                    To
                                  </div>
                                  <div className="text-lg font-medium text-[#272343] truncate">
                                    {route.destination}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Info pills */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              <div
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                                style={{
                                  background: "#e3f6f5",
                                  color: "#272343",
                                }}
                              >
                                <Clock className="w-4 h-4" />
                                <span>{route.duration} min</span>
                              </div>
                              {route.vessel?.capacity && (
                                <div
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                                  style={{
                                    background: "#e3f6f5",
                                    color: "#272343",
                                  }}
                                >
                                  <Users className="w-4 h-4" />
                                  <span>{route.vessel.capacity} seats</span>
                                </div>
                              )}
                            </div>

                            {/* Book Button - Unique Design */}
                            <button
                              onClick={() => handleBookRoute(route)}
                              className="group/btn relative w-full py-4 text-white rounded-2xl font-medium transition-all duration-300 overflow-hidden"
                              style={{
                                background: "#272343",
                                fontSize: "15px",
                              }}
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Book This Route
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </span>
                              {/* Animated background */}
                              <div className="absolute inset-0 bg-[#bae8e8] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></div>
                              <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-[#272343] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                                Book This Route
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scroll Indicator for Mobile */}
                  <div className="text-center mt-4">
                    <p
                      className="text-sm font-light"
                      style={{ color: "#5d576b" }}
                    >
                      ← Swipe or drag to explore more routes →
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials - Unique Marquee Style */}
      <section
        className="py-24 md:py-32 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #e3f6f5 0%, #ffffff 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white mb-4">
              <Heart className="w-4 h-4 text-[#272343]" />
              <span className="text-[#272343] text-sm font-medium uppercase tracking-wider">
                Customer Stories
              </span>
            </div>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-light mb-6"
              style={{
                color: "#272343",
                letterSpacing: "-0.03em",
                fontFamily: '"Fraunces", serif',
              }}
            >
              Loved by Travelers
            </h2>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="max-w-7xl mx-auto mb-20">
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
            {[
              {
                quote:
                  "Voyager completely transformed how I book ferry tickets. The instant confirmation and mobile boarding pass made my island hopping stress-free!",
                author: "Sarah Johnson",
                role: "Travel Blogger",
                rating: 5,
              },
              {
                quote:
                  "As a business traveler, I need reliability. Voyager delivers every time with on-time departures and seamless booking experience.",
                author: "Michael Chen",
                role: "Consultant",
                rating: 5,
              },
              {
                quote:
                  "The customer support team went above and beyond to help me reschedule my booking. Truly exceptional service that I recommend to everyone!",
                author: "Emma Williams",
                role: "Tourist",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Decorative quote mark */}
                <div
                  className="absolute -top-4 -right-4 text-9xl font-serif opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ color: "#272343" }}
                >
                  "
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#272343] text-[#272343]"
                    />
                  ))}
                </div>

                <p
                  className="text-lg mb-6 leading-relaxed font-light relative z-10"
                  style={{ color: "#3d3851" }}
                >
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: "#272343" }}
                  >
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: "#272343" }}>
                      {testimonial.author}
                    </div>
                    <div
                      className="text-sm font-light"
                      style={{ color: "#5d576b" }}
                    >
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div
              ref={testimonialsScrollRef}
              className="overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar"
              style={{ cursor: "grab" }}
              onMouseDown={testimonialsDragHandlers.handleMouseDown}
              onMouseMove={testimonialsDragHandlers.handleMouseMove}
              onMouseUp={testimonialsDragHandlers.handleMouseUp}
              onMouseLeave={testimonialsDragHandlers.handleMouseLeave}
            >
              <div className="flex gap-6" style={{ width: "max-content" }}>
                {[
                  {
                    quote:
                      "Voyager completely transformed how I book ferry tickets. The instant confirmation and mobile boarding pass made my island hopping stress-free!",
                    author: "Sarah Johnson",
                    role: "Travel Blogger",
                    rating: 5,
                  },
                  {
                    quote:
                      "As a business traveler, I need reliability. Voyager delivers every time with on-time departures and seamless booking experience.",
                    author: "Michael Chen",
                    role: "Consultant",
                    rating: 5,
                  },
                  {
                    quote:
                      "The customer support team went above and beyond to help me reschedule my booking. Truly exceptional service that I recommend to everyone!",
                    author: "Emma Williams",
                    role: "Tourist",
                    rating: 5,
                  },
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="snap-center bg-white rounded-3xl p-8 shadow-lg relative overflow-hidden flex-shrink-0"
                    style={{ width: "320px" }}
                  >
                    {/* Decorative quote mark */}
                    <div
                      className="absolute -top-4 -right-4 text-9xl font-serif opacity-5"
                      style={{ color: "#272343" }}
                    >
                      "
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-[#272343] text-[#272343]"
                        />
                      ))}
                    </div>

                    <p
                      className="text-base mb-6 leading-relaxed font-light relative z-10"
                      style={{ color: "#3d3851" }}
                    >
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                        style={{ background: "#272343" }}
                      >
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#272343" }}
                        >
                          {testimonial.author}
                        </div>
                        <div
                          className="text-sm font-light"
                          style={{ color: "#5d576b" }}
                        >
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Indicator for Mobile */}
            <div className="text-center mt-4 px-4">
              <p className="text-sm font-light" style={{ color: "#5d576b" }}>
                ← Swipe or drag to read more testimonials →
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - Unique Split Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #272343 0%, #3d3851 100%)",
            }}
          >
            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              <h3
                className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-white"
                style={{
                  letterSpacing: "-0.02em",
                  fontFamily: '"Fraunces", serif',
                }}
              >
                Ready for Your Next Adventure?
              </h3>
              <p
                className="text-lg mb-10 max-w-2xl mx-auto"
                style={{ color: "#bae8e8" }}
              >
                Join thousands of travelers who trust Voyager for seamless ferry
                bookings across the Philippines
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="group relative w-full sm:w-auto px-10 py-5 bg-white rounded-2xl font-medium transition-all duration-300 overflow-hidden hover:shadow-xl"
                  style={{
                    color: "#272343",
                    fontSize: "16px",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="group w-full sm:w-auto px-10 py-5 rounded-2xl font-medium transition-all duration-300 border-2 hover:bg-white/10"
                  style={{
                    borderColor: "#bae8e8",
                    color: "#bae8e8",
                    fontSize: "16px",
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Modern Minimalist */}
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
                {["About Us", "Our Fleet", "Routes", "Pricing", "FAQ"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="transition-colors font-light flex items-center gap-2 group"
                        style={{
                          color: "#bae8e8",
                          fontSize: "15px",
                        }}
                      >
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link}
                        </span>
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-medium mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                {[
                  "Help Center",
                  "Booking Terms",
                  "Privacy Policy",
                  "Refund Policy",
                  "Contact Us",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors font-light flex items-center gap-2 group"
                      style={{
                        color: "#bae8e8",
                        fontSize: "15px",
                      }}
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
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
                {["Terms of Service", "Privacy Policy", "Cookie Policy"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="transition-colors whitespace-nowrap hover:text-[#bae8e8]"
                      style={{ color: "#8a8494" }}
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        .delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .delay-500 {
          animation-delay: 0.5s;
          animation-fill-mode: both;
        }

        /* Hide scrollbar for horizontal scroll sections */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Smooth scroll snap */
        .snap-x {
          scroll-snap-type: x mandatory;
        }

        .snap-center {
          scroll-snap-align: center;
        }

        .snap-start {
          scroll-snap-align: start;
        }

        /* Mobile responsive improvements */
        @media (max-width: 768px) {
          .overflow-x-auto {
            overflow-x: scroll;
            overflow-y: hidden;
          }
        }
      `}</style>
    </div>
  );
}
