import { Navbar } from "@/components/navbar/navbar";
import { CartSection } from "@/components/transaction/cart-section";
import { useAuth } from "@/components/provider/auth-provider";
import { HeroRestaurant } from "@/components/restaurant/hero-restaurant";
import { RestaurantsSection } from "@/components/restaurant/restaurants-section";

export default function RestaurantHome() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroRestaurant />
        <div className="mt-12 space-y-16">
          {user && <CartSection pageType="restaurant" />}
          <RestaurantsSection />
        </div>
      </div>
    </main>
  );
}
