"use client";

import { CardFooter } from "@/components/ui/card";

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Minus, Plus, Check, ShoppingBag } from "lucide-react";
import SkeletonLoading from "../loading/skeleton";
import { useAuth } from "@/components/provider/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Souvenir {
  souvenir_id: number;
  store_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
}

export default function SouvenirSection() {
  const { store_id } = useParams<{ store_id: string }>();
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for modals
  const [selectedSouvenir, setSelectedSouvenir] = useState<Souvenir | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    async function fetchSouvenirs() {
      try {
        setLoading(true);
        const response = await invoke<{ data: Souvenir[] }>(
          "view_all_souvenirs"
        );
        if (response && response.data) {
          setSouvenirs(
            response.data.filter(
              (souvenir) => souvenir.store_id.toString() === store_id
            )
          );
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch souvenirs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSouvenirs();
  }, [store_id]);

  // Handle opening the quantity modal
  const handleAddToCart = (souvenir: Souvenir) => {
    setSelectedSouvenir(souvenir);
    setQuantity(1); // Reset quantity
    setIsQuantityModalOpen(true);
  };

  // Handle confirming the quantity
  const handleConfirmQuantity = () => {
    // Here you would typically add the item to the cart
    // For now, we'll just show the success modal
    setIsQuantityModalOpen(false);
    setIsSuccessModalOpen(true);

    // Auto-close success modal after 2 seconds
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      setSelectedSouvenir(null);
    }, 2000);
  };

  // Handle quantity changes
  const incrementQuantity = () => {
    if (selectedSouvenir && quantity < selectedSouvenir.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <section id="souvenirs" className="scroll-mt-16">
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

        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight">Souvenirs</h2>
          <p className="text-muted-foreground mt-2">
            Find your favorite souvenirs from our stores
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <SkeletonLoading key={index} />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {souvenirs.map((souvenir) => (
            <Card key={souvenir.souvenir_id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={
                    souvenir.image
                      ? `data:image/png;base64,${souvenir.image}`
                      : "/placeholder.svg?height=200&width=400"
                  }
                  alt={souvenir.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{souvenir.name}</CardTitle>
                  <Badge>${souvenir.price.toFixed(2)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{souvenir.description}</CardDescription>
                <Badge className="mt-3">
                  {souvenir.stock > 0
                    ? `${souvenir.stock} available`
                    : "Out of stock"}
                </Badge>
              </CardContent>
              <CardFooter>
                {user && user.role === "Customer" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={souvenir.stock <= 0}
                    onClick={() => handleAddToCart(souvenir)}
                  >
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Quantity Selection Modal */}
      <Dialog open={isQuantityModalOpen} onOpenChange={setIsQuantityModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
            <DialogDescription>
              Select the quantity you would like to purchase
            </DialogDescription>
          </DialogHeader>

          {selectedSouvenir && (
            <div className="py-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={
                      selectedSouvenir.image
                        ? `data:image/png;base64,${selectedSouvenir.image}`
                        : "/placeholder.svg?height=100&width=100"
                    }
                    alt={selectedSouvenir.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedSouvenir.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedSouvenir.description}
                  </p>
                  <div className="font-bold">
                    ${selectedSouvenir.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>Quantity:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-12 text-center">{quantity}</span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={incrementQuantity}
                    disabled={
                      selectedSouvenir && quantity >= selectedSouvenir.stock
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span>Total:</span>
                <span className="font-bold">
                  ${(selectedSouvenir.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuantityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmQuantity}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Added to Cart!</h2>
            {selectedSouvenir && (
              <p className="text-center text-muted-foreground">
                {quantity} x {selectedSouvenir.name} has been added to your cart
              </p>
            )}
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Continue Shopping
              </Button>
              <Button onClick={() => navigate("/store/order")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
