import { Navbar } from "@/components/navbar/navbar";
import { CartSection } from "@/components/order/cart-section";
import { HeroStore } from "@/components/store/hero-store";
import { StoreSection } from "@/components/store/store-section";

export default function StoreHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroStore />
        <div className="mt-12 space-y-16">
          <CartSection />
          <StoreSection />
        </div>
      </div>
    </main>
  );
}
