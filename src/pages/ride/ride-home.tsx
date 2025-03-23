import { Navbar } from "@/components/navbar/navbar";
import { useAuth } from "@/components/provider/auth-provider";
import { HeroRide } from "@/components/ride/hero-ride";
import { RidesSection } from "@/components/ride/rides-section";
import { CartSection } from "@/components/transaction/cart-section";

export default function RideHome() {
  const user = useAuth();
  const customerId = user?.user?.user_id ?? "";

  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroRide />
        <div className="mt-12 space-y-16">
          {customerId && <CartSection pageType="ride" />}
          <RidesSection pageType="ride" />
        </div>
      </div>
    </main>
  );
}
