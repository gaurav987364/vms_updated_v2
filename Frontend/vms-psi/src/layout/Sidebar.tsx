import { useState, useRef, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ShoppingCart,
  Receipt,
  ShieldCheck,
  Search,
  X,
  User,
  LogOut,
  ChevronUp,
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
 * Config-driven nav — grouped by section, matching the same
 * pattern as dashboardTiles.config.tsx. To add a new module:
 * add one object to the right group's `items` array. Never
 * touch the render logic below.
 *
 * `badgeCount` is optional and static for now — wire it to
 * real data (e.g. pending PO count from a query) later.
 * ------------------------------------------------------
 */
const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/common/dashboard" }],
  },
  {
    label: "Procurement",
    items: [
      { label: "Vendors", icon: Building2, path: "/common/vendors" },
      { label: "Users", icon: Users, path: "/common/users" },
      { label: "Contracts", icon: FileText, path: "/common/contracts" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Purchase Orders", icon: ShoppingCart, path: "/common/purchase-orders", badgeCount: 3 },
      { label: "Invoices", icon: Receipt, path: "/common/invoices" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Audit Log", icon: ShieldCheck, path: "/common/audit-log" }],
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
          bg-gradient-to-b from-[var(--color-sidebar-bg)] to-[#0a1122]
          border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ---------- Logo + close button ---------- */}
        <div
          className="flex items-center justify-between px-4 border-b border-white/10 shrink-0"
          style={{ height: "var(--header-height)" }}
        >
          {/* <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-400 to-[var(--color-primary)] flex items-center justify-center text-white text-[12.5px] font-bold shadow-[0_4px_10px_rgba(37,99,235,0.35)] shrink-0">
              PS
            </div>
            <div className="leading-tight">
              <p className="text-white text-[13px] font-semibold m-0">Premier Seals</p>
              <p className="text-[#4b5a7a] text-[9.5px] tracking-wide m-0">VMS WORKSPACE</p>
            </div>
          </div> */}
          <img loading="lazy" src="/PS_logo_dark_theme_fix.png" alt="Psi Vms" className="h-35 w-35 object-contain" />

          <button
            onClick={onClose}
            className="text-[#4b5a7a] hover:text-white transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---------- Quick search ---------- */}
        <div className="px-3 pt-4 pb-1 shrink-0">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-[10px] px-2.5 py-2 focus-within:border-[var(--color-primary)]/50 transition-colors">
            <Search size={14} className="text-[#4b5a7a] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Quick search..."
              className="bg-transparent outline-none text-[12px] text-white placeholder:text-[#4b5a7a] w-full"
            />
            {!search && (
              <span className="text-[9.5px] text-[#3d4a63] border border-white/[0.08] rounded px-1 shrink-0">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* ---------- Nav groups ---------- */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {filteredGroups.length === 0 ? (
            <p className="text-center text-[12px] text-[#4b5a7a] py-6">No matching modules</p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.label} className="mb-1">
                <p className="text-[10px] font-semibold text-[#3d4a63] uppercase tracking-wider px-3 pt-3 pb-1.5">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose} // auto-close sidebar after navigating
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-2.5 py-2 rounded-[11px] text-[13px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "text-white bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-primary)]/5"
                          : "text-[#8b9bc2] hover:bg-white/[0.05] hover:text-[#dbe4f5]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Glowing left accent bar — only on the active item */}
                        {isActive && (
                          <span className="absolute -left-2 top-[5px] bottom-[5px] w-[3px] rounded-full bg-gradient-to-b from-blue-400 to-[var(--color-primary)] shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                        )}

                        {/* Icon tile — fills solid + glows when active, subtle bg otherwise */}
                        <span
                          className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-[var(--color-primary)] shadow-[0_2px_8px_rgba(59,130,246,0.4)]"
                              : "bg-white/[0.04]"
                          }`}
                        >
                          <item.icon
                            size={16}
                            className={isActive ? "text-white" : "text-current"}
                          />
                        </span>

                        <span className="truncate flex-1">{item.label}</span>

                        {/* Badge count — only rendered when provided */}
                        {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                          <span className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_2px_6px_rgba(217,119,6,0.4)] shrink-0">
                            {item.badgeCount > 99 ? "99+" : item.badgeCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))
          )}
        </nav>

        {/* ---------- Profile footer with dropdown ---------- */}
        <div className="px-2 pb-3 pt-2 border-t border-white/[0.07] shrink-0 relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center gap-2.5 rounded-xl p-2 bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer group relative"
          >
            <span className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-blue-400 to-teal-300 shrink-0">
              <Avatar size="default" className="w-full h-full">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-[var(--color-primary)] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${getStatusColor()} border-2 border-[#0a1122] transition-colors duration-300`}
                title={!isOnline ? "Offline" : connectionQuality === "poor" ? "Slow connection" : "Connected"}
              />
            </span>
            <span className="flex-1 text-left leading-tight overflow-hidden">
              <p className="text-[12px] text-white font-medium m-0 truncate">
                {user?.name ?? "Guest"}
              </p>
              <p className="text-[10px] text-[#4b5a7a] m-0 truncate">
                {user?.email ?? "Not signed in"}
              </p>
            </span>
            <ChevronUp
              size={16}
              className={`text-[#4b5a7a] group-hover:text-white shrink-0 transition-all duration-200 ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          <div
            className={`absolute bottom-full left-2 right-2 mb-2 bg-[#0d1829] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-bottom ${
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
                className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-white/[0.08] transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center group-hover:bg-[var(--color-primary)]/30 transition-colors">
                  <User size={16} className="text-[var(--color-primary)]" color="white"/>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[13px]">Profile</p>
                  <p className="text-[10px] text-[#4b5a7a]">View your profile</p>
                </div>
              </button>

              <div className="my-1 mx-2 border-t border-white/[0.06]" />

              <button
                onClick={() => {
                  setProfileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-danger)]/20 flex items-center justify-center group-hover:bg-[var(--color-danger)]/30 transition-colors">
                  <LogOut size={16} className="text-[var(--color-danger)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[13px]">Logout</p>
                  <p className="text-[10px] text-[var(--color-danger)]/70">Sign out of account</p>
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