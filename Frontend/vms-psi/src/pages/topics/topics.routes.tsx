import { lazy, Suspense } from "react";

const TopicsPage = lazy(() => import("./TopicsPage"));

const TopicsLoader = () => (
  <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
  </div>
);

export const topicsRoutes = [
  {
    path: "topics",
    element: (
      <Suspense fallback={<TopicsLoader />}>
        <TopicsPage />
      </Suspense>
    ),
  },
];
