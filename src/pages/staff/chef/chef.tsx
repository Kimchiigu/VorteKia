import { useState } from "react";
import { RestaurantDetail } from "@/components/restaurant/restaurant-detail";
import {
  RestaurantOrder,
  type Order,
  type OrderStatus,
} from "@/components/restaurant/restaurant-order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dummy data for restaurant
const restaurantData = {
  id: "rest1",
  name: "Gourmet Haven",
  description:
    "A fine dining restaurant specializing in international cuisine with a modern twist. Our chefs create culinary masterpieces using locally sourced ingredients.",
  image: "/placeholder.svg?height=400&width=800",
  chefs: [
    { id: "chef1", name: "Gordon Smith", specialization: "Head Chef" },
    { id: "chef2", name: "Maria Rodriguez", specialization: "Pastry Chef" },
    { id: "chef3", name: "Hiroshi Tanaka", specialization: "Sushi Chef" },
  ],
  waiters: [
    { id: "waiter1", name: "James Wilson" },
    { id: "waiter2", name: "Sarah Johnson" },
    { id: "waiter3", name: "Michael Brown" },
    { id: "waiter4", name: "Emily Davis" },
  ],
};

// Dummy data for orders
const initialOrders: Order[] = [
  {
    id: "order1",
    orderNumber: 1001,
    foodName: "Filet Mignon",
    customerId: "C1001",
    status: "Not Done",
  },
  {
    id: "order2",
    orderNumber: 1002,
    foodName: "Lobster Risotto",
    customerId: "C1002",
    status: "Not Done",
  },
  {
    id: "order3",
    orderNumber: 1003,
    foodName: "Chocolate Soufflé",
    customerId: "C1003",
    status: "Waiting for Delivery",
  },
  {
    id: "order4",
    orderNumber: 1004,
    foodName: "Caesar Salad",
    customerId: "C1004",
    status: "Not Done",
  },
  {
    id: "order5",
    orderNumber: 1005,
    foodName: "Sushi Platter",
    customerId: "C1005",
    status: "Waiting for Delivery",
  },
  {
    id: "order6",
    orderNumber: 1006,
    foodName: "Vegetable Curry",
    customerId: "C1006",
    status: "Delivered",
  },
];

export default function Chef() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState("orders");

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
            <RestaurantDetail restaurant={restaurantData} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
