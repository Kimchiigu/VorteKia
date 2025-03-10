import WorldMap from "@/components/landing/world-map";
import LandingNavbar from "@/components/navbar/landing-navbar";

export default function LandingPage() {
  return (
    <div
      className="w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/sky-bg.png')" }}
    >
      <WorldMap />
      <LandingNavbar />
    </div>
  );
}
