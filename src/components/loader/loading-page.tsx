import { useState, useEffect, ReactNode } from "react";

interface LoadingAnimationProps {
  children: ReactNode;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [expand, setExpand] = useState<boolean>(false);

  useEffect(() => {
    const handleComplete = () => {
      setExpand(true);
      setTimeout(() => setLoading(false), 1000);
    };

    if (document.readyState === "complete") {
      handleComplete();
    } else {
      window.addEventListener("load", handleComplete);
      return () => window.removeEventListener("load", handleComplete);
    }
  }, []);

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary">
          <div
            className={`${
              expand ? "logo-expand" : "logo-pulse"
            } transition-all duration-1000`}
          >
            <img
              src="images/vortekia-logo.png"
              alt="Logo"
              className="h-48 w-48"
            />
          </div>
        </div>
      ) : (
        <div className="fade-in">{children}</div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.8; }
          }
          .logo-pulse { animation: pulse 1.5s infinite ease-in-out; }

          @keyframes expand {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          .logo-expand { animation: expand 1s ease-out forwards; }

          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .fade-in { animation: fadeIn 1s ease-out forwards; }
        `}
      </style>
    </>
  );
};

export default LoadingAnimation;
