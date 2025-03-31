import { Card, CardContent } from "@/components/ui/card";

interface Chef {
  id: string;
  name: string;
  specialization: string;
}

interface Waiter {
  id: string;
  name: string;
}

interface RestaurantDetailProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    image: string;
    chefs: Chef[];
    waiters: Waiter[];
  };
}

export function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        \
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="object-cover"
        />
      </div>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
            <p className="text-muted-foreground mb-4">
              {restaurant.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-2">Chefs</h3>
              <ul className="space-y-1">
                {restaurant.chefs.map((chef) => (
                  <li
                    key={chef.id}
                    className="flex items-center justify-between"
                  >
                    <span>{chef.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {chef.specialization}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Waiters</h3>
              <ul className="space-y-1">
                {restaurant.waiters.map((waiter) => (
                  <li key={waiter.id}>{waiter.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
