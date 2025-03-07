import { useState, useEffect } from "react";

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
    <nav className="w-full h-14 bg-white/50 backdrop-blur-lg flex justify-between items-center px-6 text-gray-700 font-semibold fixed top-0 left-0">
      <span>Welcome to VorteKia!</span>
      <span>{currentTime}</span>
    </nav>
  );
}
