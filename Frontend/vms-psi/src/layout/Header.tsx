import { useState, useRef, useEffect } from "react"
import { Menu, Bell, ChevronDown, LogOut, User, ArrowLeft, Home, Moon, Sun, Code2 } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { isOnline, connectionQuality } = useOnlineStatus()

  const initials = user?.name.split(" ").map((n) => n[0]).join("") || "U"

  // Check if user is on dashboard (hide back button)
  const isDashboard = location.pathname === "/dashboard"

  // for online offline status indicator
  const getStatusColor = () => {
    if (!isOnline || connectionQuality === "offline") return "bg-red-500"
    if (connectionQuality === "poor") return "bg-yellow-500"
    return "bg-green-500"
  }

  // Navigate to dashboard
  const handleLogoClick = () => {
    navigate("/dashboard")
  }

  // Navigate back
  const handleBackClick = () => {
    navigate(-1)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b border-white/10"
      style={{
        height: "var(--header-height)",
        // Header now shares the SAME dark bg as Sidebar, for a unified look
        backgroundColor: "var(--color-sidebar-bg)",
      }}
    >
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMenuClick}
          className="text-[var(--color-sidebar-text)] hover:text-[#ff6b35] transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={25} />
        </button>

        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 hover:opacity-90 transition-all cursor-pointer group"
          aria-label="Go to dashboard"
          title="Go to Dashboard"
        >
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#ff6b35] to-[#f77f00] flex items-center justify-center text-white text-[12.5px] font-bold shadow-[0_4px_10px_rgba(255,107,53,0.35)] shrink-0 group-hover:scale-105 transition-transform">
            <Code2 size={20} />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-white text-[14px] font-bold m-0 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              DSA Tracker
            </p>
            <p className="text-[#ff6b35] text-[9.5px] tracking-wider m-0 font-semibold">
              MASTER DSA
            </p>
          </div>
        </button>
      </div>

      {/* Right: back button + home + notifications + user menu */}
      <div className="flex items-center gap-3">
        {/* Back Button - Hidden on dashboard */}
        {!isDashboard && (
          <button
            onClick={handleBackClick}
            className="text-[var(--color-sidebar-text)] hover:text-white transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-white/5"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Home Button - Navigate to dashboard */}
        <button
          onClick={handleLogoClick}
          className={`text-[var(--color-sidebar-text)] hover:text-white transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-white/5 ${
            isDashboard ? "bg-white/10 text-white" : ""
          }`}
          aria-label="Go to dashboard"
          title="Dashboard"
        >
          <Home size={20} />
        </button>

        {/* Notification Bell */}
        <button className="relative text-[var(--color-sidebar-text)] hover:text-white transition-colors cursor-pointer p-2 rounded-lg hover:bg-white/5">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-[var(--color-sidebar-text)] hover:text-[#ff6b35] transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-[#ff6b35]/10 border border-transparent hover:border-[#ff6b35]/20"
          aria-label="Toggle theme"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 outline-none cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="relative">
              <Avatar className="border-2 border-transparent group-hover:border-[#ff6b35]/40 transition-all duration-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-[#ff6b35] to-[#f77f00] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${getStatusColor()} border-2 border-[var(--color-sidebar-bg)] transition-colors duration-300`}
                title={!isOnline ? "Offline" : connectionQuality === "poor" ? "Slow connection" : "Connected"}
              />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-white">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-[var(--color-sidebar-text)]">
                {user?.email || ""}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-[var(--color-sidebar-text)] transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Enhanced Dropdown with smooth transitions */}
          <div
            className={`absolute right-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50 transition-all duration-200 origin-top-right ${
              menuOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            {/* User Info Section */}
            <div className="px-4 py-3 bg-gradient-to-br from-[#ff6b35]/10 to-transparent border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-[#ff6b35]/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[#ff6b35] to-[#f77f00] text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor()} border-2 border-[var(--color-surface)] transition-colors duration-300`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate("/profile")
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[#ff6b35]/5 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/10 flex items-center justify-center group-hover:bg-[#ff6b35]/20 transition-colors">
                  <User size={16} className="text-[#ff6b35]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Profile</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">View your profile</p>
                </div>
              </button>
            </div>

            {/* Logout Section */}
            <div className="border-t border-[var(--color-border)] py-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-danger)]/10 flex items-center justify-center group-hover:bg-[var(--color-danger)]/20 transition-colors">
                  <LogOut size={16} className="text-[var(--color-danger)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Logout</p>
                  <p className="text-xs text-[var(--color-danger)]/70">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header