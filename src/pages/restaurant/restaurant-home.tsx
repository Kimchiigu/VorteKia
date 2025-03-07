import { Navbar } from "@/components/customer/navbar";
import { HeroRestaurant } from "@/components/restaurants/hero-restaurant";
import { RestaurantsSection } from "@/components/restaurants/restaurants-section";

export default function RestaurantHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroRestaurant />
        <div className="mt-12 space-y-16">
          <RestaurantsSection />
        </div>
      </div>
    </main>
  );
}
