import { Hero } from "@/components/customer/hero";
import { Navbar } from "@/components/customer/navbar";
import { RestaurantsSection } from "@/components/restaurants/restaurants-section";
import { RidesSection } from "@/components/rides/rides-section";

export default function CustomerHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Hero />
        <div className="mt-12 space-y-16">
          <RestaurantsSection />
          <RidesSection />
        </div>
      </div>
    </main>
  );
}
