import { Suspense } from "react";
import MyDayView from "@/components/MyDay/MyDayView";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function MyDayPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading dashboard" />}>
      <MyDayView />
    </Suspense>
  );
}
