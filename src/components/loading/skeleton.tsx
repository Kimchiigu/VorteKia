import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function SkeletonLoading() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full bg-muted animate-pulse" />
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-full bg-muted rounded mt-2 animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded mt-1 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-9 w-full bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
