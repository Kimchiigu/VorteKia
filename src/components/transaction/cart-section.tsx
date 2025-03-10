"use client";

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

// Props to determine which page is currently active
interface CartSectionProps {
  pageType: "restaurant" | "store" | "ride";
  customerId: string; // Logged-in user
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  orderType: string;
}

export function CartSection({ pageType, customerId }: CartSectionProps) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCartItems() {
      try {
        const response: CartItem[] = await invoke("view_orders", {
          customer_id: customerId,
          order_type: pageType,
        });
        setCartItems(response);
      } catch (error) {
        console.error("Failed to fetch cart data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCartItems();
  }, [pageType, customerId]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

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
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                      <div className="font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
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
              ))}

              <Separator className="my-4" />

              <div className="flex justify-between items-center font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
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
            Checkout (${subtotal.toFixed(2)})
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
