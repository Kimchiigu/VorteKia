import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../provider/auth-provider";

interface CartSectionProps {
  pageType: "restaurant" | "store" | "ride";
}

interface ItemDetails {
  name: string;
  price: number;
  image?: string;
}

export function CartSection({ pageType }: CartSectionProps) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<Order[]>([]);
  const [itemDetails, setItemDetails] = useState<{
    [key: string]: ItemDetails;
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const user = useAuth();
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (user.user?.user_id) {
      setCustomerId(user.user.user_id);
    }
  }, [user.user?.user_id]);

  useEffect(() => {
    async function fetchCartItems() {
      if (!customerId) {
        console.error("❌ Missing customer_id: User is not logged in.");
        setLoading(false);
        return;
      }

      console.log("🟢 Fetching orders for user ID:", customerId);

      try {
        const ordersResponse = await invoke("view_orders", {
          customerId: customerId,
          orderType: pageType,
        });

        if (ordersResponse && Array.isArray(ordersResponse.data)) {
          const unpaidOrders = ordersResponse.data.filter(
            (order: Order) => !order.is_paid
          );
          setCartItems(unpaidOrders);
          fetchItemDetails(unpaidOrders);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch cart data:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      fetchCartItems();
    }
  }, [pageType, customerId]);

  async function fetchItemDetails(orders: Order[]) {
    const newItemDetails: { [key: string]: ItemDetails } = {};

    await Promise.all(
      orders.map(async (order) => {
        try {
          let response;
          if (order.item_type === "restaurant") {
            response = await invoke("view_menu", {
              menuId: order.item_id,
            });
          } else if (order.item_type === "store") {
            response = await invoke("view_souvenir", {
              souvenirId: order.item_id,
            });
          }

          if (response && response.data) {
            newItemDetails[order.item_id] = {
              name: response.data.name,
              price: response.data.price,
              image: response.data.image
                ? `data:image/png;base64,${response.data.image}`
                : "/placeholder.svg",
            };
          }
        } catch (error) {
          console.error(
            `❌ Failed to fetch item details for ${order.item_id}:`,
            error
          );
        }
      })
    );

    setItemDetails(newItemDetails);
  }

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <section id="cart-summary" className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Cart</h2>
        <Badge variant="outline" className="px-3 py-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Current Items</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/${pageType}/order`)}
            >
              View full cart
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading cart...</p>
          ) : cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const details = itemDetails[item.item_id] || {
                  name: "Loading...",
                  price: 0,
                };
                return (
                  <div key={item.order_id} className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={details.image || "/placeholder.svg"}
                        alt={details.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{details.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${details.price.toFixed(2)}
                        </div>
                        <div className="font-bold">
                          ${(details.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                );
              })}

              <Separator className="my-4" />
            </div>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-muted-foreground mt-1">
                Add items from our {pageType} to get started
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate(`/${pageType}/order`)}
            disabled={cartItems.length === 0}
          >
            Go to Checkout
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
