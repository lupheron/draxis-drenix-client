import { Suspense } from "react";
import ProfileView from "@/components/Profile/ProfileView";
import { PageSpinner } from "@/components/UI/LoadingDefault";

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading profile" />}>
      <ProfileView />
    </Suspense>
  );
}
