import { useState, useRef, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Code2,
  Calendar,
  TrendingUp,
  Search,
  X,
  User,
  LogOut,
  ChevronUp,
  BookOpen,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

/**
 * navGroups
 * ------------------------------------------------------
 * DSA Sheet Tracker Navigation
 * Simple and focused navigation for DSA preparation
 * ------------------------------------------------------
 */
const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Topics", icon: BookOpen, path: "/topics" },
      { label: "DSA Sheet", icon: Code2, path: "/dsa-sheet" },
      { label: "Calendar", icon: Calendar, path: "/calendar" },
      { label: "Progress", icon: TrendingUp, path: "/progress" },
    ],
  },
]

/**
 * Sidebar
 * ------------------------------------------------------
 * Overlay drawer on ALL screen sizes — hidden by default,
 * opens only when the hamburger icon in the Header is clicked.
 * "open" state is controlled by AppLayout and passed down.
 * ------------------------------------------------------
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const { isOnline, connectionQuality } = useOnlineStatus()

  // Simple client-side filter across all nav items by label.
  // Groups with zero matching items are hidden entirely while searching.
  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0)

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U"

      // for online offline status indicator
  const getStatusColor = () => {
    if (!isOnline || connectionQuality === "offline") return "bg-red-500"
    if (connectionQuality === "poor") return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Backdrop overlay — shown on ALL screens now, not just mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen flex flex-col
          w-[var(--sidebar-width)]
          bg-gradient-to-b from-black via-zinc-950 to-black
          border-r border-[#ff6b35]/10
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ---------- Logo + close button ---------- */}
        <div
          className="flex items-center justify-between px-4 border-b border-[#ff6b35]/10 shrink-0"
          style={{ height: "var(--header-height)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#ff6b35] to-[#f77f00] flex items-center justify-center text-white text-[12.5px] font-bold shadow-[0_4px_10px_rgba(255,107,53,0.35)] shrink-0">
              <Code2 size={20} />
            </div>
            <div className="leading-tight">
              <p className="text-white text-[14px] font-bold m-0 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">DSA Tracker</p>
              <p className="text-[#ff6b35] text-[9.5px] tracking-wider m-0 font-semibold">MASTER DSA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#ff6b35] transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---------- Quick search ---------- */}
        <div className="px-3 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-[#ff6b35]/20 rounded-lg px-3 py-2.5 focus-within:border-[#ff6b35] focus-within:bg-[#ff6b35]/5 focus-within:shadow-lg focus-within:shadow-[#ff6b35]/10 transition-all">
            <Search size={15} className="text-[#ff6b35] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search navigation..."
              className="bg-transparent outline-none text-[12px] text-white placeholder:text-gray-500 w-full"
            />
            {!search && (
              <span className="text-[9.5px] text-[#ff6b35] border border-[#ff6b35]/30 rounded px-1.5 py-0.5 shrink-0 font-medium">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* ---------- Nav groups ---------- */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {filteredGroups.length === 0 ? (
            <p className="text-center text-[12px] text-gray-500 py-6">No matching items</p>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <div key={group.label} className={groupIndex > 0 ? "mt-6" : ""}>
                <div className="flex items-center gap-2 px-2 pb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ff6b35]/20" />
                  <p className="text-[10px] font-semibold text-[#ff6b35]/70 uppercase tracking-wider">
                    {group.label}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ff6b35]/20" />
                </div>
                <div className="space-y-1">
                  {group.items.map((item, index) => (
                    <div key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose} // auto-close sidebar after navigating
                        className={({ isActive }) =>
                          `relative flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] font-medium transition-all cursor-pointer border ${
                            isActive
                              ? "text-white bg-gradient-to-r from-[#ff6b35]/20 to-[#f77f00]/10 border-[#ff6b35]/30 shadow-lg shadow-[#ff6b35]/5"
                              : "text-gray-400 hover:bg-white/[0.05] hover:text-white border-transparent hover:border-[#ff6b35]/10"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Glowing left accent bar — only on the active item */}
                            {isActive && (
                              <span className="absolute -left-3 top-[8px] bottom-[8px] w-[3px] rounded-full bg-gradient-to-b from-[#ff6b35] to-[#f77f00] shadow-[0_0_8px_rgba(255,107,53,0.6)]" />
                            )}

                            {/* Icon tile — fills solid + glows when active, subtle bg otherwise */}
                            <span
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                isActive
                                  ? "bg-gradient-to-br from-[#ff6b35] to-[#f77f00] shadow-[0_2px_8px_rgba(255,107,53,0.4)]"
                                  : "bg-white/[0.04] hover:bg-white/[0.08]"
                              }`}
                            >
                              <item.icon
                                size={18}
                                className={isActive ? "text-white" : "text-gray-400"}
                              />
                            </span>

                            <span className="truncate flex-1 font-medium">{item.label}</span>

                            {/* Badge count — only rendered when provided */}
                            {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                              <span className="bg-gradient-to-br from-[#ff6b35] to-[#f77f00] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_2px_6px_rgba(255,107,53,0.4)] shrink-0">
                                {item.badgeCount > 99 ? "99+" : item.badgeCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>

                      {/* Divider between items (except after last item) */}
                      {index < group.items.length - 1 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-[#ff6b35]/10 to-transparent my-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* ---------- Profile footer with dropdown ---------- */}
        <div className="px-2 pb-3 pt-2 border-t border-[#ff6b35]/10 shrink-0 relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center gap-2.5 rounded-xl p-2 bg-white/[0.03] hover:bg-[#ff6b35]/10 border border-transparent hover:border-[#ff6b35]/20 transition-all duration-200 cursor-pointer group relative"
          >
            <span className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-[#ff6b35] to-[#f77f00] shrink-0">
              <Avatar size="default" className="w-full h-full">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-[#ff6b35] to-[#f77f00] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${getStatusColor()} border-2 border-black transition-colors duration-300`}
                title={!isOnline ? "Offline" : connectionQuality === "poor" ? "Slow connection" : "Connected"}
              />
            </span>
            <span className="flex-1 text-left leading-tight overflow-hidden">
              <p className="text-[12px] text-white font-medium m-0 truncate">
                {user?.name ?? "Guest"}
              </p>
              <p className="text-[10px] text-gray-400 m-0 truncate">
                {user?.email ?? "Not signed in"}
              </p>
            </span>
            <ChevronUp
              size={16}
              className={`text-gray-400 group-hover:text-[#ff6b35] shrink-0 transition-all duration-200 ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          <div
            className={`absolute bottom-full left-2 right-2 mb-2 bg-zinc-900 border border-[#ff6b35]/20 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-bottom ${
              profileMenuOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2 pointer-events-none"
            }`}
          >
            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setProfileMenuOpen(false)
                  navigate("/profile")
                  onClose()
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-[#ff6b35]/10 transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/20 flex items-center justify-center group-hover:bg-[#ff6b35]/30 transition-colors">
                  <User size={16} className="text-[#ff6b35]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[13px]">Profile</p>
                  <p className="text-[10px] text-gray-400">View your profile</p>
                </div>
              </button>

              <div className="my-1 mx-2 border-t border-[#ff6b35]/10" />

              <button
                onClick={() => {
                  setProfileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <LogOut size={16} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[13px]">Logout</p>
                  <p className="text-[10px] text-red-400/70">Sign out of account</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar