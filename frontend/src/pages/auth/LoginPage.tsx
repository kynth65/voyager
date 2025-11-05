import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Ship,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  // Check for password reset success message and pending booking
  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessMessage(
        "Your password has been reset successfully! You can now sign in with your new password."
      );
    }

    // Check for pending booking
    const storedBooking = localStorage.getItem("pending_booking");
    if (storedBooking) {
      try {
        setPendingBooking(JSON.parse(storedBooking));
      } catch (e) {
        console.error("Failed to parse pending booking:", e);
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(data);

      // Check if there's a pending booking
      if (pendingBooking) {
        // Redirect to booking confirmation page instead of dashboard
        navigate("/confirm-booking");
      } else {
        // Normal login flow
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#e3f6f5" }}
    >
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Navbar */}
        <Navbar transparent={false} showAuthButtons={true} />
        <div className="max-w-md w-full">
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
              Welcome to Voyager
            </h2>
            <p
              className="mt-2 text-sm font-light"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Sign in to manage your travel bookings
            </p>
          </div>

          {/* Form Card */}
          <div
            className="mt-8 bg-white py-8 px-6 rounded-3xl"
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
                    Sign in to complete your ferry booking from{" "}
                    {pendingBooking.route?.origin} to{" "}
                    {pendingBooking.route?.destination}.
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Success Alert */}
              {successMessage && (
                <div
                  className="rounded-xl p-4 flex items-start space-x-3"
                  style={{
                    background: "#e3f6f5",
                    borderWidth: "1px",
                    borderColor: "#bae8e8",
                  }}
                >
                  <CheckCircle
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#272343" }}
                  />
                  <p
                    className="text-sm font-light"
                    style={{ color: "#272343", opacity: 0.8 }}
                  >
                    {successMessage}
                  </p>
                </div>
              )}

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

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  Email address
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

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  Password
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
                    autoComplete="current-password"
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
                <div className="text-sm text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="font-medium transition-colors"
                    style={{ color: "#272343", opacity: 0.7 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                  >
                    Forgot your password?
                  </Link>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in
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
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: "#272343" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Create one now
            </Link>
          </p>

          {/* Demo Credentials */}
          <div
            className="mt-6 bg-white rounded-xl p-4"
            style={{
              borderWidth: "1px",
              borderColor: "#bae8e8",
            }}
          >
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "#272343" }}
            >
              Demo Credentials:
            </p>
            <div
              className="text-xs font-light space-y-1"
              style={{ color: "#272343", opacity: 0.7 }}
            >
              <p>
                Admin: <span className="font-mono">admin@voyager.com</span>
              </p>
              <p>
                Agent: <span className="font-mono">agent@voyager.com</span>
              </p>
              <p>
                Customer:{" "}
                <span className="font-mono">customer@voyager.com</span>
              </p>
              <p>
                Password: <span className="font-mono">password</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
