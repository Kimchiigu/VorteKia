import { useState, useEffect } from "react";
import { ModeToggle } from "../theme/mode-toggle";

export default function LandingNavbar() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="w-full h-14 bg-background/50 backdrop-blur-lg flex justify-between items-center px-6 text-primary font-semibold fixed top-0 left-0">
      <span>Welcome to VorteKia!</span>
      <div className="flex items-center gap-4">
        <span>{currentTime}</span>
        <ModeToggle />
      </div>
    </nav>
  );
}
