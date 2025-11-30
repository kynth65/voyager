import { useState } from "react";
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

  // Fetch all routes
  const { data, isLoading, error } = useQuery({
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
      route.vessel?.name.toLowerCase().includes(searchTerm.toLowerCase());

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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#e3f6f5" }}
      >
        <div className="text-center">
          <Ship
            className="w-16 h-16 animate-bounce mx-auto mb-4"
            style={{ color: "#272343" }}
          />
          <p className="text-lg" style={{ color: "#272343" }}>
            Loading your adventure...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#e3f6f5" }}
      >
        <div className="text-center text-red-600">
          <p>Error loading routes. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Bar */}
      <Navbar transparent={true} showAuthButtons={true} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-between overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/Cebu-island.jpg"
            alt="Cebu Island"
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 md:bg-gradient-to-r md:from-black/60 md:via-black/40 md:to-transparent"></div>
        </div>

        <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20 sm:py-24 md:py-32">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between min-h-[70vh] gap-8 md:gap-4">
            {/* Left content */}
            <div className="max-w-3xl text-white text-center md:text-left">
              {/* Main heading */}
              <h1
                className="mb-8 sm:mb-12 md:mb-16 animate-fade-in-up"
                style={{
                  fontFamily:
                    '"Fraunces", "Zodiak", "Zodiak Placeholder", serif',
                  fontSize: "clamp(2.5rem, 8vw, 5.9375rem)", // 40px to 95px responsive
                  fontWeight: 300,
                  letterSpacing: "-0.04em",
                  lineHeight: "1.2em",
                  textAlign: "inherit",
                }}
              >
                Your Gateway to
                <br />
                <span className="block">Unforgettable</span>
                <span className="block">Memories</span>
              </h1>

              <p
                className="text-sm sm:text-base max-w-lg mx-auto md:mx-0 animate-fade-in-up delay-200"
                style={{ color: "#e3f6f5" }}
              >
                Experience seamless accommodations, world-class amenities, and
                unforgettable moments on the beautiful islands of the
                Philippines.
              </p>
            </div>

            {/* Right content - Circular Button */}
            <div className="animate-fade-in-up delay-300">
              <button
                onClick={() => {
                  const searchSection =
                    document.getElementById("search-routes");
                  searchSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full font-medium text-base sm:text-lg transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
                style={{
                  background: "#bae8e8",
                  color: "#272343",
                  boxShadow: "0 25px 50px -12px rgba(186, 232, 232, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px -12px rgba(186, 232, 232, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px -12px rgba(186, 232, 232, 0.4)";
                }}
              >
                <span className="text-lg sm:text-xl">Book Your</span>
                <span className="text-lg sm:text-xl">Journey</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimalist Redesign */}
      <section className="py-16 sm:py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 sm:mb-6"
              style={{ color: "#272343", letterSpacing: "-0.02em" }}
            >
              Why Choose Voyager?
            </h2>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto font-light px-4"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Experience seamless ferry booking designed for modern travelers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
            {[
              {
                icon: Zap,
                title: "Instant Booking",
                description:
                  "Book your tickets in seconds with our streamlined process",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Protected with bank-level encryption",
              },
              {
                icon: Calendar,
                title: "Flexible Scheduling",
                description: "Multiple daily departures that fit your schedule",
              },
              {
                icon: CreditCard,
                title: "Easy Refunds",
                description: "Hassle-free cancellation and modification",
              },
              {
                icon: Heart,
                title: "Best Price Guarantee",
                description: "Most competitive rates on all ferry routes",
              },
              {
                icon: Award,
                title: "24/7 Support",
                description: "Dedicated team always ready to help",
              },
            ].map((feature, index) => (
              <div key={index} className="group">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: "#e3f6f5",
                  }}
                >
                  <feature.icon
                    className="w-5 h-5"
                    style={{ color: "#272343" }}
                  />
                </div>
                <h3
                  className="text-xl font-medium mb-3"
                  style={{ color: "#272343" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="leading-relaxed font-light"
                  style={{ color: "#272343", opacity: 0.6, fontSize: "15px" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Minimalist Redesign */}
      <section className="py-16 sm:py-24 md:py-32" style={{ background: "#e3f6f5" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-24">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 sm:mb-6"
              style={{ color: "#272343", letterSpacing: "-0.02em" }}
            >
              Book in 3 Simple Steps
            </h2>
            <p
              className="text-base sm:text-lg font-light px-4"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Getting on board has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-14 md:gap-16">
            {[
              {
                step: "01",
                title: "Search Routes",
                description:
                  "Browse available routes and select your preferred departure time",
                icon: Search,
              },
              {
                step: "02",
                title: "Enter Details",
                description:
                  "Fill in passenger information and choose your seats",
                icon: Users,
              },
              {
                step: "03",
                title: "Confirm & Go",
                description:
                  "Complete payment and receive your digital ticket instantly",
                icon: CheckCircle,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-8">
                  <span
                    className="text-7xl font-light"
                    style={{ color: "#272343", opacity: 0.1 }}
                  >
                    {step.step}
                  </span>
                </div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: "#272343",
                  }}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3
                  className="text-2xl font-medium mb-4"
                  style={{ color: "#272343" }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed font-light"
                  style={{ color: "#272343", opacity: 0.6, fontSize: "15px" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Routes Section - Minimalist Redesign */}
      <section id="search-routes" className="py-16 sm:py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Box */}
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 mb-12 sm:mb-16 md:mb-20"
            style={{
              borderWidth: "1px",
              borderColor: "#bae8e8",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
            }}
          >
            <div className="text-center mb-8 sm:mb-10">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4"
                style={{ color: "#272343", letterSpacing: "-0.02em" }}
              >
                Find Your Perfect Route
              </h2>
              <p
                className="text-sm sm:text-base font-light"
                style={{ color: "#272343", opacity: 0.6 }}
              >
                Search from {routes.length} available routes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "#272343", opacity: 0.3 }}
                />
                <input
                  type="text"
                  placeholder="Search routes or vessels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-xl transition-all font-light"
                  style={{
                    borderColor: "#bae8e8",
                    color: "#272343",
                    fontSize: "15px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#272343";
                    e.currentTarget.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#bae8e8";
                  }}
                />
              </div>

              {/* Origin Filter */}
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "#272343", opacity: 0.3 }}
                />
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-xl appearance-none transition-all font-light"
                  style={{
                    borderColor: "#bae8e8",
                    color: "#272343",
                    fontSize: "15px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#272343";
                    e.currentTarget.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#bae8e8";
                  }}
                >
                  <option value="">All Origins</option>
                  {origins.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Filter */}
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "#272343", opacity: 0.3 }}
                />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-xl appearance-none transition-all font-light"
                  style={{
                    borderColor: "#bae8e8",
                    color: "#272343",
                    fontSize: "15px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#272343";
                    e.currentTarget.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#bae8e8";
                  }}
                >
                  <option value="">All Destinations</option>
                  {destinations.map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedOrigin("");
                  setSelectedDestination("");
                }}
                className="px-6 py-3 rounded-xl transition-all font-light flex items-center justify-center gap-2"
                style={{
                  background: "#bae8e8",
                  color: "#272343",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#272343";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#bae8e8";
                  e.currentTarget.style.color = "#272343";
                }}
              >
                <Filter className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Routes Grid */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-light" style={{ color: "#272343" }}>
                Available Routes
                <span
                  className="ml-2 sm:ml-3 font-light text-xl sm:text-3xl"
                  style={{ color: "#272343", opacity: 0.4 }}
                >
                  ({filteredRoutes.length})
                </span>
              </h3>
              {filteredRoutes.length > 0 && (
                <div
                  className="flex items-center gap-2 text-xs sm:text-sm font-light"
                  style={{ color: "#272343", opacity: 0.5 }}
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Most popular</span>
                </div>
              )}
            </div>

            {filteredRoutes.length === 0 ? (
              <div
                className="text-center py-16 sm:py-20 md:py-24 bg-white rounded-2xl sm:rounded-3xl"
                style={{ borderWidth: "1px", borderColor: "#bae8e8" }}
              >
                <Ship
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4"
                  style={{ color: "#272343", opacity: 0.2 }}
                />
                <p
                  className="text-lg sm:text-xl font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  No routes found
                </p>
                <p
                  className="text-sm sm:text-base font-light px-4"
                  style={{ color: "#272343", opacity: 0.6 }}
                >
                  Try adjusting your search filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{
                      borderWidth: "1px",
                      borderColor: "#bae8e8",
                      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    }}
                  >
                    {/* Vessel Image */}
                    <div
                      className="relative h-48 overflow-hidden"
                      style={{
                        background: "#e3f6f5",
                      }}
                    >
                      {(route.vessel?.image || getVesselImage(route.vessel?.name)) ? (
                        <img
                          src={(route.vessel?.image || getVesselImage(route.vessel?.name)) || ''}
                          alt={route.vessel?.name || 'Ferry'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Ship
                            className="w-16 h-16"
                            style={{ color: "#272343", opacity: 0.2 }}
                          />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full">
                        <span
                          className="text-xl font-medium"
                          style={{ color: "#272343" }}
                        >
                          ${route.price}
                        </span>
                        <span
                          className="text-xs ml-1 font-light"
                          style={{ color: "#272343", opacity: 0.5 }}
                        >
                          / person
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="p-8">
                      {/* Vessel Name */}
                      <div className="flex items-center gap-2 mb-6">
                        <Ship
                          className="w-4 h-4"
                          style={{ color: "#272343", opacity: 0.4 }}
                        />
                        <h4
                          className="text-lg font-medium"
                          style={{ color: "#272343" }}
                        >
                          {route.vessel?.name || "Ferry"}
                        </h4>
                      </div>

                      {/* Route */}
                      <div
                        className="flex items-center gap-3 mb-6 pb-6"
                        style={{ borderBottom: "1px solid #bae8e8" }}
                      >
                        <MapPin
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "#272343", opacity: 0.4 }}
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span
                            className="font-light truncate"
                            style={{ color: "#272343" }}
                          >
                            {route.origin}
                          </span>
                          <ArrowRight
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: "#272343", opacity: 0.3 }}
                          />
                          <span
                            className="font-light truncate"
                            style={{ color: "#272343" }}
                          >
                            {route.destination}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-8">
                        {/* Duration */}
                        <div
                          className="flex items-center gap-3 font-light"
                          style={{
                            color: "#272343",
                            opacity: 0.6,
                            fontSize: "15px",
                          }}
                        >
                          <Clock className="w-4 h-4" style={{ opacity: 0.6 }} />
                          <span>{route.duration} minutes</span>
                        </div>

                        {/* Capacity */}
                        {route.vessel?.capacity && (
                          <div
                            className="flex items-center gap-3 font-light"
                            style={{
                              color: "#272343",
                              opacity: 0.6,
                              fontSize: "15px",
                            }}
                          >
                            <Users
                              className="w-4 h-4"
                              style={{ opacity: 0.6 }}
                            />
                            <span>
                              Up to {route.vessel.capacity} passengers
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => handleBookRoute(route)}
                        className="w-full py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
                        style={{
                          background: "#272343",
                          fontSize: "15px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#1a1829";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#272343";
                        }}
                      >
                        Book This Route
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section - Minimalist Redesign */}
      <section
        className="py-16 sm:py-24 md:py-32"
        style={{
          background: "#e3f6f5",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 sm:mb-6"
              style={{ color: "#272343", letterSpacing: "-0.02em" }}
            >
              Trusted by Thousands
            </h2>
            <p
              className="text-base sm:text-lg font-light px-4"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Join our growing community of satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20 md:mb-24">
            {[
              {
                quote:
                  "Voyager made booking ferry tickets so easy! The whole process took less than 5 minutes.",
                author: "Sarah Johnson",
                role: "Frequent Traveler",
              },
              {
                quote:
                  "Best ferry booking experience I've had. Real-time updates and instant confirmations.",
                author: "Michael Chen",
                role: "Business Traveler",
              },
              {
                quote:
                  "Customer support is amazing! They helped me reschedule my booking without any hassle.",
                author: "Emma Williams",
                role: "Tourist",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 transition-all duration-300"
                style={{
                  borderWidth: "1px",
                  borderColor: "#bae8e8",
                }}
              >
                <p
                  className="text-lg mb-8 leading-relaxed font-light"
                  style={{ color: "#272343", opacity: 0.8 }}
                >
                  "{testimonial.quote}"
                </p>
                <div>
                  <div
                    className="font-medium mb-1"
                    style={{ color: "#272343" }}
                  >
                    {testimonial.author}
                  </div>
                  <div
                    className="text-sm font-light"
                    style={{ color: "#272343", opacity: 0.5 }}
                  >
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center max-w-3xl mx-auto px-4">
            <h3
              className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 sm:mb-6"
              style={{ color: "#272343", letterSpacing: "-0.02em" }}
            >
              Ready to Start Your Journey?
            </h3>
            <p
              className="text-base sm:text-lg mb-8 sm:mb-10 font-light"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Join thousands of travelers who trust Voyager for their ferry
              bookings
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
                style={{
                  background: "#272343",
                  color: "#ffffff",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1829";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#272343";
                }}
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                style={{
                  background: "#bae8e8",
                  color: "#272343",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#272343";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#bae8e8";
                  e.currentTarget.style.color = "#272343";
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimalist Redesign */}
      <footer
        className="py-12 sm:py-16 md:py-20"
        style={{
          background: "#272343",
          color: "#ffffff",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Ship className="w-5 h-5" style={{ color: "#ffffff" }} />
                <span className="text-xl font-medium text-white">Voyager</span>
              </div>
              <p
                className="mb-8 leading-relaxed font-light"
                style={{ color: "#ffffff", opacity: 0.5, fontSize: "15px" }}
              >
                Your trusted partner for seamless ferry bookings and
                unforgettable journeys.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "#ffffff", opacity: 0.7 }}
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-medium mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {["About Us", "Our Fleet", "Routes", "Pricing", "FAQ"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="transition-opacity font-light"
                        style={{
                          color: "#ffffff",
                          opacity: 0.5,
                          fontSize: "15px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.5";
                        }}
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-medium mb-6">Support</h3>
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
                      className="transition-opacity font-light"
                      style={{
                        color: "#ffffff",
                        opacity: 0.5,
                        fontSize: "15px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.5";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-medium mb-6">Get In Touch</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:support@voyager.com"
                    className="flex items-center gap-3 transition-opacity font-light"
                    style={{ color: "#ffffff", opacity: 0.5, fontSize: "15px" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.5";
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>support@voyager.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-3 transition-opacity font-light"
                    style={{ color: "#ffffff", opacity: 0.5, fontSize: "15px" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.5";
                    }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>+1 (234) 567-890</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="pt-6 sm:pt-8"
            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p
                className="text-xs sm:text-sm font-light text-center md:text-left"
                style={{ color: "#ffffff", opacity: 0.4 }}
              >
                © 2024 Voyager Ferry Booking. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-light">
                {["Terms of Service", "Privacy Policy", "Cookie Policy"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="transition-opacity whitespace-nowrap"
                      style={{ color: "#ffffff", opacity: 0.4 }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.4";
                      }}
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        .delay-500 {
          animation-delay: 0.5s;
          animation-fill-mode: both;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
