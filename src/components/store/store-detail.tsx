import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, TrendingUp, Users } from "lucide-react";

interface StoreDetailProps {
  store: {
    id: string;
    name: string;
    description: string;
    image: string;
    location: string;
    operatingHours: string;
    salesStats: {
      dailyTarget: number;
      currentSales: number;
      percentageToTarget: number;
      customerCount: number;
      averageOrderValue: number;
    };
  };
}

export function StoreDetail({ store }: StoreDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <img
            src={store.image || "/placeholder.svg"}
            alt={store.name}
            className="object-cover"
          />
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{store.name}</h2>
              <p className="text-muted-foreground mt-1">{store.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    {store.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Operating Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    {store.operatingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Sales Statistics</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Daily Sales Target</span>
                <span className="text-sm font-medium">
                  ${store.salesStats.currentSales.toLocaleString()} / $
                  {store.salesStats.dailyTarget.toLocaleString()}
                </span>
              </div>
              <Progress
                value={store.salesStats.percentageToTarget}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-right">
                {store.salesStats.percentageToTarget}% of daily target
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Customer Count</h3>
                  <p className="text-2xl font-bold">
                    {store.salesStats.customerCount}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Average Order Value</h3>
                  <p className="text-2xl font-bold">
                    ${store.salesStats.averageOrderValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
