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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Minus, Plus, Check, ShoppingBag } from "lucide-react";
import SkeletonLoading from "../loader/skeleton";
import { useAuth } from "@/components/provider/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define Souvenir type
interface Souvenir {
  souvenir_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  store_id: string;
}

// Define Order payload type
interface CreateOrderPayload {
  order_id: string;
  customer_id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  is_paid: boolean;
}

export default function SouvenirSection() {
  const { store_id } = useParams<{ store_id: string }>();
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Handle confirming the quantity & creating an order
  const handleConfirmQuantity = async () => {
    if (!user?.user_id) {
      console.error("User not logged in!");
      return;
    }

    if (!selectedSouvenir) return;

    try {
      // Generate unique order_id
      const orderId = `order_${Date.now()}`;
      console.log("Creating order...");

      // Call backend to create order
      await invoke("create_order", {
        payload: {
          order_id: orderId,
          customer_id: user.user_id,
          item_type: "store",
          item_id: selectedSouvenir.souvenir_id,
          quantity: quantity,
          is_paid: false, // Default: not paid yet
        } as CreateOrderPayload,
      });

      console.log("Order created successfully!");

      // Show success modal
      setIsQuantityModalOpen(false);
      setIsSuccessModalOpen(true);

      // Auto-close success modal after 2 seconds
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        setSelectedSouvenir(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to create order:", error);
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
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
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
                <CardTitle>{souvenir.name}</CardTitle>
                <Badge>${souvenir.price.toFixed(2)}</Badge>
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
          <div className="py-4">
            <div className="flex justify-between items-center">
              <span>Quantity:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
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
