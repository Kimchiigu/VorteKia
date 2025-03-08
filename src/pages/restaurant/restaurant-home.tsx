import { Navbar } from "@/components/navbar/navbar";
import { CartSection } from "@/components/order/cart-section";
import { useAuth } from "@/components/provider/auth-provider";
import { HeroRestaurant } from "@/components/restaurants/hero-restaurant";
import { RestaurantsSection } from "@/components/restaurants/restaurants-section";

export default function RestaurantHome() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroRestaurant />
        <div className="mt-12 space-y-16">
          {user && <CartSection />}
          <RestaurantsSection />
        </div>
      </div>
    </main>
  );
}
