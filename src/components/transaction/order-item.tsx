import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";

interface OrderItemProps {
  orders: Order[];
  itemDetails: { [key: string]: ItemDetails };
  totalItems: number;
  loading: boolean;
}

export default function OrderItem({
  orders,
  itemDetails,
  totalItems,
  loading,
}: OrderItemProps) {
  console.log("Orders from order-item.tsx : ", orders);

  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Items</span>
            <Badge>
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const item = itemDetails[order.item_id] || {
                  name: "Loading...",
                  description: "",
                  price: 0,
                };
                return (
                  <div key={order.order_id} className="flex gap-4">
                    <div className="h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="font-bold">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center">
                            {order.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No items in your order.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
