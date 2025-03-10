import { Navbar } from "@/components/navbar/navbar";
import { MenuSection } from "@/components/restaurant/menu-section";

export default function CustomerMenu() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-12 space-y-16">
          <MenuSection />
        </div>
      </div>
    </main>
  );
}
