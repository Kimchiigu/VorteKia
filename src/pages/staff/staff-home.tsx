import { Navbar } from "@/components/customer/navbar";
import { RidesSection } from "@/components/rides/rides-section";
import { HeroStaff } from "@/components/staff/hero-staff";

export default function StaffHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroStaff />
        <div className="mt-12 space-y-16">
          <RidesSection />
        </div>
      </div>
    </main>
  );
}
