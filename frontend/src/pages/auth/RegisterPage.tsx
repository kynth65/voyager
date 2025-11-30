import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, Ship } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getPendingBooking } from '../../utils/pendingBooking';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  // Check for pending booking on mount
  useEffect(() => {
    const storedBooking = getPendingBooking();
    if (storedBooking) {
      setPendingBooking(storedBooking);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Combine first_name and last_name to create the name field
      const registrationData = {
        ...data,
        name: `${data.first_name} ${data.last_name}`.trim(),
      };

      await registerUser(registrationData);

      // Check if there's a pending booking by reading from localStorage directly
      // This ensures we get the latest value and avoid state timing issues
      const storedBooking = getPendingBooking();
      if (storedBooking) {
        // Redirect back to the booking page with the route ID
        // The booking page will automatically restore the form data
        navigate(`/booking/${storedBooking.route_id}`);
      } else {
        // Normal registration flow
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        setError(errorMessages as string);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#e3f6f5" }}>
      {/* Navbar */}
      <Navbar transparent={false} showAuthButtons={true} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center">
            <div
              className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl shadow-lg"
              style={{ background: "#272343" }}
            >
              <Ship className="h-8 w-8 text-white" />
            </div>
            <h2
              className="mt-6 text-3xl font-light tracking-tight"
              style={{ color: "#272343", letterSpacing: "-0.02em" }}
            >
              Create your account
            </h2>
            <p
              className="mt-2 text-sm font-light"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Join Voyager and start managing your travel bookings
            </p>
          </div>

          {/* Form Card */}
          <div
            className="mt-8 bg-white py-8 px-6 sm:px-8 rounded-3xl"
            style={{
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              borderWidth: "1px",
              borderColor: "#bae8e8",
            }}
          >
            {/* Pending Booking Notice */}
            {pendingBooking && (
              <div
                className="rounded-xl p-4 mb-6 flex items-start space-x-3"
                style={{
                  background: "#e3f6f5",
                  borderWidth: "1px",
                  borderColor: "#bae8e8",
                }}
              >
                <Ship
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: "#272343" }}
                />
                <div className="flex-1">
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "#272343" }}
                  >
                    Booking in Progress
                  </p>
                  <p
                    className="text-sm font-light"
                    style={{ color: "#272343", opacity: 0.7 }}
                  >
                    Complete registration to finalize your ferry booking from{" "}
                    {pendingBooking.route?.origin} to{" "}
                    {pendingBooking.route?.destination}.
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Error Alert */}
              {error && (
                <div
                  className="rounded-xl p-4 flex items-start space-x-3"
                  style={{
                    background: "#fee2e2",
                    borderWidth: "1px",
                    borderColor: "#fecaca",
                  }}
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-light">{error}</p>
                </div>
              )}

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#272343" }}
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User
                        className="h-4 w-4"
                        style={{ color: "#272343", opacity: 0.3 }}
                      />
                    </div>
                    <input
                      {...register("first_name")}
                      id="first_name"
                      type="text"
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all ${
                        errors.first_name ? "border-red-300" : ""
                      }`}
                      style={{
                        borderColor: errors.first_name ? "#fca5a5" : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      placeholder="John"
                      onFocus={(e) => {
                        if (!errors.first_name) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.first_name) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center font-light">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#272343" }}
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User
                        className="h-4 w-4"
                        style={{ color: "#272343", opacity: 0.3 }}
                      />
                    </div>
                    <input
                      {...register("last_name")}
                      id="last_name"
                      type="text"
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all ${
                        errors.last_name ? "border-red-300" : ""
                      }`}
                      style={{
                        borderColor: errors.last_name ? "#fca5a5" : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      placeholder="Doe"
                      onFocus={(e) => {
                        if (!errors.last_name) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.last_name) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center font-light">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      className="h-4 w-4"
                      style={{ color: "#272343", opacity: 0.3 }}
                    />
                  </div>
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all ${
                      errors.email ? "border-red-300" : ""
                    }`}
                    style={{
                      borderColor: errors.email ? "#fca5a5" : "#bae8e8",
                      color: "#272343",
                      fontSize: "15px",
                    }}
                    placeholder="john@example.com"
                    onFocus={(e) => {
                      if (!errors.email) {
                        e.currentTarget.style.borderColor = "#272343";
                        e.currentTarget.style.outline = "none";
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.currentTarget.style.borderColor = "#bae8e8";
                      }
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center font-light">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone
                      className="h-4 w-4"
                      style={{ color: "#272343", opacity: 0.3 }}
                    />
                  </div>
                  <input
                    {...register("phone")}
                    id="phone"
                    type="tel"
                    className="block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all"
                    style={{
                      borderColor: "#bae8e8",
                      color: "#272343",
                      fontSize: "15px",
                    }}
                    placeholder="+1 (555) 000-0000"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#272343";
                      e.currentTarget.style.outline = "none";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#bae8e8";
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#272343" }}
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock
                        className="h-4 w-4"
                        style={{ color: "#272343", opacity: 0.3 }}
                      />
                    </div>
                    <input
                      {...register("password")}
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all ${
                        errors.password ? "border-red-300" : ""
                      }`}
                      style={{
                        borderColor: errors.password ? "#fca5a5" : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      placeholder="••••••••"
                      onFocus={(e) => {
                        if (!errors.password) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.password) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center font-light">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password_confirmation"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#272343" }}
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock
                        className="h-4 w-4"
                        style={{ color: "#272343", opacity: 0.3 }}
                      />
                    </div>
                    <input
                      {...register("password_confirmation")}
                      id="password_confirmation"
                      type="password"
                      autoComplete="new-password"
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all ${
                        errors.password_confirmation ? "border-red-300" : ""
                      }`}
                      style={{
                        borderColor: errors.password_confirmation
                          ? "#fca5a5"
                          : "#bae8e8",
                        color: "#272343",
                        fontSize: "15px",
                      }}
                      placeholder="••••••••"
                      onFocus={(e) => {
                        if (!errors.password_confirmation) {
                          e.currentTarget.style.borderColor = "#272343";
                          e.currentTarget.style.outline = "none";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.password_confirmation) {
                          e.currentTarget.style.borderColor = "#bae8e8";
                        }
                      }}
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center font-light">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border-transparent rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#272343",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = "#1a1829";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = "#272343";
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p
            className="mt-6 text-center text-sm font-light"
            style={{ color: "#272343", opacity: 0.7 }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: "#272343" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
