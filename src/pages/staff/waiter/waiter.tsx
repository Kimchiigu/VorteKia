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

interface WaiterProps {
  staffId: string;
}

export default function Waiter({ staffId }: WaiterProps) {
  const [activeTab, setActiveTab] = useState("orders");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffRestaurantId, setStaffRestaurantId] = useState<string | null>(
    null
  );
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
          staffResponse,
        ] = await Promise.all([
          invoke<ApiResponse<Restaurant[]>>("view_all_restaurants"),
          invoke<ApiResponse<User[]>>("get_all_users"),
          invoke<ApiResponse<MenuItem[]>>("view_all_menus"),
          invoke<ApiResponse<Order[]>>("view_all_orders"),
          invoke<ApiResponse<User>>("get_user_by_id", { userId: staffId }),
        ]);

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

        if (staffResponse) {
          setStaffRestaurantId(staffResponse.data.restaurant_id);
        } else {
          throw new Error(staffResponse.error || "Failed to fetch staff data");
        }

        setLoading(false);
      } catch (err) {
        setError(`Error: ${err}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [staffId]);

  const filteredOrders = orders.filter((order) => {
    const menu = menus.find((menu) => menu.menu_id === order.item_id);
    return menu?.restaurant_id === staffRestaurantId;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
              orders={filteredOrders}
              menus={menus}
              userRole="waiter"
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          <TabsContent value="restaurant" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Restaurant Information</h2>
            <RestaurantDetail
              restaurant={restaurants.find(
                (r) => r.restaurant_id === staffRestaurantId
              )}
              users={users}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
