import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

export default function BackHeader({ pageType }: OrderSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 w-fit"
        onClick={() => navigate(`/${pageType}`)}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {pageType}
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Order</h1>
        <p className="text-muted-foreground">
          Review your items and complete your purchase
        </p>
      </div>
    </div>
  );
}
