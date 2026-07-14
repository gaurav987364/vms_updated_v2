/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/ResetPasswordPage.tsx

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react"
import { authApi } from "@/services/api/authApi"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/shared/schemas/zodSchema"

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState(false)
  const [codeError, setCodeError] = useState("")

  const verificationCode = searchParams.get("code")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    // Validate code exists
    if (!verificationCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCodeError("Invalid or missing reset code. Please request a new password reset link.")
    }
  }, [verificationCode])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setApiError("")

    if (!verificationCode) {
      setApiError("Invalid reset code")
      return
    }

    try {
      await authApi.resetPassword({
        password: data.password,
        verificationCode,
      })

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true })
      }, 3000)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reset password"

      if (errorMessage.includes("Invalid") || errorMessage.includes("Expired")) {
        setApiError("This reset link has expired or is invalid. Please request a new one.")
      } else {
        setApiError(errorMessage)
      }
    }
  }

  const handleRedirectToLogin = () => {
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-[var(--color-border)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Reset Your Password
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Enter your new password below
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {success ? (
              // Success State
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10 text-[var(--color-success)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  Password Reset Successfully!
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                  Your password has been updated. Redirecting you to login page...
                </p>
                <button
                  onClick={handleRedirectToLogin}
                  className="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Go to Login Now
                </button>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                      size={18}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Enter new password"
                      className={`w-full pl-10 pr-12 py-3 bg-[var(--color-background)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] ${
                        errors.password ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                      }`}
                      disabled={isSubmitting || !verificationCode}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-[var(--color-danger)] mt-1.5">{errors.password.message}</p>
                  )}
                  {!errors.password && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                      Must be 6-12 characters long
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                      size={18}
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="Confirm new password"
                      className={`w-full pl-10 pr-12 py-3 bg-[var(--color-background)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] ${
                        errors.confirmPassword ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                      }`}
                      disabled={isSubmitting || !verificationCode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-[var(--color-danger)] mt-1.5">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Error Messages */}
                {(codeError || apiError) && (
                  <div className="flex items-start gap-2 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg animate-in slide-in-from-top-2 duration-200">
                    <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--color-danger)]">{codeError || apiError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !verificationCode}
                  className="w-full px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={handleRedirectToLogin}
                  className="w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Premier Seals VMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
