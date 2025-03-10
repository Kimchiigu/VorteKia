import { Card, CardContent } from "../ui/card";

export default function HoverTooltip({
  hovered,
}: {
  hovered: { name: string; screenPosition: [number, number] } | null;
}) {
  if (!hovered) return null;

  return (
    <div
      className="absolute z-50"
      style={{
        left: `${hovered.screenPosition[0]}px`,
        top: `${hovered.screenPosition[1]}px`,
        transform: "translate(-50%, -120%)",
      }}
    >
      <Card className="bg-background/80 backdrop-blur-sm text-primary shadow-lg">
        <CardContent className="p-4 text-primary">
          <p className="text-lg font-semibold">{hovered.name}</p>
          <p className="text-sm">Click to zoom in (Press ESC to reset)</p>
        </CardContent>
      </Card>
    </div>
  );
}
