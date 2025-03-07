import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export default function InfoCard({
  info,
  onClose,
}: {
  info: { name: string; description: string };
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const getRoutePath = (name: string) => {
    switch (name.toLowerCase()) {
      case "customer":
        return "/customer";
      case "restaurant":
        return "/restaurant";
      case "ride":
        return "/ride";
      case "store":
        return "/store";
      case "staff":
        return "/staff";
      default:
        return "/";
    }
  };

  return (
    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-lg z-50">
      <h2 className="text-xl text-primary font-bold">{info.name}</h2>
      <p className="text-sm text-primary my-2">{info.description}</p>
      <div className="flex justify-between mt-4">
        <Button
          variant="default"
          onClick={() => navigate(getRoutePath(info.name))}
        >
          Go to {info.name}?
        </Button>
        <Button variant="outline" onClick={onClose}>
          No thanks
        </Button>
      </div>
    </div>
  );
}
