// src/routes/moduleRegistry.ts

import { dashboardRoutes } from "@/pages/dashboard"
import { dsaSheetRoutes } from "@/pages/dsa-sheet"
import { calendarRoutes } from "@/pages/calendar"
import { progressRoutes } from "@/pages/progress"
import { practiceRoutes } from "@/pages/practice"
import { streakRoutes } from "@/pages/streak"
import { topicsRoutes } from "@/pages/topics"
import { profileRoutes } from "@/pages/profile"

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
  ...dsaSheetRoutes,
  ...calendarRoutes,
  ...progressRoutes,
  ...practiceRoutes,
  ...streakRoutes,
  ...topicsRoutes,
  ...profileRoutes,
]
