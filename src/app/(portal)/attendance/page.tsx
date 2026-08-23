import { Suspense } from "react";
import AttendanceView from "@/components/Attendance/AttendanceView";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function AttendancePage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading attendance" />}>
      <AttendanceView />
    </Suspense>
  );
}
