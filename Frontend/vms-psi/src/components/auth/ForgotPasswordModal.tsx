/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/auth/ForgotPasswordModal.tsx

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { authApi } from "@/services/api/authApi"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/shared/schemas/zodSchema"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const email = watch("email")

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setApiError("")

    try {
      await authApi.forgotPassword(data.email)
      setSuccess(true)
    } catch (err: any) {
      setApiError(err.message || "Failed to send reset email. Please try again.")
    }
  }

  const handleClose = () => {
    reset()
    setApiError("")
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 px-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-[var(--color-background)] transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              <X size={20} className="text-[var(--color-text-secondary)]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Forgot Password?
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No worries, we'll send you reset instructions
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              // Success State
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  Email Sent Successfully!
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and spam folder.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Got it, thanks!
                </button>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      {...register("email")}
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-3 bg-[var(--color-background)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] ${
                        errors.email ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                      }`}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-[var(--color-danger)] mt-1.5">{errors.email.message}</p>
                  )}
                </div>

                {/* API Error Message */}
                {apiError && (
                  <div className="flex items-start gap-2 p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--color-danger)]">{apiError}</p>
                  </div>
                )}

                {/* Info Message */}
                <div className="flex items-start gap-2 p-3 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-[var(--color-info)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    We'll send you a secure link to reset your password. The link expires in 1 hour.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-background)] transition-colors cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
