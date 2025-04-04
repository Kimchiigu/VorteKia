import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { useAuth } from "../provider/auth-provider";
import { invoke } from "@tauri-apps/api/core";

interface CheckoutDialogProps {
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  checkoutDialogOpen: boolean;
  setCheckoutDialogOpen: (open: boolean) => void;
  orders: Order[];
}

export default function CheckoutDialog({
  totalItems,
  subtotal,
  tax,
  total,
  balance,
  checkoutDialogOpen,
  setCheckoutDialogOpen,
  orders,
}: CheckoutDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const unpaidOrders = orders.filter((order) => !order.is_paid);

      for (const order of unpaidOrders) {
        await invoke("checkout_order", {
          payload: {
            order_id: order.order_id,
            is_paid: true,
          },
        });
      }

      await invoke("top_up_balance", {
        payload: {
          user_id: user?.user_id,
          amount: -total,
        },
      });

      setIsProcessing(false);
      setIsComplete(true);

      setTimeout(() => {
        setCheckoutDialogOpen(false);
        setIsComplete(false);
      }, 2000);
    } catch (error) {
      console.error("Error during checkout:", error);
      setIsProcessing(false);
    }
  };

  return (
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
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Total Price (incl. tax)</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Your Balance</span>
                <span className="font-medium">${balance.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Remaining Balance After Purchase</span>
                <span className="font-medium">
                  ${(balance - total).toFixed(2)}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p>
                  By proceeding, the amount will be deducted from your VorteKia
                  balance.
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
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || balance < total}
              >
                {isProcessing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
