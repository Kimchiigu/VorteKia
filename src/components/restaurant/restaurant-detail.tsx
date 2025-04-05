import { Card, CardContent } from "@/components/ui/card";

interface RestaurantDetailProps {
  restaurant: {
    restaurant_id: string;
    name: string;
    description: string;
    image: string;
  };
  users: User[];
}

export function RestaurantDetail({ restaurant, users }: RestaurantDetailProps) {
  const filteredChefs = users.filter(
    (user) =>
      user.role === "Chef" && user.restaurant_id === restaurant.restaurant_id
  );

  const filteredWaiters = users.filter(
    (user) =>
      user.role === "Waiter" && user.restaurant_id === restaurant.restaurant_id
  );

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={
            restaurant.image
              ? `data:image/png;base64,${restaurant.image}`
              : "/placeholder.svg"
          }
          alt={restaurant.name}
          className="object-cover h-full w-full"
        />
      </div>
      <CardContent className="p-6">
        <div className="grid gap-6">
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
                {filteredChefs.length > 0 ? (
                  filteredChefs.map((chef) => (
                    <li
                      key={chef.user_id}
                      className="flex items-center justify-between"
                    >
                      <span>{chef.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No chefs assigned</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Waiters</h3>
              <ul className="space-y-1">
                {filteredWaiters.length > 0 ? (
                  filteredWaiters.map((waiter) => (
                    <li
                      key={waiter.user_id}
                      className="flex items-center justify-between"
                    >
                      <span>{waiter.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No waiters assigned</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
