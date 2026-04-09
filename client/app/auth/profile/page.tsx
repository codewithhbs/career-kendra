import ProfileClient from "@/components/ProfileClient/ProfileClient";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading profile...
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}