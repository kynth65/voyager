import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Ship, MapPin, Clock, Users, Search, Filter } from 'lucide-react';
import { routeService } from '../services/route';
import type { Route } from '../types/route';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

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
    // Redirect to login with return URL
    navigate('/login', { state: { from: `/booking/${route.id}` } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Ship className="w-12 h-12 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading available routes...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Ship className="w-8 h-8" />
              <span className="text-xl font-bold">Voyager</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-md transition-colors font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="text-center">
            <Ship className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Voyager Ferry Booking</h1>
            <p className="text-xl text-blue-100 mb-6">Book your ferry tickets with ease</p>
            <p className="text-blue-100">
              <span className="font-semibold">Sign up</span> or <span className="font-semibold">login</span> to book your journey
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes or vessels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Origin Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Origins</option>
                {origins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>

            {/* Destination Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Routes ({filteredRoutes.length})
          </h2>

          {filteredRoutes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No routes found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Vessel Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                    {route.vessel?.image ? (
                      <img
                        src={route.vessel.image}
                        alt={route.vessel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Ship className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                      ${route.price}
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="p-6">
                    {/* Vessel Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <Ship className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {route.vessel?.name || 'Ferry'}
                      </h3>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 mb-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{route.origin}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{route.destination}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 mb-3 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>{route.duration} minutes</span>
                    </div>

                    {/* Capacity */}
                    {route.vessel?.capacity && (
                      <div className="flex items-center gap-2 mb-4 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span>Capacity: {route.vessel.capacity} passengers</span>
                      </div>
                    )}

                    {/* Price & Book Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-2xl font-bold text-blue-600">
                        ${route.price}
                        <span className="text-sm text-gray-500 font-normal"> / person</span>
                      </div>
                      <button
                        onClick={() => handleBookRoute(route)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Book Your Journey?</h2>
          <p className="text-blue-100 mb-6">Create an account or login to start booking ferry tickets</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-md transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
