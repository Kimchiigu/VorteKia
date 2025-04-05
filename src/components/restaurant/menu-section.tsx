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
import { Input } from "@/components/ui/input"; // Add this import
import { Minus, Plus, Check, ShoppingBag, Search } from "lucide-react"; // Add Search icon
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
import BackHeader from "../util/back-header";

interface CreateOrderPayload {
  order_id: string;
  customer_id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  is_paid: boolean;
}

interface Menu {
  menu_id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available_quantity: number;
}

export default function MenuSection() {
  const { restaurant_id } = useParams<{ restaurant_id: string }>();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    async function fetchMenus() {
      try {
        setLoading(true);
        console.log(`Fetching menus for restaurant ${restaurant_id}`);
        const response = await invoke<{ data: Menu[] }>("view_all_menus");

        if (response && response.data) {
          const restaurantMenus = response.data.filter(
            (menu) => menu.restaurant_id.toString() === restaurant_id
          );
          setMenus(restaurantMenus);
          setFilteredMenus(restaurantMenus);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      } finally {
        setLoading(false);
      }
    }

    if (restaurant_id) {
      fetchMenus();
    }
  }, [restaurant_id]);

  useEffect(() => {
    const filtered = menus.filter(
      (menu) =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenus(filtered);
  }, [searchTerm, menus]);

  const handleAddToCart = (menu: Menu) => {
    setSelectedMenu(menu);
    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmQuantity = async () => {
    if (!user?.user_id) {
      console.error("User not logged in!");
      return;
    }

    if (!selectedMenu) return;

    try {
      const orderId = `ORD_${Date.now()}`;
      console.log("Creating order...");

      await invoke("update_menu_quantity", {
        payload: {
          menu_id: selectedMenu.menu_id,
          available_quantity: selectedMenu.available_quantity - quantity,
        },
      });

      await invoke("create_order", {
        payload: {
          order_id: orderId,
          customer_id: user.user_id,
          item_type: "restaurant",
          item_id: selectedMenu.menu_id,
          quantity: quantity,
          date: new Date().toISOString(),
          is_paid: false,
        } as CreateOrderPayload,
      });

      console.log("Order created successfully!");

      setIsQuantityModalOpen(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
        setSelectedMenu(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  return (
    <section id="souvenirs" className="scroll-mt-16">
      <BackHeader pageType="restaurant" />

      {/* Add Search Bar */}
      <div className="mb-6 flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
      ) : filteredMenus.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No menus found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <Card key={menu.menu_id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={
                    menu.image && menu.image.trim() !== ""
                      ? `data:image/png;base64,${menu.image}`
                      : "/placeholder.svg?height=200&width=400"
                  }
                  alt={menu.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{menu.name}</CardTitle>
                <Badge>${menu.price.toFixed(2)}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>{menu.description}</CardDescription>
                <Badge className="mt-3">
                  {menu.available_quantity > 0
                    ? `${menu.available_quantity} available`
                    : "Out of stock"}
                </Badge>
              </CardContent>
              <CardFooter>
                {user && user.role === "Customer" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={menu.available_quantity <= 0}
                    onClick={() => handleAddToCart(menu)}
                  >
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Rest of your dialog components remain the same */}
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

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Added to Cart!</h2>
            {selectedMenu && (
              <p className="text-center text-muted-foreground">
                {quantity} x {selectedMenu.name} has been added to your cart
              </p>
            )}
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Continue Shopping
              </Button>
              <Button onClick={() => navigate("/restaurant/order")}>
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
