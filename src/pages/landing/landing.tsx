import WorldMap from "@/components/3D/world-map";
import LandingNavbar from "@/components/landing/landing-navbar";

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
