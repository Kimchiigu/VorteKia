import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface OrderSummaryProps {
  orders: Order[];
  subtotal: number;
  tax: number;
  total: number;
  insufficientBalance: boolean;
  balance: number;
  setCheckoutDialogOpen: (open: boolean) => void;
}

export default function OrderSummary({
  orders,
  subtotal,
  tax,
  total,
  insufficientBalance,
  balance,
  setCheckoutDialogOpen,
}: OrderSummaryProps) {
  return (
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
                ${balance.toFixed(2)}
              </span>
            </div>

            {insufficientBalance && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-md mt-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Insufficient balance</p>
                  <p>Please top up your balance to complete this purchase</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={orders.length === 0 || insufficientBalance}
            onClick={() => setCheckoutDialogOpen(true)} // 🆕 Call the setter function
          >
            Complete Purchase
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
