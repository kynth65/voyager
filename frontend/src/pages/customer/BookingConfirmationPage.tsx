import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Ship,
  MapPin,
  Calendar,
  Clock,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { bookingService } from '../../services/booking';
import type { CreateBookingRequest } from '../../types/booking';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load booking data from localStorage
    const storedBooking = localStorage.getItem('pending_booking');
    if (!storedBooking) {
      // No pending booking, redirect to browse routes
      navigate('/browse-routes');
      return;
    }

    try {
      const data = JSON.parse(storedBooking);
      setBookingData(data);
    } catch (e) {
      console.error('Failed to parse booking data:', e);
      navigate('/browse-routes');
    }
  }, [isAuthenticated, navigate]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),
    onSuccess: (response) => {
      setBookingSuccess(true);
      setBookingReference(response.booking.booking_reference);
      // Clear pending booking from localStorage
      localStorage.removeItem('pending_booking');
    },
  });

  const handleConfirmBooking = () => {
    if (!bookingData) return;

    const request: CreateBookingRequest = {
      route_id: bookingData.route_id,
      booking_date: bookingData.booking_date,
      departure_time: bookingData.departure_time,
      passengers: bookingData.passengers,
      special_requirements: bookingData.special_requirements,
      payment_method: bookingData.payment_method,
    };

    createBookingMutation.mutate(request);
  };

  const handleCancel = () => {
    // Clear pending booking
    localStorage.removeItem('pending_booking');
    navigate('/browse-routes');
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Ship className="w-12 h-12 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Success screen
  if (bookingSuccess) {
    const totalAmount = bookingData.route.price * bookingData.passengers;

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
                <span className="font-semibold">{bookingData.route.origin} → {bookingData.route.destination}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Passengers:</span>
                <span className="font-semibold">{bookingData.passengers}</span>
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

  const totalAmount = bookingData.route.price * bookingData.passengers;

  // Confirmation screen
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Ship className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h1>
                <p className="text-gray-600">Review your booking details before confirming</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Account Created Successfully!</p>
                <p className="text-sm text-green-800">
                  Welcome to Voyager! Now let's complete your booking.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="border-t border-b py-6 mb-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Ship className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Vessel</p>
                    <p className="font-medium">{bookingData.route.vessel_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-medium">{bookingData.route.origin} → {bookingData.route.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{bookingData.route.duration} minutes</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Travel Date</p>
                    <p className="font-medium">{new Date(bookingData.booking_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Departure Time</p>
                    <p className="font-medium">{bookingData.departure_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Number of Passengers</p>
                    <p className="font-medium">{bookingData.passengers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium capitalize">{bookingData.payment_method.replace('_', ' ')}</p>
                  </div>
                </div>
                {bookingData.special_requirements && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Special Requirements</p>
                      <p className="font-medium">{bookingData.special_requirements}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per passenger</span>
                <span className="font-medium">${bookingData.route.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Number of passengers</span>
                <span className="font-medium">× {bookingData.passengers}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Payment Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              This is a mock payment system. Your booking will be confirmed instantly after clicking "Confirm & Pay".
            </p>
          </div>

          {/* Error Message */}
          {createBookingMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">
                {(createBookingMutation.error as any)?.response?.data?.message ||
                  'Failed to create booking. Please try again.'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmBooking}
              disabled={createBookingMutation.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createBookingMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Confirm & Pay ${totalAmount.toFixed(2)}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={createBookingMutation.isPending}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
