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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";

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

  const handleAmountChange = (value: string) => {
    setSelectedAmount(value === "custom" ? "custom" : Number.parseInt(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Top Up Balance
          </DialogTitle>
          <DialogDescription>
            Add funds to your VorteKia virtual balance
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTopUp}>
          <div className="grid gap-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="amount-select">Select amount</Label>
              <Select
                value={selectedAmount.toString()}
                onValueChange={handleAmountChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an amount" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_AMOUNTS.map((amount) => (
                    <SelectItem key={amount} value={amount.toString()}>
                      ${amount}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedAmount === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Enter custom amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="custom-amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Top Up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
