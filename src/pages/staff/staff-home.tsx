import { HeroStaff } from "@/components/staff/hero-staff";
import LostAndFound from "./lost-and-found/lost-and-found";
import { useLocation } from "react-router";
import { StaffNavbar } from "@/components/navbar/staff-nav";

export default function StaffHome() {
  const location = useLocation();
  const user = location.state?.user;
  console.log("User Role :", user.role);

  return (
    <main className="min-h-screen w-full bg-background">
      <StaffNavbar />
      <div className="container mx-auto px-4 py-8">
        <HeroStaff />
        <div className="mt-12 space-y-16">
          {user ? (
            <>
              <h2 className="text-xl font-semibold">
                Welcome, {user.name} ({user.role})
              </h2>
              {user.role === "Lost And Found Staff" && <LostAndFound />}
            </>
          ) : (
            <p className="text-red-500">
              No user data available. Please log in again.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
