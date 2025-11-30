import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { passwordResetService } from '../../services/passwordReset';
import type { ResetPasswordRequest } from '../../services/passwordReset';
import { Lock, AlertCircle, Ship, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setValidationError('Invalid or missing reset link.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await passwordResetService.validateToken({ token, email });
        if (!response.valid) {
          setValidationError(response.message);
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message || 'Failed to validate reset token. Please try again.';
        setValidationError(message);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      setErrorMessage('Invalid or missing reset link.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const requestData: ResetPasswordRequest = {
        email,
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      await passwordResetService.resetPassword(requestData);

      // Redirect to login page with success message
      navigate('/login?reset=success');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.password?.[0] ||
        error.response?.data?.errors?.token?.[0] ||
        'Failed to reset password. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#e3f6f5" }}
      >
        <Navbar transparent={false} showAuthButtons={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Ship
              className="w-12 h-12 sm:w-16 sm:h-16 animate-bounce mx-auto mb-4"
              style={{ color: "#272343" }}
            />
            <p className="text-sm sm:text-base" style={{ color: "#272343" }}>
              Validating reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#e3f6f5" }}
      >
        <Navbar transparent={false} showAuthButtons={true} />
        <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
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
                Invalid Reset Link
              </h2>
            </div>

            <div
              className="mt-6 sm:mt-8 bg-white py-6 sm:py-8 px-5 sm:px-6 rounded-2xl sm:rounded-3xl"
              style={{
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                borderWidth: "1px",
                borderColor: "#bae8e8",
              }}
            >
              <div
                className="rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 mb-6"
                style={{
                  background: "#fee2e2",
                  borderWidth: "1px",
                  borderColor: "#fecaca",
                }}
              >
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800 mb-1">
                    {validationError}
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700 font-light">
                    This reset link may have expired or already been used.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/forgot-password"
                  className="w-full flex justify-center py-3 sm:py-3.5 px-4 border-transparent rounded-lg sm:rounded-xl font-medium text-white transition-all duration-200 active:scale-95"
                  style={{
                    background: "#272343",
                    fontSize: "15px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a1829";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#272343";
                  }}
                >
                  Request new reset link
                </Link>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 sm:py-3.5 px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 active:scale-95"
                  style={{
                    background: "#bae8e8",
                    color: "#272343",
                    fontSize: "15px",
                    borderWidth: "1px",
                    borderColor: "#bae8e8",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#272343";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#bae8e8";
                    e.currentTarget.style.color = "#272343";
                  }}
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#e3f6f5" }}
    >
      <Navbar transparent={false} showAuthButtons={true} />

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
              Set new password
            </h2>
            <p
              className="mt-2 text-sm font-light px-4"
              style={{ color: "#272343", opacity: 0.6 }}
            >
              Enter your new password below.
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

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className="h-4 w-4"
                      style={{ color: "#272343", opacity: 0.3 }}
                    />
                  </div>
                  <input
                    {...register('password')}
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

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#272343" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className="h-4 w-4"
                      style={{ color: "#272343", opacity: 0.3 }}
                    />
                  </div>
                  <input
                    {...register('password_confirmation')}
                    id="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl font-light transition-all ${
                      errors.password_confirmation ? "border-red-300" : ""
                    }`}
                    style={{
                      borderColor: errors.password_confirmation ? "#fca5a5" : "#bae8e8",
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
                    Resetting password...
                  </>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm font-light px-2">
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  );
}
