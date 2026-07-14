/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/LoginPage.tsx

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Building2,
  FileText,
  Info,       // NEW: For supplier login type icon
  Hash,        // NEW: For supplier code icon
  CheckCircle, // NEW: For selected login type indicator
} from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import "@/config/login-animations.css"
import { useTypewriter } from "@/shared/hooks/useTypewriter"
import { loginSchema, type LoginFormValues } from "@/shared/schemas/zodSchema"
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal"
import { useDebouncedValue } from "@/shared/hooks/useDebounce"  // NEW: For debouncing supplier status check
import { authApi } from "@/services/api/authApi"           // NEW: For checking supplier paid status

const ROLE_WORDS = ["Procurement Managers", "Finance Teams", "Plant Heads", "Vendor Partners"]

const TICKER_EVENTS = [
  'Vendor "Anand Tooling Co." onboarded',
  "PO #4021 approved by Plant Head",
  "Invoice #INV-1187 marked paid",
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, error: authError, clearError } = useAuth()

  // OLD CODE (commented for reference):
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting },
  // } = useForm<LoginFormValues>({
  //   resolver: zodResolver(loginSchema),
  //   defaultValues: { email: "", password: "", rememberMe: false },
  // })

  // NEW CODE: Added watch and setValue for dynamic form control
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LoginFormValues>({
    //@ts-ignore
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginType: "user",
      email: "",
      supplierCode: "",
      password: "",
      rememberMe: false,
      isPaidSupplier: false,
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)

  // NEW STATE: For supplier paid status management
  const [isPaidSupplier, setIsPaidSupplier] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // NEW: Watch form values for dynamic behavior
  const loginType = watch("loginType")
  const emailValue = watch("email")
  const supplierCodeValue = watch("supplierCode")

  // Log values for debugging
  useEffect(() => {
    console.log("📝 Form values - loginType:", loginType, "supplierCode:", supplierCodeValue, "email:", emailValue)
  }, [loginType, supplierCodeValue, emailValue])

  // NEW: Debounce the identifier (email or supplier code) for status check
  // Ensure debouncedIdentifier is treated as string | undefined to avoid `never` type errors
  const debouncedIdentifier = useDebouncedValue(
    //@ts-ignore
    loginType === "supplier" ? (supplierCodeValue || emailValue) : "",
    500
  ) as string | undefined

  const searchParams = new URLSearchParams(location.search)
  const sessionExpiredReason = searchParams.get("reason")
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(() =>
    sessionExpiredReason === "session_expired"
      ? "Your session was ended because you logged in from another device."
      : null
  )

  const from = (location.state as any)?.from?.pathname || "/"

  // NEW: Check supplier paid status when identifier changes
  useEffect(() => {
    const checkSupplierStatus = async () => {
      if (loginType === "supplier" && debouncedIdentifier && typeof debouncedIdentifier === "string" && debouncedIdentifier.length >= 3) {
        console.log("🔍 Checking supplier status for:", debouncedIdentifier)
        setIsCheckingStatus(true)
        try {
          const response = await authApi.checkSupplierStatus(debouncedIdentifier)
          console.log("✅ Supplier status response:", response)
          setIsPaidSupplier(response.isPaid)
          setValue("isPaidSupplier", response.isPaid)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.error("❌ Error checking supplier status:", error)
          setIsPaidSupplier(false)
          setValue("isPaidSupplier", false)
        } finally {
          setIsCheckingStatus(false)
        }
      } else {
        console.log("ℹ️ Not checking status. loginType:", loginType, "identifier:", debouncedIdentifier)
        setIsPaidSupplier(false)
        setValue("isPaidSupplier", false)
      }
    }

    checkSupplierStatus()
  }, [debouncedIdentifier, loginType, setValue])

  // OLD CODE (commented for reference):
  // const onSubmit = async (data: LoginFormValues) => {
  //   try {
  //     clearError()
  //     await login({ email: data.email, password: data.password })
  //     navigate(from, { replace: true })
  //   } catch (error) {
  //     console.error("Login failed:", error)
  //   }
  // }

  // NEW CODE: Updated to handle both user and supplier login
  const onSubmit = async (data: LoginFormValues) => {
    try {
      clearError()

      // Prepare login data based on type
      const loginData: any = {
        password: data.password,
        loginType: data.loginType,
      }

      if (data.loginType === "user") {
        loginData.email = data.email
      } else {
        // Supplier login - use supplierCode if provided, otherwise email
        if (data.supplierCode) {
          loginData.supplierCode = data.supplierCode
        } else {
          loginData.email = data.email
        }
      }

      await login(loginData)
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  return (
    // KEY FIX: only lock to viewport height + hide overflow on lg+ (side-by-side).
    // Below lg (stacked), let the page grow naturally and scroll — nothing gets clipped.
    <div className="min-h-screen w-full flex flex-col lg:flex-row lg:h-screen overflow-y-auto lg:overflow-hidden">
      <BrandPanel />
      {/* OLD CODE (commented for reference):
      <FormPanel
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        showPassword={showPassword}
        authError={authError}
        sessionExpiredMessage={sessionExpiredMessage}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={handleSubmit<LoginFormValues>(onSubmit)}
        onForgotPassword={() => setIsForgotPasswordOpen(true)}
        onDismissSessionMessage={() => setSessionExpiredMessage(null)}
      />
      */}

      {/* NEW CODE: Added new props for supplier login support */}
      <FormPanel
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        showPassword={showPassword}
        authError={authError}
        sessionExpiredMessage={sessionExpiredMessage}
        loginType={loginType}
        isPaidSupplier={isPaidSupplier}
        isCheckingStatus={isCheckingStatus}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        //@ts-ignore
        onSubmit={handleSubmit(onSubmit)}
        onForgotPassword={() => setIsForgotPasswordOpen(true)}
        onDismissSessionMessage={() => setSessionExpiredMessage(null)}
        onLoginTypeChange={(type) => setValue("loginType", type)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  )
}

/* ========================================================
   BRAND PANEL
   ======================================================== */
function BrandPanel() {
  const roleRef = useTypewriter(ROLE_WORDS)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafId.current !== null) return

    const clientX = e.clientX
    const clientY = e.clientY

    rafId.current = requestAnimationFrame(() => {
      const el = panelRef.current
      const spotlight = spotlightRef.current
      if (el && spotlight) {
        const rect = el.getBoundingClientRect()
        const x = ((clientX - rect.left) / rect.width) * 100
        const y = ((clientY - rect.top) / rect.height) * 100
        spotlight.style.background = `radial-gradient(circle 220px at ${x}% ${y}%, rgba(96,165,250,0.18), transparent 70%)`
      }
      rafId.current = null
    })
  }, [])

  useEffect(() => {
    const hasHover = window.matchMedia("(hover: hover)").matches
    if (!hasHover) return

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const hasHoverCapability =
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches

  return (
    <div
      ref={panelRef}
      onMouseMove={hasHoverCapability ? handleMouseMove : undefined}
      // md:min-h-[50vh] -> genuine top/bottom equal split on tablets.
      // No forced min-height below md -> mobile shrinks to fit its (reduced) content.
      className="relative w-full lg:w-1/2 md:min-h-[50vh] bg-[var(--color-sidebar-bg)] overflow-hidden p-6 sm:p-8 lg:p-12 flex flex-col justify-between"
    >
      {/* Cursor spotlight overlay */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle 220px at 50% 50%, rgba(96,165,250,0.1), transparent 70%)" }}
      />

      {/* Ambient floating gradient blobs */}
      <div className="anim-blob-1 absolute -top-20 -right-16 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.4)_0%,transparent_70%)] blur-2xl" />
      <div className="anim-blob-2 absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.35)_0%,transparent_70%)] blur-2xl" />
      <div className="anim-blob-1 absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.25)_0%,transparent_70%)] blur-3xl" style={{ animationDelay: "2s", animationDuration: "8s" }} />

      {/* Drifting dot grid */}
      <div
        className="anim-grid-drift absolute inset-0 opacity-50"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />

      {/* Circuit lines — hidden below lg, they add clutter with no room to breathe */}
      <svg className="hidden lg:block absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 540" preserveAspectRatio="none">
        <path d="M 40 60 L 160 60 L 160 140 L 300 140" stroke="#3b82f6" strokeWidth="1" fill="none" strokeDasharray="6 6" className="anim-dash" style={{ animationDuration: "4s" }} />
        <circle cx="160" cy="60" r="2.5" fill="#60a5fa" className="anim-dot-pulse" />
        <circle cx="160" cy="140" r="2.5" fill="#60a5fa" className="anim-dot-pulse" style={{ animationDelay: "0.4s" }} />
      </svg>

      {/* Rising particles — hidden below lg (pure decoration, costs vertical space) */}
      <div className="hidden lg:block">
        {[
          { left: "15%", duration: "6s", delay: "0s" },
          { left: "35%", duration: "8s", delay: "1.5s" },
          { left: "55%", duration: "7s", delay: "3s" },
        ].map((p, i) => (
          <div key={i} className="anim-particle absolute bottom-0 w-1 h-1 rounded-full bg-[var(--color-secondary-hover)]" style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay }} />
        ))}
      </div>

      {/* Floating module chips — THIS was the main collision culprit on tablet/mobile
          (fixed % positions overlapping the heading). Desktop-only now. */}
      <div className="hidden lg:block">
        <div className="chip-wrap" style={{ top: "16%", right: "8%", animationDelay: "1s" }}>
          <div className="chip-inner-1 flex items-center gap-2.5 rounded-xl border border-white/30 bg-[rgba(15,23,42,0.65)] px-4 py-2.5 shadow-xl backdrop-blur-md whitespace-nowrap">
            <Building2 size={16} className="text-[#60a5fa]" />
            <span className="text-xs font-bold text-slate-100">Vendor Onboarding</span>
          </div>
        </div>
        <div className="chip-wrap" style={{ top: "46%", right: "3%", animationDelay: "1.2s" }}>
          <div className="chip-inner-2 flex items-center gap-2.5 rounded-xl border border-white/30 bg-[rgba(15,23,42,0.65)] px-4 py-2.5 shadow-xl backdrop-blur-md whitespace-nowrap">
            <FileText size={16} className="text-[var(--color-secondary-hover)]" />
            <span className="text-xs font-bold text-slate-100">Invoice Tracking</span>
          </div>
        </div>
        <div className="chip-wrap" style={{ top: "72%", right: "12%", animationDelay: "1.4s" }}>
          <div className="chip-inner-1 flex items-center gap-2.5 rounded-xl border border-white/30 bg-[rgba(15,23,42,0.65)] px-4 py-2.5 shadow-xl backdrop-blur-md whitespace-nowrap">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold text-slate-100">Auto Approvals</span>
          </div>
        </div>
      </div>

      {/* ---------- Foreground content ---------- */}
      <div className="relative z-10">
        <div className="anim-fade-in flex items-center gap-3" style={{ animationDelay: "0.1s" }}>
          <img
            loading="lazy"
            src="/PS_logo_dark_theme_fix.png"
            alt="Premier Seals"
            className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
          />
        </div>

        <h1
          className="anim-fade-in text-white text-2xl sm:text-3xl lg:text-4xl xl:text-[44px] font-bold leading-tight mt-4 mb-1"
          style={{ animationDelay: "0.25s" }}
        >
          Built for
          <br />
          <span className="anim-shimmer bg-gradient-to-r from-blue-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            precision procurement.
          </span>
        </h1>

        <p
          className="anim-fade-in text-slate-300 text-sm sm:text-base lg:text-lg mb-2 flex flex-wrap gap-2 items-center"
          style={{ animationDelay: "0.4s" }}
        >
          Trusted daily by{" "}
          <span ref={roleRef} className="text-[var(--color-secondary-hover)] font-bold inline-block min-w-[120px] sm:min-w-[160px]" />
        </p>
        <p
          className="anim-fade-in text-slate-400 text-xs sm:text-sm lg:text-base leading-relaxed max-w-full sm:max-w-[420px] mb-5 sm:mb-6 lg:mb-8"
          style={{ animationDelay: "0.5s" }}
        >
          Onboarding, contracts, purchase orders, invoicing and approvals — all in one powerful platform.
        </p>

        {/* Feature highlights */}
        <div className="anim-fade-in space-y-2 sm:space-y-3 mb-5 sm:mb-6 lg:mb-8" style={{ animationDelay: "0.6s" }}>
          {[
            { icon: "✓", text: "Real-time vendor collaboration" },
            { icon: "✓", text: "Automated approval workflows" },
            { icon: "✓", text: "Complete audit trail & compliance" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-300">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold shrink-0">
                {feature.icon}
              </span>
              <span className="text-xs sm:text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Ticker: hidden on mobile only — not essential, and the space is worth more there */}
        <div className="hidden sm:block">
          <ActivityTicker events={TICKER_EVENTS} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 border-t border-white/10 pt-4 sm:pt-6">
          {[
            { value: "200+", label: "Active vendors", icon: "👥" },
            { value: "15+", label: "Years operating", icon: "⭐" },
            { value: "Pune", label: "Manufacturing HQ", icon: "📍" },
          ].map((stat, i) => (
            <div key={stat.label} className="anim-fade-in" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
              <div className="text-base sm:text-xl mb-1">{stat.icon}</div>
              <div className="text-white text-base sm:text-xl lg:text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-slate-400 text-[10px] sm:text-[11px] lg:text-xs font-medium leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Security badge */}
        <div className="anim-fade-in mt-4 sm:mt-6 flex flex-wrap items-center gap-2 text-slate-500 text-[10px] sm:text-xs" style={{ animationDelay: "1s" }}>
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Enterprise-grade security • ISO 27001 Certified</span>
        </div>
      </div>
    </div>
  )
}

function ActivityTicker({ events }: { events: string[] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % events.length)
        setVisible(true)
      }, 250)
    }, 3200)

    return () => clearInterval(interval)
  }, [events.length])

  return (
    <div className="relative h-4 mb-4">
      <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-hover)] shrink-0" />
        {events[index]}
      </div>
    </div>
  )
}

/* ========================================================
   FORM PANEL
   ======================================================== */
// OLD INTERFACE (commented for reference):
// interface FormPanelProps {
//   register: ReturnType<typeof useForm<LoginFormValues>>["register"]
//   errors: ReturnType<typeof useForm<LoginFormValues>>["formState"]["errors"]
//   isSubmitting: boolean
//   showPassword: boolean
//   authError: string | null
//   sessionExpiredMessage: string | null
//   onTogglePassword: () => void
//   onSubmit: (e?: React.BaseSyntheticEvent) => void
//   onForgotPassword: () => void
//   onDismissSessionMessage: () => void
// }

// NEW INTERFACE: Added props for supplier login support
interface FormPanelProps {
  register: ReturnType<typeof useForm<LoginFormValues>>["register"]
  errors: ReturnType<typeof useForm<LoginFormValues>>["formState"]["errors"]
  isSubmitting: boolean
  showPassword: boolean
  authError: string | null
  sessionExpiredMessage: string | null
  loginType: "user" | "supplier"
  isPaidSupplier: boolean
  isCheckingStatus: boolean
  onTogglePassword: () => void
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  onForgotPassword: () => void
  onDismissSessionMessage: () => void
  onLoginTypeChange: (type: "user" | "supplier") => void
}

// OLD FUNCTION SIGNATURE (commented for reference):
// function FormPanel({
//   register,
//   errors,
//   isSubmitting,
//   showPassword,
//   authError,
//   sessionExpiredMessage,
//   onTogglePassword,
//   onSubmit,
//   onForgotPassword,
//   onDismissSessionMessage,
// }: FormPanelProps) {

// NEW FUNCTION SIGNATURE: Added new props
function FormPanel({
  register,
  errors,
  isSubmitting,
  showPassword,
  authError,
  sessionExpiredMessage,
  loginType,
  isPaidSupplier,
  isCheckingStatus,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onDismissSessionMessage,
  onLoginTypeChange,
}: FormPanelProps) {
  return (
    <div className="w-full lg:w-1/2 md:min-h-[50vh] bg-[var(--color-background)] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-[420px]">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-8 lg:p-10">
          {/* Header with logo */}
          <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] sm:text-[22px] lg:text-[25px] font-semibold text-[var(--color-text-primary)] mb-1 leading-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-snug">
                Sign in to continue to your workspace
              </p>
            </div>

            <img
              src="/ms_logo_fix.png"
              alt="Mushin Seals"
              className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 object-contain shrink-0"
              loading="lazy"
            />
          </div>

          {sessionExpiredMessage && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-amber-600 dark:text-amber-400">{sessionExpiredMessage}</p>
                </div>
                <button type="button" onClick={onDismissSessionMessage} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
              </div>
            </div>
          )}

          {/* NEW: Login Type Selector with Checkboxes */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] tracking-wide">
              LOGIN TYPE
            </label>
            <div className="flex items-center gap-6">
              {/* User Radio */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="loginType"
                    value="user"
                    checked={loginType === "user"}
                    onChange={() => onLoginTypeChange("user")}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border-2 border-[var(--color-border)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] transition-all duration-200 flex items-center justify-center">
                    {loginType === "user" && (
                      <CheckCircle size={12} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium transition-colors ${loginType === "user" ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"}`}>
                  User
                </span>
              </label>

              {/* Supplier Radio */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="loginType"
                    value="supplier"
                    checked={loginType === "supplier"}
                    onChange={() => onLoginTypeChange("supplier")}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border-2 border-[var(--color-border)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] transition-all duration-200 flex items-center justify-center">
                    {loginType === "supplier" && (
                      <CheckCircle size={12} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium transition-colors ${loginType === "supplier" ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"}`}>
                  Supplier
                </span>
              </label>
            </div>
          </div>

          {/* OLD: Email field (commented, replaced with dynamic field below) */}
          {/*
          <label htmlFor="email" className="text-[11px] font-semibold text-[var(--color-text-secondary)] block mb-1.5 tracking-wide">
            WORK EMAIL
          </label>
          <div className="relative mb-1">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@premierseals.com"
              {...register("email")}
              className={`w-full rounded-[9px] border pl-9 pr-3 py-2.5 text-[13px] bg-white text-[var(--color-text-primary)] outline-none transition-colors
                ${errors.email
                  ? "border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-light)]"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-[var(--color-danger)] mb-3">{errors.email.message}</p>}
          {!errors.email && <div className="mb-3" />}
          */}

          {/* NEW: Dynamic Email/Supplier Code Field based on loginType */}
          {loginType === "user" ? (
            <>
              <label htmlFor="email" className="text-[11px] font-semibold text-[var(--color-text-secondary)] block mb-1.5 tracking-wide">
                WORK EMAIL
              </label>
              <div className="relative mb-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@premierseals.com"
                  {...register("email")}
                  className={`w-full rounded-[9px] border pl-9 pr-3 py-2.5 text-[13px] bg-white text-[var(--color-text-primary)] outline-none transition-colors
                    ${errors.email
                      ? "border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-light)]"
                      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                    }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-[var(--color-danger)] mb-3">{errors.email.message}</p>}
              {!errors.email && <div className="mb-3" />}
            </>
          ) : (
            <>
              <label htmlFor="supplierIdentifier" className="text-[11px] font-semibold text-[var(--color-text-secondary)] block mb-1.5 tracking-wide">
                EMAIL OR SUPPLIER CODE
              </label>

              {/* Supplier Code Field */}
              <div className="relative mb-2">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="supplierCode"
                  type="text"
                  autoComplete="off"
                  placeholder="Enter supplier code"
                  {...register("supplierCode")}
                  onChange={(e) => {
                    register("supplierCode").onChange(e)
                    console.log("⌨️ Supplier code input changed:", e.target.value)
                  }}
                  className={`w-full rounded-[9px] border pl-9 pr-9 py-2.5 text-[13px] bg-white text-[var(--color-text-primary)] outline-none transition-colors
                    ${errors.supplierCode
                      ? "border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-light)]"
                      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                    }`}
                />
                {isCheckingStatus && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)] animate-spin" />
                )}
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">OR</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              {/* Email Field for Supplier */}
              <div className="relative mb-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="supplier@example.com"
                  {...register("email")}
                  className={`w-full rounded-[9px] border pl-9 pr-3 py-2.5 text-[13px] bg-white text-[var(--color-text-primary)] outline-none transition-colors
                    ${errors.email
                      ? "border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-light)]"
                      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                    }`}
                />
              </div>
              {(errors.email || errors.supplierCode) && (
                <p className="text-[11px] text-[var(--color-danger)] mb-3">
                  {errors.email?.message || errors.supplierCode?.message}
                </p>
              )}
              {!errors.email && !errors.supplierCode && <div className="mb-3" />}
            </>
          )}

          {/* Password field */}
          <label htmlFor="password" className="text-[11px] font-semibold text-[var(--color-text-secondary)] block mb-1.5 tracking-wide">
            PASSWORD
          </label>
          <div className="relative mb-1">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              {...register("password")}
              className={`w-full rounded-[9px] border pl-9 pr-9 py-2.5 text-[13px] bg-white text-[var(--color-text-primary)] outline-none transition-colors
                ${errors.password
                  ? "border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-light)]"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                }`}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-[var(--color-danger)] mb-3">{errors.password.message}</p>}
          {!errors.password && <div className="mb-3" />}

          {/* OLD: Remember me + forgot password (commented, replaced with dynamic version below) */}
          {/*
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5 mt-1">
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] cursor-pointer">
              <input type="checkbox" {...register("rememberMe")} className="w-3.5 h-3.5 rounded border-[var(--color-border)]" />
              Keep me signed in
            </label>
          */}

          {/* NEW: Remember me / Paid Supplier + forgot password */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5 mt-1">
            {loginType === "user" ? (
              <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                <input type="checkbox" {...register("rememberMe")} className="w-3.5 h-3.5 rounded border-[var(--color-border)] cursor-pointer" />
                Keep me signed in
              </label>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                {/* Custom Checkbox */}
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isPaidSupplier}
                    readOnly
                    disabled
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                      isPaidSupplier
                        ? "border-green-500 bg-green-500 shadow-sm"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {isCheckingStatus ? (
                      <Loader2 size={12} className="text-gray-400 animate-spin" />
                    ) : isPaidSupplier ? (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3 text-gray-300 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Status Text */}
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold transition-colors ${
                    isCheckingStatus
                      ? "text-blue-600 dark:text-blue-400"
                      : isPaidSupplier
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {isCheckingStatus ? "Verifying Status..." : isPaidSupplier ? "Paid Supplier" : "Unpaid Supplier"}
                  </span>
                  {!isCheckingStatus && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                      {isPaidSupplier ? "Premium account verified" : "Free account"}
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <RippleButton isSubmitting={isSubmitting} />

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-center gap-1.5">
            <Info size={13} className="text-[var(--color-text-muted)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">Invite-only access</span>
          </div>
        </div>
      </form>
    </div>
  )
}

function RippleButton({ isSubmitting }: { isSubmitting: boolean }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      onClick={handleClick}
      className="relative overflow-hidden w-full rounded-[9px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white text-[13.5px] font-semibold py-3 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
    >
      {isSubmitting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          Sign in <ArrowRight size={15} />
        </>
      )}

      {ripples.map((r) => (
        <span key={r.id} className="ripple-el" style={{ left: r.x, top: r.y }} />
      ))}
    </button>
  )
}