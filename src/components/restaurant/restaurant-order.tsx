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

export type OrderStatus = "Not Done" | "Waiting for Delivery" | "Delivered";

export interface Order {
  id: string;
  orderNumber: number;
  foodName: string;
  customerId: string;
  status: OrderStatus;
}

interface RestaurantOrderProps {
  orders: Order[];
  userRole: "chef" | "waiter";
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function RestaurantOrder({
  orders,
  userRole,
  onUpdateStatus,
}: RestaurantOrderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(
    (order) =>
      order.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toString().includes(searchTerm)
  );

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    if (userRole === "chef" && currentStatus === "Not Done") {
      return "Waiting for Delivery";
    } else if (
      userRole === "waiter" &&
      currentStatus === "Waiting for Delivery"
    ) {
      return "Delivered";
    }
    return null;
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "Not Done":
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                const canUpdateStatus = nextStatus !== null;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.order_id}
                    </TableCell>
                    <TableCell>{order.menu_id}</TableCell>
                    <TableCell>{order.customer_id}</TableCell>
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
                          nextStatus && onUpdateStatus(order.id, nextStatus)
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
