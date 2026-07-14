import { RequirePermission } from "@/utils/validators/RequirePermission"
import type { RouteObject } from "react-router-dom"
import { OnboardingHubPage, VendorHubPage } from "./VendorTileObj"
import Document from "./Document"
import List from "./List"
import Create from "./Create"

/**
 * Vendors Module Routes
 * ------------------------------------------------------
 * Multi-level hierarchy:
 * - /vendors              → Shows vendor sub-tiles (onboarding, compliance)
 * - /vendors/onboarding   → Shows onboarding sub-tiles (documents, checklist)
 * - /vendors/onboarding/documents → Shows documents page
 * - /vendors/compliance   → Shows compliance page
 * ------------------------------------------------------
 */
export const vendorsRoutes: RouteObject[] = [
  {
    path: "vendors",
    element: (
      <RequirePermission permission="vendor:read">
        <VendorHubPage />
      </RequirePermission>
    ),
  },
  {
    path: "vendors/onboarding",
    element: <OnboardingHubPage />,
  },
  {
    path: "vendors/onboarding/documents",
    element: <Document />,
  },
  {
    path: "vendors/onboarding/checklist",
    element: <List />,
  },
  {
    path: "vendors/compliance",
    element: <Create />,
  },
]