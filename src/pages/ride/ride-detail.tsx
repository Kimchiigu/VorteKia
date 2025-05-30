import { Navbar } from "@/components/navbar/navbar";
import RideSection from "@/components/ride/ride-section";

export default function RideDetail() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-12 space-y-16">
          <RideSection />
        </div>
      </div>
    </main>
  );
}
