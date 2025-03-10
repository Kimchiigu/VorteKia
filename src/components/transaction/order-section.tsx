import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingBag, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

// This is a template component that can be used for any order UI
export default function OrderSection() {
  // Mock user data - replace with your actual user data
  const user = {
    name: "Guest 1234",
    balance: 50.0,
  };

  // Mock order items - replace with your actual items
  const [items, setItems] = useState([
    {
      id: "1",
      name: "Classic Cheeseburger",
      description:
        "Juicy beef patty with cheese, lettuce, tomato, and special sauce",
      price: 9.99,
      image: "/placeholder.svg",
      quantity: 1,
    },
    {
      id: "2",
      name: "French Fries",
      description: "Crispy golden fries with sea salt",
      price: 4.99,
      image: "/placeholder.svg",
      quantity: 2,
    },
    {
      id: "3",
      name: "Chocolate Milkshake",
      description: "Creamy chocolate milkshake topped with whipped cream",
      price: 5.99,
      image: "/placeholder.svg",
      quantity: 1,
    },
  ]);

  // Checkout dialog state
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const totalItems = items.reduce((count, item) => count + item.quantity, 0);

  // Check if user has sufficient balance
  const insufficientBalance = user.balance < total;

  // Update item quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setCheckoutDialogOpen(false);
        setIsComplete(false);
        // Here you would typically navigate to a confirmation page
        // or clear the cart
      }, 2000);
    }, 1500);
  };

  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-fit"
          onClick={() => navigate("/store")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Order</h1>
          <p className="text-muted-foreground">
            Review your items and complete your purchase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items Section */}
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
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
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
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-10 text-center">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span
                    className={`font-bold ${
                      insufficientBalance ? "text-red-500" : ""
                    }`}
                  >
                    ${user.balance.toFixed(2)}
                  </span>
                </div>

                {insufficientBalance && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-md mt-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Insufficient balance</p>
                      <p>
                        Please top up your balance to complete this purchase
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                disabled={items.length === 0 || insufficientBalance}
                onClick={() => setCheckoutDialogOpen(true)}
              >
                Complete Purchase
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {isComplete ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-center text-muted-foreground">
                Your order has been placed successfully
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Your Order</DialogTitle>
                <DialogDescription>
                  Please review your order before completing the purchase
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Total Items</span>
                  </div>
                  <span className="font-medium">{totalItems}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Total Price (incl. tax)</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Your Balance</span>
                  <span className="font-medium">
                    ${user.balance.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Remaining Balance After Purchase</span>
                  <span className="font-medium">
                    ${(user.balance - total).toFixed(2)}
                  </span>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm">
                  <p>
                    By proceeding, the amount will be deducted from your
                    VorteKia balance.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCheckoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCheckout} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Confirm Purchase"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
