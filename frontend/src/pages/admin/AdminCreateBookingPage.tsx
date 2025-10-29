import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Ship,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  User as UserIcon,
  Search,
} from 'lucide-react';
import { routeService } from '../../services/route';
import { bookingService } from '../../services/booking';
import { getUsers } from '../../services/user';
import type { CreateBookingRequest } from '../../types/booking';
import type { User } from '../../types/auth';
import Layout from '../../components/layout/Layout';

// Admin booking form validation schema
const adminBookingSchema = z.object({
  user_id: z.number().min(1, 'Please select a customer'),
  route_id: z.number().min(1, 'Please select a route'),
  booking_date: z.string().min(1, 'Please select a travel date'),
  departure_time: z.string().min(1, 'Please select a departure time'),
  passengers: z.number().min(1, 'At least 1 passenger is required').max(50, 'Maximum 50 passengers'),
  special_requirements: z.string().optional(),
  payment_method: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'cash', 'paypal']),
});

type AdminBookingFormData = z.infer<typeof adminBookingSchema>;

export default function AdminCreateBookingPage() {
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  // Fetch customers (filter by role=customer)
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: () => getUsers({ role: 'customer', search: customerSearch, per_page: 100 }),
  });

  // Fetch available routes
  const { data: routesData, isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routeService.getRoutes({ per_page: 100 }),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdminBookingFormData>({
    resolver: zodResolver(adminBookingSchema),
    defaultValues: {
      payment_method: 'credit_card',
      passengers: 1,
    },
  });

  const passengers = watch('passengers');
  const routeId = watch('route_id');

  // Update selected route when route_id changes
  useEffect(() => {
    if (routeId && routesData?.data) {
      const route = routesData.data.find((r) => r.id === Number(routeId));
      setSelectedRoute(route || null);
    } else {
      setSelectedRoute(null);
    }
  }, [routeId, routesData]);

  const totalAmount = selectedRoute ? Number(selectedRoute.price) * (passengers || 1) : 0;

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),
    onSuccess: (response) => {
      setBookingSuccess(true);
      setBookingReference(response.booking.booking_reference);
    },
  });

  const onSubmit: SubmitHandler<AdminBookingFormData> = (data) => {
    const bookingData: CreateBookingRequest = {
      user_id: data.user_id,
      route_id: data.route_id,
      booking_date: data.booking_date,
      departure_time: data.departure_time,
      passengers: data.passengers,
      special_requirements: data.special_requirements || undefined,
      payment_method: data.payment_method,
    };

    createBookingMutation.mutate(bookingData);
  };

  if (bookingSuccess) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Created Successfully!</h2>
            <p className="text-gray-600 mb-4">
              The booking has been created and confirmed for the customer.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-2xl font-mono font-bold text-blue-600">{bookingReference}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/admin/bookings')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Bookings
              </button>
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setBookingReference('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Create Another Booking
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Booking for Customer</h1>
              <p className="text-sm text-gray-500 mt-1">
                Create a ferry booking on behalf of a customer
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Customer Information
            </h2>

            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                {...register('user_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a customer --</option>
                {customersLoading ? (
                  <option value="">Loading customers...</option>
                ) : (
                  customersData?.data?.map((customer: User) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))
                )}
              </select>
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.user_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ship className="w-5 h-5 text-blue-600" />
              Route Selection
            </h2>

            {/* Route Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Route <span className="text-red-500">*</span>
              </label>
              <select
                {...register('route_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a route --</option>
                {routesLoading ? (
                  <option value="">Loading routes...</option>
                ) : (
                  routesData?.data?.map((route: any) => (
                    <option key={route.id} value={route.id}>
                      {route.origin} → {route.destination} - ${route.price} ({route.vessel?.name})
                    </option>
                  ))
                )}
              </select>
              {errors.route_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.route_id.message}
                </p>
              )}

              {/* Selected Route Details */}
              {selectedRoute && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Origin</p>
                      <p className="font-medium text-gray-900">{selectedRoute.origin}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Destination</p>
                      <p className="font-medium text-gray-900">{selectedRoute.destination}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vessel</p>
                      <p className="font-medium text-gray-900">{selectedRoute.vessel?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium text-gray-900">{selectedRoute.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price per Passenger</p>
                      <p className="font-medium text-gray-900">${selectedRoute.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Capacity</p>
                      <p className="font-medium text-gray-900">{selectedRoute.vessel?.capacity} passengers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Travel Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booking Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('booking_date')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.booking_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.booking_date.message}
                  </p>
                )}
              </div>

              {/* Departure Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register('departure_time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.departure_time && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.departure_time.message}
                  </p>
                )}
              </div>

              {/* Number of Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Passengers <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('passengers', { valueAsNumber: true })}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.passengers && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.passengers.message}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('payment_method')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                </select>
                {errors.payment_method && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.payment_method.message}
                  </p>
                )}
              </div>
            </div>

            {/* Special Requirements */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements (Optional)
              </label>
              <textarea
                {...register('special_requirements')}
                rows={3}
                placeholder="Any special requirements or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {errors.special_requirements && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.special_requirements.message}
                </p>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Booking Summary
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Number of Passengers</span>
                <span className="font-medium text-gray-900">{passengers || 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per Passenger</span>
                <span className="font-medium text-gray-900">
                  ${selectedRoute ? Number(selectedRoute.price).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {createBookingMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-900">Booking Failed</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {(createBookingMutation.error as any)?.response?.data?.message ||
                      'An error occurred while creating the booking. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {createBookingMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Booking
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/bookings')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
