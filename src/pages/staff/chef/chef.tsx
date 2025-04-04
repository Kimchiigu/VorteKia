import { useEffect, useState } from "react";
import { RestaurantDetail } from "@/components/restaurant/restaurant-detail";
import {
  RestaurantOrder,
  type Order,
  type OrderStatus,
} from "@/components/restaurant/restaurant-order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invoke } from "@tauri-apps/api/core";
import { ApiResponse } from "@/types/props";

interface MenuItem {
  menu_id: string;
  restaurant_id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  available_quantity: number;
}

export default function Chef() {
  const [activeTab, setActiveTab] = useState("orders");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          restaurantsResponse,
          usersResponse,
          menusResponse,
          ordersResponse,
        ] = await Promise.all([
          invoke<ApiResponse<Restaurant[]>>("view_all_restaurants"),
          invoke<ApiResponse<User[]>>("get_all_users"),
          invoke<ApiResponse<MenuItem[]>>("view_all_menus"),
          invoke<ApiResponse<Order[]>>("view_all_orders"),
        ]);

        // Cek apakah response sukses dan ambil data
        if (restaurantsResponse) setRestaurants(restaurantsResponse.data);
        else
          throw new Error(
            restaurantsResponse.error || "Failed to fetch restaurants"
          );

        if (usersResponse) setUsers(usersResponse.data);
        else throw new Error(usersResponse.error || "Failed to fetch users");

        if (menusResponse) setMenus(menusResponse.data);
        else throw new Error(menusResponse.error || "Failed to fetch menus");

        if (ordersResponse) setOrders(ordersResponse.data);
        else throw new Error(ordersResponse.error || "Failed to fetch orders");

        setLoading(false);
      } catch (err) {
        setError(`Error: ${err}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant Details</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
            <RestaurantOrder
              orders={orders}
              userRole="chef"
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          <TabsContent value="restaurant" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Restaurant Information</h2>
            <RestaurantDetail restaurant={restaurants} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
