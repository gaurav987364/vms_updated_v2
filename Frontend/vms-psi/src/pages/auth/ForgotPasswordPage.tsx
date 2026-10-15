// src/pages/auth/ForgotPasswordPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Code2 } from "lucide-react";
import { authApi } from "@/services/api/authApi";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setEmailError("");

    // Validate email
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset email";

      if (errorMessage.includes("Too many")) {
        setApiError("Too many reset attempts. Please try again later.");
      } else if (errorMessage.includes("not found") || errorMessage.includes("Not Found")) {
        setApiError("No account found with this email address.");
      } else {
        setApiError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b-2 border-[var(--color-border)] bg-gradient-to-br from-[#ff6b35]/5 to-transparent">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#f77f00] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#ff6b35]/30">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              No worries! Enter your email and we'll send you reset instructions
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {success ? (
              // Success State
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10 text-[#ff6b35]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  Check Your Email! 📧
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                  We've sent password reset instructions to:
                </p>
                <p className="text-sm font-semibold text-[#ff6b35] mb-6">{email}</p>
                <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    <strong className="text-[var(--color-text-primary)]">Next steps:</strong>
                  </p>
                  <ul className="text-sm text-[var(--color-text-secondary)] mt-2 space-y-1 list-disc list-inside">
                    <li>Check your inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new password</li>
                    <li>Link expires in 1 hour</li>
                  </ul>
                </div>
                <button
                  onClick={handleBackToLogin}
                  className="w-full px-6 py-3 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg font-medium transition-all cursor-pointer"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full mt-3 text-sm text-[var(--color-text-secondary)] hover:text-[#ff6b35] transition-colors cursor-pointer"
                >
                  Didn't receive it? Resend
                </button>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        setApiError("");
                      }}
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-3 bg-[var(--color-background)] border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] transition-all ${
                        emailError || apiError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                      }`}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-[var(--color-danger)] mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {apiError && (
                  <div className="flex items-start gap-2 p-4 bg-[var(--color-danger)]/10 border-2 border-[var(--color-danger)]/30 rounded-lg animate-in slide-in-from-top-2 duration-200">
                    <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--color-danger)]">{apiError}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    <strong className="text-blue-400">Rate limit:</strong> You can request a password reset 2 times per 3 minutes
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-[#ff6b35]/30 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[#ff6b35] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 DSA Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
