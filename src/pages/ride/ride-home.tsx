import { Navbar } from "@/components/customer/navbar";
import { HeroRide } from "@/components/rides/hero-ride";
import { RidesSection } from "@/components/rides/rides-section";

export default function RideHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroRide />
        <div className="mt-12 space-y-16">
          <RidesSection />
        </div>
      </div>
    </main>
  );
}
