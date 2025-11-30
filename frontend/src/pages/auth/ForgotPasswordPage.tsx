import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { passwordResetService } from '../../services/passwordReset';
import type { SendResetLinkRequest } from '../../services/passwordReset';
import { Mail, AlertCircle, CheckCircle, Ship, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await passwordResetService.sendResetLink(data as SendResetLinkRequest);
      setSuccessMessage(response.message);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        'Failed to send reset link. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#e3f6f5" }}
    >
      {/* Navbar */}
      <Navbar transparent={false} showAuthButtons={true} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center">
            <div
              className="mx-auto h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-xl sm:rounded-2xl shadow-lg"
              style={{ background: "#272343" }}
            >
              <Ship className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2
              className="mt-5 sm:mt-6 text-2xl sm:text-3xl font-light tracking-tight"
              style={{ color: "#272343", letterSpacing: "-0.02em" }}
            >
              Reset your password
            </h2>
            <p
              className="mt-2 text-sm font-light px-4"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form Card */}
          <div
            className="mt-6 sm:mt-8 bg-white py-6 sm:py-8 px-5 sm:px-6 rounded-2xl sm:rounded-3xl"
            style={{
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              borderWidth: "1px",
              borderColor: "#bae8e8",
            }}
          >
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Success Alert */}
              {successMessage && (
                <div
                  className="rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
                  style={{
                    background: "#e3f6f5",
                    borderWidth: "1px",
                    borderColor: "#bae8e8",
                  }}
                >
                  <CheckCircle
                    className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#272343" }}
                  />
                  <p
                    className="text-xs sm:text-sm font-light break-words"
                    style={{ color: "#272343", opacity: 0.8 }}
                  >
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div
                  className="rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
                  style={{
                    background: "#fee2e2",
                    borderWidth: "1px",
                    borderColor: "#fecaca",
                  }}
                >
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-800 font-light break-words">{errorMessage}</p>
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
                    {...register('email')}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border-transparent rounded-lg sm:rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-light px-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 transition-colors"
              style={{ color: "#272343", opacity: 0.7 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              Back to login
            </Link>
            <span style={{ color: "#272343", opacity: 0.3 }} className="hidden sm:inline">•</span>
            <Link
              to="/register"
              className="transition-colors"
              style={{ color: "#272343", opacity: 0.7 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
