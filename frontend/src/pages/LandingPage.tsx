import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  Star,
  TrendingUp,
  Heart,
  Award,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { routeService } from '../services/route';
import type { Route } from '../types/route';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch all routes
  const { data, isLoading, error } = useQuery({
    queryKey: ['routes', { status: 'active' }],
    queryFn: () => routeService.getRoutes({ status: 'active', per_page: 100 }),
  });

  const routes = data?.data || [];

  // Get unique origins and destinations for filters
  const origins = Array.from(new Set(routes.map(route => route.origin)));
  const destinations = Array.from(new Set(routes.map(route => route.destination)));

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = searchTerm === '' ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.vessel?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrigin = selectedOrigin === '' || route.origin === selectedOrigin;
    const matchesDestination = selectedDestination === '' || route.destination === selectedDestination;

    return matchesSearch && matchesOrigin && matchesDestination;
  });

  const handleBookRoute = (route: Route) => {
    navigate('/login', { state: { from: `/booking/${route.id}` } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <Ship className="w-16 h-16 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>Error loading routes. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className={`p-2 rounded-xl transition-colors ${
                isScrolled ? 'bg-blue-600' : 'bg-white'
              }`}>
                <Ship className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-blue-600'}`} />
              </div>
              <span className={`text-2xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Voyager
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-yellow-300" />
            <span>Trusted by 50,000+ travelers</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Your Journey Begins
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              On The Waves
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Book ferry tickets instantly with real-time availability, secure payments, and hassle-free boarding
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:-translate-y-1 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const searchSection = document.getElementById('search-routes');
                searchSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white rounded-xl font-semibold text-lg transition-all duration-200"
            >
              Browse Routes
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up delay-500">
            {[
              { label: 'Active Routes', value: routes.length, icon: MapPin },
              { label: 'Happy Travelers', value: '50K+', icon: Users },
              { label: 'Daily Departures', value: '100+', icon: Ship },
              { label: 'Customer Rating', value: '4.9★', icon: Star }
            ].map((stat, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-200">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Voyager?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience seamless ferry booking with features designed for modern travelers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Book your tickets in seconds with our streamlined checkout process',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Your transactions are protected with bank-level encryption',
                color: 'from-green-400 to-emerald-500'
              },
              {
                icon: Calendar,
                title: 'Flexible Scheduling',
                description: 'Choose from multiple daily departures that fit your schedule',
                color: 'from-blue-400 to-indigo-500'
              },
              {
                icon: CreditCard,
                title: 'Easy Refunds',
                description: 'Cancel or modify bookings with our hassle-free refund policy',
                color: 'from-purple-400 to-pink-500'
              },
              {
                icon: Heart,
                title: 'Best Price Guarantee',
                description: 'Get the most competitive rates on all ferry routes',
                color: 'from-red-400 to-rose-500'
              },
              {
                icon: Award,
                title: '24/7 Support',
                description: 'Our dedicated team is always here to help you',
                color: 'from-cyan-400 to-blue-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Book in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Getting on board has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

            {[
              {
                step: '01',
                title: 'Search Routes',
                description: 'Browse available routes and select your preferred departure time',
                icon: Search
              },
              {
                step: '02',
                title: 'Enter Details',
                description: 'Fill in passenger information and choose your seats',
                icon: Users
              },
              {
                step: '03',
                title: 'Confirm & Go',
                description: 'Complete payment and receive your digital ticket instantly',
                icon: CheckCircle
              }
            ].map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl relative z-10 transform hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100 rounded-xl -z-10"></div>
                  <div className="absolute -top-4 -left-2 text-7xl font-bold text-blue-50">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Routes Section */}
      <section id="search-routes" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Perfect Route
              </h2>
              <p className="text-gray-600">
                Search from {routes.length} available routes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search routes or vessels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Origin Filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                >
                  <option value="">All Origins</option>
                  {origins.map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>

              {/* Destination Filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                >
                  <option value="">All Destinations</option>
                  {destinations.map(destination => (
                    <option key={destination} value={destination}>{destination}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedOrigin('');
                  setSelectedDestination('');
                }}
                className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Clear
              </button>
            </div>
          </div>

          {/* Routes Grid */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Available Routes
                <span className="ml-3 text-blue-600">({filteredRoutes.length})</span>
              </h3>
              {filteredRoutes.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Most popular routes</span>
                </div>
              )}
            </div>

            {filteredRoutes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Ship className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-xl font-medium mb-2">No routes found</p>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
                  >
                    {/* Vessel Image */}
                    <div className="relative h-56 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                      {route.vessel?.image ? (
                        <img
                          src={route.vessel.image}
                          alt={route.vessel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Ship className="w-20 h-20 text-white opacity-40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                        <span className="text-2xl font-bold text-blue-600">${route.price}</span>
                        <span className="text-xs text-gray-600 ml-1">/ person</span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="p-6">
                      {/* Vessel Name */}
                      <div className="flex items-center gap-2 mb-4">
                        <Ship className="w-5 h-5 text-blue-600" />
                        <h4 className="text-xl font-bold text-gray-900">
                          {route.vessel?.name || 'Ferry'}
                        </h4>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-semibold text-gray-900 truncate">{route.origin}</span>
                          <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-900 truncate">{route.destination}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {/* Duration */}
                        <div className="flex items-center gap-3 text-gray-700">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span>{route.duration} minutes journey</span>
                        </div>

                        {/* Capacity */}
                        {route.vessel?.capacity && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Users className="w-5 h-5 text-gray-400" />
                            <span>Up to {route.vessel.capacity} passengers</span>
                          </div>
                        )}
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => handleBookRoute(route)}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 flex items-center justify-center gap-2 group"
                      >
                        Book This Route
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Thousands of Travelers
            </h2>
            <p className="text-xl text-blue-100">
              Join our growing community of satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                quote: "Voyager made booking ferry tickets so easy! The whole process took less than 5 minutes.",
                author: "Sarah Johnson",
                role: "Frequent Traveler",
                rating: 5
              },
              {
                quote: "Best ferry booking experience I've had. Real-time updates and instant confirmations.",
                author: "Michael Chen",
                role: "Business Traveler",
                rating: 5
              },
              {
                quote: "Customer support is amazing! They helped me reschedule my booking without any hassle.",
                author: "Emma Williams",
                role: "Tourist",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 hover:bg-opacity-20 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-blue-200 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who trust Voyager for their ferry bookings
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:-translate-y-1 flex items-center gap-2 group"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white rounded-xl font-bold text-lg transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Ship className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Voyager</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your trusted partner for seamless ferry bookings and unforgettable journeys across the waves.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {['About Us', 'Our Fleet', 'Routes', 'Pricing', 'FAQ'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                {['Help Center', 'Booking Terms', 'Privacy Policy', 'Refund Policy', 'Contact Us'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Get In Touch</h3>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:support@voyager.com" className="flex items-center gap-3 hover:text-white transition-colors">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span>support@voyager.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+1234567890" className="flex items-center gap-3 hover:text-white transition-colors">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span>+1 (234) 567-890</span>
                  </a>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Available 24/7</p>
                <p className="text-white font-semibold">We're here to help!</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 Voyager Ferry Booking. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
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
