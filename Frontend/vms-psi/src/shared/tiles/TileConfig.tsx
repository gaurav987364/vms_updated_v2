// src/pages/dashboard/dashboardTiles.config.tsx

import {
  Users,
  Building2,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  MessageSquareWarning,
  GitBranch,
  ClipboardCheck,
  FileSignature,
  Gauge,
  UserCog,
} from "lucide-react"
import type { TileConfig } from "../types/tile.types"
/**
 * dashboardTiles
 * ------------------------------------------------------
 * The single source of truth for dashboard tile content.
 * To add a new module's tile later:
 *   1. Import its icon from lucide-react
 *   2. Add one object below with the correct `link` and
 *      `requiredPermission` matching that module's route setup
 * That's it — TileGrid + Tile render it automatically.
 * ------------------------------------------------------
 */
export const dashboardTiles: TileConfig[] = [
  {
    id: "users",
    parentId: "dashboard",
    link: "/common/users",
    title: "Users List",
    subtitle: "Manage Users",
    icon: Users,
    requiredPermission: "user:manage",
    accent: "info",
  },
  {
    id: "vendors",
    parentId: "dashboard",
    link: "/common/vendors",
    title: "Vendors",
    subtitle: "Manage vendor profiles, onboarding and compliance documents",
    icon: Building2,
    requiredPermission: "vendor:read",
    accent: "primary",
    // disabled: true,
  },
  {
    id: "supplier-quality-manual",
    parentId: "dashboard",
    link: "/supplier-quality-manual",
    title: "Supplier Quality Manual",
    subtitle: "Quality guidelines & compliance standards",
    icon: BookOpen,
    requiredPermission: "sqm:read",
    accent: "danger",
    disabled:true,
  },
  {
    id: "qms-certificate-management",
    parentId: "dashboard",
    link: "/qms-certificate-management",
    title: "QMS Certificate Management",
    subtitle: "ISO, IATF & EHS certificate tracking",
    icon: ShieldCheck,
    requiredPermission: "qms-certificate:read",
    accent: "success",
    disabled:true,
  },
  {
    id: "line-incidence-management",
    parentId: "dashboard",
    link: "/line-incidence-management",
    title: "Line Incidence Management",
    subtitle: "Track & resolve production line issues",
    icon: AlertTriangle,
    requiredPermission: "line-incidence:read",
    accent: "warning",
    disabled:true,
  },
  {
    id: "supplier-complaint-register",
    parentId: "dashboard",
    link: "/supplier-complaint-register",
    title: "Supplier Complaint Register",
    subtitle: "Log & manage supplier complaints",
    icon: MessageSquareWarning,
    requiredPermission: "supplier-complaint:read",
    accent: "danger",
    disabled:true,
  },
  {
    id: "4m-management",
    parentId: "dashboard",
    link: "/4m-management",
    title: "4M Management",
    subtitle: "Change, summary & violation tracking",
    icon: GitBranch,
    requiredPermission: "4m:read",
    accent: "info",
    disabled:true,
  },
  {
    id: "supplier-audit-management",
    parentId: "dashboard",
    link: "/supplier-audit-management",
    title: "Supplier Audit Management",
    subtitle: "Plan, conduct & close supplier audits",
    icon: ClipboardCheck,
    requiredPermission: "supplier-audit:read",
    accent: "primary",
    disabled:true,
  },
  {
    id: "rfq-to-loi",
    parentId: "dashboard",
    link: "/rfq-to-loi",
    title: "RFQ to LOI",
    subtitle: "Quotation to Letter of Intent process",
    icon: FileSignature,
    requiredPermission: "rfq-loi:read",
    accent: "warning",
    disabled:true,
  },
  {
    id: "qcd",
    parentId: "dashboard",
    link: "/qcd",
    title: "QCD",
    subtitle: "Quality, Cost & Delivery performance",
    icon: Gauge,
    requiredPermission: "qcd:read",
    accent: "success",
    disabled:true,
  },
  {
    id: "dol-management",
    parentId: "dashboard",
    link: "/dol-management",
    title: "DOL Management",
    subtitle: "Delegation of authority & levels",
    icon: UserCog,
    requiredPermission: "dol:read",
    accent: "info",
    disabled:true,
  },
]