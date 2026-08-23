import { Suspense } from "react";
import HelpPageClient from "./HelpPageClient";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function HelpPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading help" />}>
      <HelpPageClient />
    </Suspense>
  );
}
