import { Suspense } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import LeadsView from "@/components/Leads/LeadsView";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function LeadsPage() {
  return (
    <RequireAuth department="hr">
      <Suspense fallback={<PageSpinner label="Loading leads" />}>
        <LeadsView />
      </Suspense>
    </RequireAuth>
  );
}
