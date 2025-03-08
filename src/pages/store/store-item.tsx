import { Navbar } from "@/components/navbar/navbar";
import SouvenirSection from "@/components/store/souvenir-section";

export default function StoreItem() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-12 space-y-16">
          <SouvenirSection />
        </div>
      </div>
    </main>
  );
}
