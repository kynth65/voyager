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
  ArrowRight,
  Compass,
  TrendingUp,
} from "lucide-react";
import { routeService } from "../../services/route";
import type { Route } from "../../types/route";
import { getVesselImage } from "../../utils/vesselImages";

export default function RouteSearchSection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");

  // Ref for drag scrolling
  const routesScrollRef = useRef<HTMLDivElement>(null);

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
      const walk = (x - startX) * 2;
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
    navigate(`/booking/${route.id}`);
  };

  return (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Price tag */}
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
                      {/* Route Path */}
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

                      {/* Book Button */}
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Price tag */}
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
                          {/* Route Path */}
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

                          {/* Book Button */}
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

      <style>{`
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
      `}</style>
    </section>
  );
}
