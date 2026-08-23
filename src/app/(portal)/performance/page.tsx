import { Suspense } from "react";
import PerformanceView from "@/components/Performance/PerformanceView";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function PerformancePage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading performance" />}>
      <PerformanceView />
    </Suspense>
  );
}
