import { Navbar } from "@/components/customer/navbar";
import { HeroStore } from "@/components/store/hero-store";
import { StoreSection } from "@/components/store/store-section";

export default function StoreHome() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <HeroStore />
        <div className="mt-12 space-y-16">
          <StoreSection />
        </div>
      </div>
    </main>
  );
}
