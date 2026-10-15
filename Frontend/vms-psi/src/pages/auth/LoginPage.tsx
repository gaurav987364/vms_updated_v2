import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AnimatedHero } from "@/components/auth/AnimatedHero";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup schema
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const { showAlert } = useAlert();

  // Scroll to top when tab changes
  useEffect(() => {
    formContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeTab]);

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login
  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      showAlert({
        type: "success",
        title: "Login Successful!",
        description: "Welcome back to DSA Sheet Tracker",
        duration: 3000,
      });
      navigate("/dashboard");
    } catch (error: any) {
      showAlert({
        type: "error",
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const onSignup = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      // Show success alert
      showAlert({
        type: "success",
        title: "Account Created Successfully!",
        description: "Please login with your credentials to continue.",
        duration: 4000,
      });

      // Reset form and switch to login tab after a short delay
      signupForm.reset();
      setTimeout(() => {
        setActiveTab("login");
        // Scroll to top of form smoothly
        formContainerRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 500);

    } catch (error: any) {
      showAlert({
        type: "error",
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-black dark:via-zinc-950 dark:to-neutral-950 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row w-full h-full relative z-10">
        {/* LEFT SIDE - Hero Section (Hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-white/40 to-white/20 dark:from-zinc-900/40 dark:to-zinc-900/20 backdrop-blur-sm">
          <AnimatedHero />
        </div>

        {/* RIGHT SIDE - Form Section */}
        <div
          ref={formContainerRef}
          className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center overflow-y-auto scroll-smooth"
        >
          <div className="w-full max-w-md p-4 md:p-8 lg:p-10 my-auto">
            {/* Mobile Logo (visible only on mobile) */}
            <div className="lg:hidden text-center mb-6 animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff6b35] to-[#f77f00] bg-clip-text text-transparent">
                DSA Tracker
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                Master DSA. Ace Interviews.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 md:p-7 border border-gray-200/50 dark:border-zinc-800/50">
              {/* Header */}
              <div className="text-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTab === "login" ? "Welcome Back!" : "Get Started"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                  {activeTab === "login"
                    ? "Login to continue your DSA journey"
                    : "Create an account to start learning"}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-5 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === "login"
                      ? "bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === "signup"
                      ? "bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {activeTab === "login" && (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-3.5 animate-fade-in">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...loginForm.register("email")}
                      className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                      placeholder="you@example.com"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠</span> {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register("password")}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span>{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-[#ff6b35] dark:text-[#ff8555] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white py-2.5 rounded-lg font-medium hover:from-[#ff8555] hover:to-[#ff9520] hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-3 animate-fade-in">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  {...signupForm.register("name")}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                />
                {signupForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span>{signupForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  {...signupForm.register("username")}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                  placeholder="johndoe"
                />
                {signupForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span>{signupForm.formState.errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...signupForm.register("email")}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span>{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...signupForm.register("password")}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span>{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...signupForm.register("confirmPassword")}
                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span>{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#f77f00] text-white py-2.5 rounded-lg font-medium hover:from-[#ff8555] hover:to-[#ff9520] hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-4">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
