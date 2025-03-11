import { Navbar } from "@/components/navbar/navbar";
import { CartSection } from "@/components/transaction/cart-section";
import { HeroStore } from "@/components/store/hero-store";
import { StoreSection } from "@/components/store/store-section";
import { useAuth } from "@/components/provider/auth-provider";

export default function StoreHome() {
  const user = useAuth();
  const customerId = user?.user?.user_id ?? "";

  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroStore />
        <div className="mt-12 space-y-16">
          {customerId && <CartSection pageType="store" />}
          <StoreSection />
        </div>
      </div>
    </main>
  );
}
