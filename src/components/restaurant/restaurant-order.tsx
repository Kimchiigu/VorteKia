import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export type OrderStatus =
  | "Waiting for Cooking"
  | "Waiting for Delivery"
  | "Delivered";

interface MenuItem {
  menu_id: string;
  restaurant_id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  available_quantity: number;
}

interface Order {
  order_id: string;
  item_id: string;
  customer_id: string;
  quantity: number;
  status: OrderStatus;
}

interface RestaurantOrderProps {
  orders: Order[];
  menus: MenuItem[];
  userRole: "chef" | "waiter";
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function RestaurantOrder({
  orders,
  menus,
  userRole,
  onUpdateStatus,
}: RestaurantOrderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const menu = menus.find((menu) => menu.menu_id === order.item_id);
    return (
      menu?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toString().includes(searchTerm)
    );
  });

  const getNextStatus = (currentStatus: string): OrderStatus | null => {
    if (userRole === "chef" && currentStatus === "Waiting for Cooking") {
      return "Waiting for Delivery";
    } else if (
      userRole === "waiter" &&
      currentStatus === "Waiting for Delivery"
    ) {
      return "Delivered";
    }
    return null;
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      try {
        // Update status di backend
        await invoke("update_order_status", {
          payload: {
            order_id: orderId,
            status: nextStatus,
          },
        });

        // Panggil callback untuk update state di parent component
        onUpdateStatus(orderId, nextStatus);

        // Jika status menjadi "Delivered", kirim notifikasi ke pelanggan
        if (nextStatus === "Delivered") {
          const order = orders.find((o) => o.order_id === orderId);
          if (order) {
            await invoke("send_notification", {
              recipientId: order.customer_id,
              title: "Order Delivered",
              message: `Your order ${orderId} has been delivered.`,
              notifType: "Restaurant Order",
            });
          }
        }
      } catch (error) {
        console.error(
          "Failed to update order status or send notification:",
          error
        );
      }
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "Waiting for Cooking":
        return "destructive";
      case "Waiting for Delivery":
        return "warning";
      case "Delivered":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">No</TableHead>
              <TableHead>Food Name</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const menu = menus.find(
                  (menu) => menu.menu_id === order.item_id
                );
                const nextStatus = getNextStatus(order.status);
                const canUpdateStatus = nextStatus !== null;

                return (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">
                      {order.order_id}
                    </TableCell>
                    <TableCell>{menu?.name || "Unknown"}</TableCell>
                    <TableCell>{order.customer_id}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusBadgeVariant(order.status) as
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canUpdateStatus}
                        onClick={() =>
                          handleUpdateStatus(order.order_id, order.status)
                        }
                      >
                        {nextStatus
                          ? `Mark as ${nextStatus}`
                          : "No Action Available"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
