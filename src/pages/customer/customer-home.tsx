import { HeroCustomer } from "@/components/customer/hero-customer";
import { Navbar } from "@/components/navbar/navbar";
import { RestaurantsSection } from "@/components/restaurant/restaurants-section";
import { RidesSection } from "@/components/ride/rides-section";

export default function CustomerHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroCustomer />
        <div className="mt-12 space-y-16">
          <RestaurantsSection />
          <RidesSection />
        </div>
      </div>
    </main>
  );
}
