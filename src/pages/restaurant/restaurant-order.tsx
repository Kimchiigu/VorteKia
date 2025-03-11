import { Navbar } from "@/components/navbar/navbar";
import OrderSection from "@/components/transaction/order-section";

export default function RestaurantOrder() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-12 space-y-16">
          <OrderSection pageType="restaurant" />
        </div>
      </div>
    </main>
  );
}
