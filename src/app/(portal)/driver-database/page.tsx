import { Suspense } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import DriverDatabaseView from "@/components/DriverDatabase/DriverDatabaseView";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function DriverDatabasePage() {
  return (
    <RequireAuth department="hr">
      <Suspense fallback={<PageSpinner label="Loading driver database" />}>
        <DriverDatabaseView />
      </Suspense>
    </RequireAuth>
  );
}
