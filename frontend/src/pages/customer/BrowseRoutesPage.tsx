import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Ship, MapPin, Clock, Users, Search, Filter, ArrowRight, AlertCircle } from 'lucide-react';
import { routeService } from '../../services/route';
import type { Route } from '../../types/route';
import Layout from '../../components/layout/Layout';
import { useDebounce } from '../../hooks/useDebounce';
import { getVesselImage } from '../../utils/vesselImages';

export default function BrowseRoutesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  // Debounce search input to avoid re-filtering on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch all routes
  const { data, isLoading, error } = useQuery({
    queryKey: ['routes', { status: 'active' }],
    queryFn: () => routeService.getRoutes({ status: 'active', per_page: 100 }),
  });

  const routes = data?.data || [];

  // Get unique origins and destinations for filters
  const origins = Array.from(new Set(routes.map(route => route.origin)));
  const destinations = Array.from(new Set(routes.map(route => route.destination)));

  // Filter routes based on search and filters (using debounced search)
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = debouncedSearchTerm === '' ||
      route.origin.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      route.vessel?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesOrigin = selectedOrigin === '' || route.origin === selectedOrigin;
    const matchesDestination = selectedDestination === '' || route.destination === selectedDestination;

    return matchesSearch && matchesOrigin && matchesDestination;
  });

  const handleBookRoute = (route: Route) => {
    navigate(`/booking/${route.id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Ship
              className="w-16 h-16 animate-bounce mx-auto mb-4"
              style={{ color: '#272343' }}
            />
            <p
              className="text-lg font-light"
              style={{ color: '#272343', opacity: 0.7 }}
            >
              Loading available routes...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: '#dc2626' }}
            />
            <p
              className="text-lg font-light mb-6"
              style={{ color: '#272343' }}
            >
              Error loading routes. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 text-white rounded-xl font-medium transition-all"
              style={{ background: '#272343' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1a1829';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#272343';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-5xl font-light mb-4"
            style={{ color: '#272343', letterSpacing: '-0.02em' }}
          >
            Browse Ferry Routes
          </h1>
          <p
            className="text-lg font-light"
            style={{ color: '#272343', opacity: 0.6 }}
          >
            Find and book your perfect ferry journey
          </p>
        </div>

        {/* Search and Filter Section */}
        <div
          className="bg-white rounded-3xl p-8 sm:p-10 mb-12"
          style={{
            borderWidth: '1px',
            borderColor: '#bae8e8',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: '#272343', opacity: 0.3 }}
              />
              <input
                type="text"
                placeholder="Search routes or vessels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border rounded-xl transition-all font-light"
                style={{
                  borderColor: '#bae8e8',
                  color: '#272343',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#272343';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#bae8e8';
                }}
              />
            </div>

            {/* Origin Filter */}
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: '#272343', opacity: 0.3 }}
              />
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border rounded-xl appearance-none transition-all font-light"
                style={{
                  borderColor: '#bae8e8',
                  color: '#272343',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#272343';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#bae8e8';
                }}
              >
                <option value="">All Origins</option>
                {origins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>

            {/* Destination Filter */}
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: '#272343', opacity: 0.3 }}
              />
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border rounded-xl appearance-none transition-all font-light"
                style={{
                  borderColor: '#bae8e8',
                  color: '#272343',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#272343';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#bae8e8';
                }}
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
              className="px-6 py-3 rounded-xl transition-all font-light flex items-center justify-center gap-2"
              style={{
                background: '#bae8e8',
                color: '#272343',
                fontSize: '15px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#272343';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#bae8e8';
                e.currentTarget.style.color = '#272343';
              }}
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Routes Grid */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <h2
              className="text-3xl font-light"
              style={{ color: '#272343' }}
            >
              Available Routes
              <span
                className="ml-3 font-light"
                style={{ color: '#272343', opacity: 0.4 }}
              >
                ({filteredRoutes.length})
              </span>
            </h2>
          </div>

          {filteredRoutes.length === 0 ? (
            <div
              className="text-center py-24 bg-white rounded-3xl"
              style={{
                borderWidth: '1px',
                borderColor: '#bae8e8',
              }}
            >
              <Ship
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: '#272343', opacity: 0.2 }}
              />
              <p
                className="text-xl font-medium mb-2"
                style={{ color: '#272343' }}
              >
                No routes found
              </p>
              <p
                className="font-light"
                style={{ color: '#272343', opacity: 0.6 }}
              >
                Try adjusting your search filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    borderWidth: '1px',
                    borderColor: '#bae8e8',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
                  }}
                >
                  {/* Vessel Image */}
                  <div
                    className="relative h-48 overflow-hidden"
                    style={{
                      background: '#e3f6f5',
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
                          style={{ color: '#272343', opacity: 0.2 }}
                        />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full">
                      <span
                        className="text-xl font-medium"
                        style={{ color: '#272343' }}
                      >
                        ${route.price}
                      </span>
                      <span
                        className="text-xs ml-1 font-light"
                        style={{ color: '#272343', opacity: 0.5 }}
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
                        style={{ color: '#272343', opacity: 0.4 }}
                      />
                      <h3
                        className="text-lg font-medium"
                        style={{ color: '#272343' }}
                      >
                        {route.vessel?.name || 'Ferry'}
                      </h3>
                    </div>

                    {/* Route */}
                    <div
                      className="flex items-center gap-3 mb-6 pb-6"
                      style={{ borderBottom: '1px solid #bae8e8' }}
                    >
                      <MapPin
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: '#272343', opacity: 0.4 }}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span
                          className="font-light truncate"
                          style={{ color: '#272343' }}
                        >
                          {route.origin}
                        </span>
                        <ArrowRight
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: '#272343', opacity: 0.3 }}
                        />
                        <span
                          className="font-light truncate"
                          style={{ color: '#272343' }}
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
                          color: '#272343',
                          opacity: 0.6,
                          fontSize: '15px',
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
                            color: '#272343',
                            opacity: 0.6,
                            fontSize: '15px',
                          }}
                        >
                          <Users className="w-4 h-4" style={{ opacity: 0.6 }} />
                          <span>Up to {route.vessel.capacity} passengers</span>
                        </div>
                      )}
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => handleBookRoute(route)}
                      className="w-full py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
                      style={{
                        background: '#272343',
                        fontSize: '15px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1a1829';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#272343';
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
    </Layout>
  );
}
