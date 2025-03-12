import { Navbar } from "@/components/navbar/navbar";
import { MenuCustomerSection } from "@/components/restaurant/menu-customer";

export default function CustomerMenu() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-12 space-y-16">
          <MenuCustomerSection />
        </div>
      </div>
    </main>
  );
}
