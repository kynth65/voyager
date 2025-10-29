import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Ship,
  MapPin,
  Calendar,
  Clock,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { routeService } from '../../services/route';
import { bookingService } from '../../services/booking';
import type { CreateBookingRequest } from '../../types/booking';

// Booking form validation schema
const bookingSchema = z.object({
  booking_date: z.string().min(1, 'Please select a travel date'),
  departure_time: z.string().min(1, 'Please select a departure time'),
  passengers: z.number().min(1, 'At least 1 passenger is required').max(50, 'Maximum 50 passengers'),
  special_requirements: z.string().optional(),
  payment_method: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'cash', 'paypal']),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  // Fetch route details
  const { data: route, isLoading: routeLoading, error: routeError } = useQuery({
    queryKey: ['route', routeId],
    queryFn: () => routeService.getRouteById(Number(routeId)),
    enabled: !!routeId,
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      payment_method: 'credit_card',
      passengers: 1,
    },
  });

  const passengers = watch('passengers');
  const totalAmount = route ? route.price * (passengers || 1) : 0;

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),
    onSuccess: (response) => {
      setBookingSuccess(true);
      setBookingReference(response.booking.booking_reference);
    },
  });

  const onSubmit: SubmitHandler<BookingFormData> = (data) => {
    if (!route) return;

    const bookingData: CreateBookingRequest = {
      route_id: route.id,
      booking_date: data.booking_date,
      departure_time: data.departure_time,
      passengers: data.passengers,
      special_requirements: data.special_requirements || undefined,
      payment_method: data.payment_method,
    };

    createBookingMutation.mutate(bookingData);
  };

  if (routeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Ship className="w-12 h-12 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading route details...</p>
        </div>
      </div>
    );
  }

  if (routeError || !route) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Route not found. Please try again.</p>
          <button
            onClick={() => navigate('/browse-routes')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Routes
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">Your ferry ticket has been booked successfully.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Booking Reference</p>
              <p className="text-2xl font-bold text-blue-600">{bookingReference}</p>
            </div>

            <div className="space-y-2 text-left mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Route:</span>
                <span className="font-semibold">{route.origin} → {route.destination}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Passengers:</span>
                <span className="font-semibold">{passengers}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-semibold text-blue-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/my-bookings')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/browse-routes')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Book Another Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main booking form
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse-routes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Routes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Your Ferry Ticket</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Travel Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    {...register('booking_date')}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.booking_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.booking_date.message}</p>
                  )}
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Departure Time *
                  </label>
                  <input
                    type="time"
                    {...register('departure_time')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.departure_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.departure_time.message}</p>
                  )}
                </div>

                {/* Number of Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Passengers *
                  </label>
                  <input
                    type="number"
                    {...register('passengers', { valueAsNumber: true })}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.passengers && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengers.message}</p>
                  )}
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    {...register('special_requirements')}
                    rows={3}
                    placeholder="Any special requests or requirements..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Payment Method *
                  </label>
                  <select
                    {...register('payment_method')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="paypal">PayPal</option>
                  </select>
                  {errors.payment_method && (
                    <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {createBookingMutation.isError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      {(createBookingMutation.error as any)?.response?.data?.message ||
                        'Failed to create booking. Please try again.'}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {createBookingMutation.isPending ? 'Processing...' : 'Confirm Booking & Pay'}
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>

              {/* Route Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Ship className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Vessel</p>
                    <p className="font-semibold">{route.vessel?.name || 'Ferry'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-semibold">{route.origin} → {route.destination}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{route.duration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per passenger</span>
                  <span className="font-medium">${route.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of passengers</span>
                  <span className="font-medium">× {passengers || 1}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Mock Payment Notice */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  This is a mock payment system. Your booking will be confirmed instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
