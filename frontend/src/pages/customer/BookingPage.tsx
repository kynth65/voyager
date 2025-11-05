import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  UserPlus,
  Info,
  ArrowRight,
} from "lucide-react";
import { routeService } from "../../services/route";
import { bookingService } from "../../services/booking";
import type { CreateBookingRequest } from "../../types/booking";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/common/Navbar";

// Booking form validation schema
const bookingSchema = z.object({
  booking_date: z.string().min(1, "Please select a travel date"),
  departure_time: z.string().min(1, "Please select a departure time"),
  passengers: z
    .number()
    .min(1, "At least 1 passenger is required")
    .max(50, "Maximum 50 passengers"),
  special_requirements: z.string().optional(),
  payment_method: z.enum([
    "credit_card",
    "debit_card",
    "bank_transfer",
    "cash",
    "paypal",
  ]),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Fetch route details
  const {
    data: route,
    isLoading: routeLoading,
    error: routeError,
  } = useQuery({
    queryKey: ["route", routeId],
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
      payment_method: "credit_card",
      passengers: 1,
    },
  });

  const passengers = watch("passengers");
  const bookingDate = watch("booking_date");
  const departureTime = watch("departure_time");
  const totalAmount = route ? route.price * (passengers || 1) : 0;

  // Fetch capacity information when date, time, and passengers change
  const {
    data: capacityData,
    isLoading: capacityLoading,
  } = useQuery({
    queryKey: [
      "vessel-capacity",
      route?.vessel_id,
      route?.id,
      bookingDate,
      departureTime,
      passengers,
    ],
    queryFn: () =>
      bookingService.checkCapacity(route!.vessel_id, {
        route_id: route!.id,
        booking_date: bookingDate,
        departure_time: departureTime,
        passengers: passengers || 1,
      }),
    enabled:
      !!route?.vessel_id &&
      !!route?.id &&
      !!bookingDate &&
      !!departureTime &&
      !!passengers,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) =>
      bookingService.createBooking(data),
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

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store booking data in localStorage for later
      localStorage.setItem(
        "pending_booking",
        JSON.stringify({
          ...bookingData,
          route: {
            id: route.id,
            origin: route.origin,
            destination: route.destination,
            price: route.price,
            duration: route.duration,
            vessel_name: route.vessel?.name || "Ferry",
          },
        })
      );
      // Show modal to prompt user to register
      setShowGuestModal(true);
      return;
    }

    // User is authenticated, proceed with booking
    createBookingMutation.mutate(bookingData);
  };

  if (routeLoading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#e3f6f5" }}
      >
        <Navbar transparent={false} showAuthButtons={!isAuthenticated} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Ship
              className="w-12 h-12 animate-bounce mx-auto mb-4"
              style={{ color: "#272343" }}
            />
            <p className="font-light" style={{ color: "#272343" }}>
              Loading route details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (routeError || !route) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#e3f6f5" }}
      >
        <Navbar transparent={false} showAuthButtons={!isAuthenticated} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "#dc2626" }}
            />
            <p className="font-light mb-6" style={{ color: "#272343" }}>
              Route not found. Please try again.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 text-white rounded-xl font-medium transition-all"
              style={{ background: "#272343" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a1829";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#272343";
              }}
            >
              Back to Routes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (bookingSuccess) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#e3f6f5" }}
      >
        <Navbar transparent={false} showAuthButtons={false} />
        <div className="flex-1 py-16 px-4 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <div
              className="bg-white rounded-3xl p-8 sm:p-12 text-center"
              style={{
                borderWidth: "1px",
                borderColor: "#bae8e8",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            >
              {/* Success Icon */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "#dcfce7" }}
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              {/* Success Message */}
              <h1
                className="text-4xl font-light mb-3"
                style={{ color: "#272343", letterSpacing: "-0.02em" }}
              >
                Booking Confirmed!
              </h1>
              <p
                className="font-light mb-10"
                style={{ color: "#272343", opacity: 0.6, fontSize: "15px" }}
              >
                Your ferry ticket has been booked successfully. We've sent a
                confirmation email with your ticket details.
              </p>

              {/* Booking Reference */}
              <div
                className="rounded-2xl p-6 mb-8"
                style={{
                  background: "#e3f6f5",
                  borderWidth: "1px",
                  borderColor: "#bae8e8",
                }}
              >
                <p
                  className="text-sm font-light mb-2"
                  style={{ color: "#272343", opacity: 0.6 }}
                >
                  Your Booking Reference
                </p>
                <p
                  className="text-3xl font-medium tracking-wide"
                  style={{ color: "#272343" }}
                >
                  {bookingReference}
                </p>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 text-left mb-10">
                <div
                  className="flex justify-between items-center pb-4"
                  style={{ borderBottom: "1px solid #bae8e8" }}
                >
                  <span
                    className="font-light"
                    style={{ color: "#272343", opacity: 0.6 }}
                  >
                    Route
                  </span>
                  <span className="font-medium" style={{ color: "#272343" }}>
                    {route.origin} → {route.destination}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center pb-4"
                  style={{ borderBottom: "1px solid #bae8e8" }}
                >
                  <span
                    className="font-light"
                    style={{ color: "#272343", opacity: 0.6 }}
                  >
                    Passengers
                  </span>
                  <span className="font-medium" style={{ color: "#272343" }}>
                    {passengers}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center pb-4"
                  style={{ borderBottom: "1px solid #bae8e8" }}
                >
                  <span
                    className="font-light"
                    style={{ color: "#272343", opacity: 0.6 }}
                  >
                    Total Paid
                  </span>
                  <span
                    className="text-xl font-medium"
                    style={{ color: "#272343" }}
                  >
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                  style={{ background: "#272343" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a1829";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#272343";
                  }}
                >
                  View My Bookings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 rounded-xl font-medium transition-all"
                  style={{ background: "#bae8e8", color: "#272343" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#272343";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#bae8e8";
                    e.currentTarget.style.color = "#272343";
                  }}
                >
                  Book Another Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main booking form
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#e3f6f5" }}
    >
      <Navbar transparent={false} showAuthButtons={!isAuthenticated} />
      <div className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 font-light transition-colors"
            style={{ color: "#272343", opacity: 0.7 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Routes
          </button>

          {/* Auth Required Banner - Only show for unauthorized users */}
          {!isAuthenticated && (
            <div
              className="rounded-2xl p-5 sm:p-6 mb-8 animate-fade-in"
              style={{
                background: "#fff9e6",
                borderWidth: "1px",
                borderColor: "#fbbf24",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#fef3c7" }}
                >
                  <Info className="w-5 h-5" style={{ color: "#f59e0b" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: "#78350f" }}
                  >
                    Sign In Required
                  </h3>
                  <p
                    className="text-sm font-light mb-4"
                    style={{ color: "#78350f", opacity: 0.8 }}
                  >
                    You need to be signed in to complete a booking. Create a
                    free account or sign in to continue with your ferry
                    reservation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate("/register")}
                      className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 group"
                      style={{ background: "#f59e0b", color: "#ffffff" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#d97706";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f59e0b";
                      }}
                    >
                      <UserPlus className="w-4 h-4" />
                      Create Free Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm"
                      style={{
                        background: "transparent",
                        color: "#78350f",
                        borderWidth: "1px",
                        borderColor: "#fbbf24",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fef3c7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-3xl p-6 sm:p-8"
                style={{
                  borderWidth: "1px",
                  borderColor: "#bae8e8",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <h1
                  className="text-3xl font-light mb-8"
                  style={{ color: "#272343", letterSpacing: "-0.02em" }}
                >
                  Book Your Ferry Ticket
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Travel Date */}
                  <div>
                    <label
                      className="flex items-center gap-2 text-sm font-medium mb-3"
                      style={{ color: "#272343" }}
                    >
                      <Calendar className="w-4 h-4" />
                      Travel Date *
                    </label>
                    <input
                      type="date"
                      {...register("booking_date")}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border rounded-xl font-light transition-all"
                      style={{
                        borderColor: errors.booking_date
                          ? "#fca5a5"
                          : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      onFocus={(e) => {
                        if (!errors.booking_date) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.booking_date) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                    {errors.booking_date && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-light">
                        <AlertCircle className="w-4 h-4" />
                        {errors.booking_date.message}
                      </p>
                    )}
                  </div>

                  {/* Departure Time */}
                  <div>
                    <label
                      className="flex items-center gap-2 text-sm font-medium mb-3"
                      style={{ color: "#272343" }}
                    >
                      <Clock className="w-4 h-4" />
                      Departure Time *
                    </label>
                    <input
                      type="time"
                      {...register("departure_time")}
                      className="w-full px-4 py-3 border rounded-xl font-light transition-all"
                      style={{
                        borderColor: errors.departure_time
                          ? "#fca5a5"
                          : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      onFocus={(e) => {
                        if (!errors.departure_time) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.departure_time) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                    {errors.departure_time && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-light">
                        <AlertCircle className="w-4 h-4" />
                        {errors.departure_time.message}
                      </p>
                    )}
                  </div>

                  {/* Number of Passengers */}
                  <div>
                    <label
                      className="flex items-center gap-2 text-sm font-medium mb-3"
                      style={{ color: "#272343" }}
                    >
                      <Users className="w-4 h-4" />
                      Number of Passengers *
                    </label>
                    <input
                      type="number"
                      {...register("passengers", { valueAsNumber: true })}
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 border rounded-xl font-light transition-all"
                      style={{
                        borderColor: errors.passengers ? "#fca5a5" : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      onFocus={(e) => {
                        if (!errors.passengers) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.passengers) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                    {errors.passengers && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-light">
                        <AlertCircle className="w-4 h-4" />
                        {errors.passengers.message}
                      </p>
                    )}
                  </div>

                  {/* Capacity Information - Real-time Display */}
                  {bookingDate && departureTime && (
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: "#e3f6f5",
                        borderWidth: "1px",
                        borderColor: "#bae8e8",
                      }}
                    >
                      <h3
                        className="flex items-center gap-2 text-sm font-medium mb-4"
                        style={{ color: "#272343" }}
                      >
                        <Ship className="w-4 h-4" />
                        Vessel Capacity for Selected Date & Time
                      </h3>

                      {capacityLoading ? (
                        <div className="flex items-center gap-3">
                          <svg
                            className="animate-spin h-5 w-5"
                            style={{ color: "#272343" }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span
                            className="text-sm font-light"
                            style={{ color: "#272343", opacity: 0.7 }}
                          >
                            Checking vessel availability...
                          </span>
                        </div>
                      ) : capacityData ? (
                        <div className="space-y-3">
                          {/* Capacity Bars */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span
                                className="font-light"
                                style={{ color: "#272343", opacity: 0.7 }}
                              >
                                Total Capacity
                              </span>
                              <span
                                className="font-medium"
                                style={{ color: "#272343" }}
                              >
                                {capacityData.vessel_capacity} seats
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span
                                className="font-light"
                                style={{ color: "#272343", opacity: 0.7 }}
                              >
                                Already Booked
                              </span>
                              <span
                                className="font-medium"
                                style={{ color: "#272343" }}
                              >
                                {capacityData.booked_seats} seats
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span
                                className="font-medium"
                                style={{ color: "#272343" }}
                              >
                                Available Seats
                              </span>
                              <span
                                className={`font-bold text-base ${
                                  capacityData.available_seats < 10
                                    ? "text-red-600"
                                    : capacityData.available_seats < 20
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {capacityData.available_seats} seats
                              </span>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="mt-4">
                            <div
                              className="w-full h-3 rounded-full overflow-hidden"
                              style={{ background: "#bae8e8" }}
                            >
                              <div
                                className="h-full transition-all duration-300 rounded-full"
                                style={{
                                  width: `${
                                    (capacityData.booked_seats /
                                      capacityData.vessel_capacity) *
                                    100
                                  }%`,
                                  background:
                                    capacityData.available_seats < 10
                                      ? "#dc2626"
                                      : capacityData.available_seats < 20
                                      ? "#f59e0b"
                                      : "#16a34a",
                                }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-light" style={{ color: "#272343", opacity: 0.6 }}>
                              <span>0</span>
                              <span>{capacityData.vessel_capacity} seats</span>
                            </div>
                          </div>

                          {/* Availability Alerts */}
                          {!capacityData.available && (
                            <div
                              className="rounded-xl p-3 mt-3"
                              style={{
                                background: "#fee2e2",
                                borderWidth: "1px",
                                borderColor: "#fecaca",
                              }}
                            >
                              <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                Not enough seats for {passengers} passenger(s).
                                Only {capacityData.available_seats} seats left!
                              </p>
                            </div>
                          )}
                          {capacityData.available &&
                            capacityData.available_seats < 10 && (
                              <div
                                className="rounded-xl p-3 mt-3"
                                style={{
                                  background: "#fee2e2",
                                  borderWidth: "1px",
                                  borderColor: "#fecaca",
                                }}
                              >
                                <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  Hurry! Only {capacityData.available_seats}{" "}
                                  seats remaining
                                </p>
                              </div>
                            )}
                          {capacityData.available &&
                            capacityData.available_seats >= 10 &&
                            capacityData.available_seats < 20 && (
                              <div
                                className="rounded-xl p-3 mt-3"
                                style={{
                                  background: "#fef3c7",
                                  borderWidth: "1px",
                                  borderColor: "#fbbf24",
                                }}
                              >
                                <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                                  <Info className="w-4 h-4 flex-shrink-0" />
                                  Limited availability -{" "}
                                  {capacityData.available_seats} seats left
                                </p>
                              </div>
                            )}
                          {capacityData.available &&
                            capacityData.available_seats >= 20 && (
                              <div
                                className="rounded-xl p-3 mt-3"
                                style={{
                                  background: "#dcfce7",
                                  borderWidth: "1px",
                                  borderColor: "#bbf7d0",
                                }}
                              >
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  Good availability -{" "}
                                  {capacityData.available_seats} seats available
                                </p>
                              </div>
                            )}
                        </div>
                      ) : (
                        <p
                          className="text-sm font-light"
                          style={{ color: "#272343", opacity: 0.6 }}
                        >
                          Select a date and time to check availability
                        </p>
                      )}
                    </div>
                  )}

                  {/* Special Requirements */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "#272343" }}
                    >
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      {...register("special_requirements")}
                      rows={4}
                      placeholder="Any special requests or requirements..."
                      className="w-full px-4 py-3 border rounded-xl font-light transition-all resize-none"
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

                  {/* Payment Method */}
                  <div>
                    <label
                      className="flex items-center gap-2 text-sm font-medium mb-3"
                      style={{ color: "#272343" }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Payment Method *
                    </label>
                    <select
                      {...register("payment_method")}
                      className="w-full px-4 py-3 border rounded-xl appearance-none font-light transition-all"
                      style={{
                        borderColor: errors.payment_method
                          ? "#fca5a5"
                          : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      onFocus={(e) => {
                        if (!errors.payment_method) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.payment_method) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="paypal">PayPal</option>
                    </select>
                    {errors.payment_method && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-light">
                        <AlertCircle className="w-4 h-4" />
                        {errors.payment_method.message}
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {createBookingMutation.isError && (
                    <div
                      className="rounded-xl p-4 flex items-start gap-3"
                      style={{
                        background: "#fee2e2",
                        borderWidth: "1px",
                        borderColor: "#fecaca",
                      }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 font-light">
                        {(createBookingMutation.error as any)?.response?.data
                          ?.message ||
                          "Failed to create booking. Please try again."}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      createBookingMutation.isPending ||
                      (capacityData && !capacityData.available)
                    }
                    className="w-full px-6 py-4 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "#272343" }}
                    onMouseEnter={(e) => {
                      if (!createBookingMutation.isPending) {
                        e.currentTarget.style.background = "#1a1829";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!createBookingMutation.isPending) {
                        e.currentTarget.style.background = "#272343";
                      }
                    }}
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing Your Booking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Confirm Booking & Pay ${totalAmount.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-3xl p-6 sticky top-6"
                style={{
                  borderWidth: "1px",
                  borderColor: "#bae8e8",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <h2
                  className="text-2xl font-light mb-6"
                  style={{ color: "#272343", letterSpacing: "-0.02em" }}
                >
                  Booking Summary
                </h2>

                {/* Route Info */}
                <div className="space-y-5 mb-6">
                  <div className="flex items-start gap-3">
                    <Ship
                      className="w-5 h-5 mt-0.5"
                      style={{ color: "#272343", opacity: 0.4 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-light mb-1"
                        style={{ color: "#272343", opacity: 0.6 }}
                      >
                        Vessel
                      </p>
                      <p className="font-medium" style={{ color: "#272343" }}>
                        {route.vessel?.name || "Ferry"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-5 h-5 mt-0.5"
                      style={{ color: "#272343", opacity: 0.4 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-light mb-1"
                        style={{ color: "#272343", opacity: 0.6 }}
                      >
                        Route
                      </p>
                      <p className="font-medium" style={{ color: "#272343" }}>
                        {route.origin} → {route.destination}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock
                      className="w-5 h-5 mt-0.5"
                      style={{ color: "#272343", opacity: 0.4 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-light mb-1"
                        style={{ color: "#272343", opacity: 0.6 }}
                      >
                        Duration
                      </p>
                      <p className="font-medium" style={{ color: "#272343" }}>
                        {route.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Capacity Information */}
                {capacityData && bookingDate && departureTime && (
                  <div
                    className="pt-5 mt-5"
                    style={{ borderTop: "1px solid #bae8e8" }}
                  >
                    <h3
                      className="text-sm font-medium mb-3"
                      style={{ color: "#272343" }}
                    >
                      Seat Availability
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span
                          className="text-sm font-light"
                          style={{ color: "#272343", opacity: 0.6 }}
                        >
                          Total Capacity
                        </span>
                        <span className="font-medium" style={{ color: "#272343" }}>
                          {capacityData.vessel_capacity} seats
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className="text-sm font-light"
                          style={{ color: "#272343", opacity: 0.6 }}
                        >
                          Already Booked
                        </span>
                        <span className="font-medium" style={{ color: "#272343" }}>
                          {capacityData.booked_seats} seats
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#272343" }}
                        >
                          Available Seats
                        </span>
                        <span
                          className={`font-bold ${
                            capacityData.available_seats < 10
                              ? "text-red-600"
                              : capacityData.available_seats < 20
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {capacityData.available_seats} seats
                        </span>
                      </div>

                      {/* Availability Status Badge */}
                      {capacityData.available_seats < 10 && (
                        <div
                          className="rounded-xl p-3 mt-2"
                          style={{
                            background: "#fee2e2",
                            borderWidth: "1px",
                            borderColor: "#fecaca",
                          }}
                        >
                          <p
                            className="text-xs font-medium text-red-800 flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Only {capacityData.available_seats} seats left!
                          </p>
                        </div>
                      )}
                      {capacityData.available_seats >= 10 &&
                        capacityData.available_seats < 20 && (
                          <div
                            className="rounded-xl p-3 mt-2"
                            style={{
                              background: "#fef3c7",
                              borderWidth: "1px",
                              borderColor: "#fbbf24",
                            }}
                          >
                            <p
                              className="text-xs font-medium text-yellow-800 flex items-center gap-2"
                            >
                              <Info className="w-4 h-4" />
                              Limited availability
                            </p>
                          </div>
                        )}
                      {!capacityData.available && (
                        <div
                          className="rounded-xl p-3 mt-2"
                          style={{
                            background: "#fee2e2",
                            borderWidth: "1px",
                            borderColor: "#fecaca",
                          }}
                        >
                          <p
                            className="text-xs font-medium text-red-800 flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Not enough seats available for {passengers} passenger(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading State for Capacity */}
                {capacityLoading && bookingDate && departureTime && (
                  <div
                    className="pt-5 mt-5"
                    style={{ borderTop: "1px solid #bae8e8" }}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        style={{ color: "#272343" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span
                        className="text-sm font-light"
                        style={{ color: "#272343", opacity: 0.6 }}
                      >
                        Checking availability...
                      </span>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div
                  className="pt-5 space-y-3"
                  style={{ borderTop: "1px solid #bae8e8" }}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm font-light"
                      style={{ color: "#272343", opacity: 0.6 }}
                    >
                      Price per passenger
                    </span>
                    <span className="font-medium" style={{ color: "#272343" }}>
                      ${route.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm font-light"
                      style={{ color: "#272343", opacity: 0.6 }}
                    >
                      Number of passengers
                    </span>
                    <span className="font-medium" style={{ color: "#272343" }}>
                      × {passengers || 1}
                    </span>
                  </div>
                  <div
                    className="pt-4 mt-3"
                    style={{ borderTop: "1px solid #bae8e8" }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="text-lg font-medium"
                        style={{ color: "#272343" }}
                      >
                        Total Amount
                      </span>
                      <span
                        className="text-3xl font-medium"
                        style={{ color: "#272343" }}
                      >
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mock Payment Notice */}
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    background: "#e3f6f5",
                    borderWidth: "1px",
                    borderColor: "#bae8e8",
                  }}
                >
                  <p
                    className="text-xs font-light leading-relaxed"
                    style={{ color: "#272343", opacity: 0.7 }}
                  >
                    This is a demo payment system. Your booking will be
                    confirmed instantly without actual payment processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Modal - Prompt to create account */}
        {showGuestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div
              className="bg-white rounded-3xl max-w-md w-full p-8 sm:p-10 animate-scale-in"
              style={{
                borderWidth: "1px",
                borderColor: "#bae8e8",
                boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
              }}
            >
              {/* Icon and Header */}
              <div className="text-center mb-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "#e3f6f5" }}
                >
                  <UserPlus
                    className="w-10 h-10"
                    style={{ color: "#272343" }}
                  />
                </div>
                <h2
                  className="text-3xl font-light mb-3"
                  style={{ color: "#272343", letterSpacing: "-0.02em" }}
                >
                  Account Required
                </h2>
                <p
                  className="font-light leading-relaxed"
                  style={{ color: "#272343", opacity: 0.6, fontSize: "15px" }}
                >
                  To complete your booking, please create a free account or
                  sign in. Your booking details have been saved securely.
                </p>
              </div>

              {/* Saved Booking Details */}
              <div
                className="rounded-2xl p-5 mb-8"
                style={{
                  background: "#e3f6f5",
                  borderWidth: "1px",
                  borderColor: "#bae8e8",
                }}
              >
                <h3
                  className="font-medium mb-3"
                  style={{ color: "#272343", fontSize: "15px" }}
                >
                  Your Saved Booking:
                </h3>
                <div
                  className="space-y-2 text-sm font-light"
                  style={{ color: "#272343", opacity: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ opacity: 0.6 }} />
                    <span>
                      {route?.origin} → {route?.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ opacity: 0.6 }} />
                    <span>{passengers} passenger(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" style={{ opacity: 0.6 }} />
                    <span className="font-medium">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-3.5 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                  style={{ background: "#272343" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a1829";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#272343";
                  }}
                >
                  <UserPlus className="w-5 h-5" />
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-xl font-medium transition-all"
                  style={{
                    background: "#bae8e8",
                    color: "#272343",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#a0d8d8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#bae8e8";
                  }}
                >
                  I Already Have an Account
                </button>
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="w-full py-2.5 text-sm font-light transition-colors"
                  style={{ color: "#272343", opacity: 0.6 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.6";
                  }}
                >
                  Go Back to Form
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
