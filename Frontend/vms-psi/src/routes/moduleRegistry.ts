// src/routes/moduleRegistry.ts

import { dashboardRoutes } from "@/pages/dashboard"
import { usersRoutes } from "@/pages/users"
import { vendorsRoutes } from "@/pages/vendors"

/**
 * RULE FOR ALL FUTURE DEVELOPERS:
 * To add a new module:
 *   1. Build it under src/pages/<module>/ following the folder convention
 *   2. Export its routes via <module>/index.ts
 *   3. Import it here — ONE line
 *   4. Spread it into the array below — ONE line
 * Never touch AppRoutes.tsx, ProtectedRoute, or any other module's files.
 */
export const moduleRoutes = [
  ...dashboardRoutes,
  ...usersRoutes,
  ...vendorsRoutes,
]
