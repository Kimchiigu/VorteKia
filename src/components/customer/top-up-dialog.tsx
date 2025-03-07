import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/provider/auth-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_AMOUNTS = [10, 20, 50, 100];

export function TopUpDialog({ open, onOpenChange }: TopUpDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(
    PRESET_AMOUNTS[0]
  );
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { topUpBalance } = useAuth();

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amount =
        selectedAmount === "custom"
          ? Number.parseFloat(customAmount)
          : selectedAmount;

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      topUpBalance(amount);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Balance</DialogTitle>
          <DialogDescription>
            Add funds to your VorteKia virtual balance
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTopUp}>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={selectedAmount.toString()}
              onValueChange={(value) =>
                setSelectedAmount(
                  value === "custom" ? "custom" : Number.parseInt(value)
                )
              }
              className="grid grid-cols-2 gap-4"
            >
              {PRESET_AMOUNTS.map((amount) => (
                <div key={amount} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={amount.toString()}
                    id={`amount-${amount}`}
                  />
                  <Label htmlFor={`amount-${amount}`} className="flex-1">
                    ${amount}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2 col-span-2">
                <RadioGroupItem value="custom" id="amount-custom" />
                <Label htmlFor="amount-custom" className="flex-1">
                  Custom amount
                </Label>
              </div>
            </RadioGroup>

            {selectedAmount === "custom" && (
              <div className="grid gap-2">
                <Label htmlFor="custom-amount">Enter amount</Label>
                <Input
                  id="custom-amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Top Up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
