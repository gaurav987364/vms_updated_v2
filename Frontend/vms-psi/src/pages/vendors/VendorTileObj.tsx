import { ModuleHubPage } from "@/shared/tiles/ModuleHub";
import type { TileConfig } from "@/shared/types/tile.types"
import { Building2, ClipboardList, FileText, ListChecks, ShieldCheck } from "lucide-react"

const vendorSubTiles: TileConfig[] = [
  {
    id: "vendors-onboarding",
    parentId: "vendors",
    link: "/common/vendors/onboarding",
    title: "Onboarding",
    icon: ClipboardList,
    accent: "primary",
  },
  {
    id: "vendors-compliance",
    parentId: "vendors",
    link: "/common/vendors/compliance",
    title: "Compliance",
    icon: ShieldCheck,
    accent: "warning",
  },
];

// sub-sub tiles eg.
const onboardingSubTiles: TileConfig[] = [
  {
    id: "vendors-onboarding-documents",
    parentId: "vendors-onboarding",
    link: "/common/vendors/onboarding/documents",
    title: "Documents",
    icon: FileText,
    accent: "info",
  },
  {
    id: "vendors-onboarding-checklist",
    parentId: "vendors-onboarding",
    link: "/common/vendors/onboarding/checklist",
    title: "Checklist",
    icon: ListChecks,
    accent: "success",
  },
]


function VendorHubPage() {
  return <ModuleHubPage title="Vendors" icon={Building2} tiles={vendorSubTiles} />
}
function OnboardingHubPage() {
  return <ModuleHubPage title="Onboarding" icon={ClipboardList} tiles={onboardingSubTiles} />
}

export { VendorHubPage, OnboardingHubPage }