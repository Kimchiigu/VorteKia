import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// Props to determine which page is currently active
interface OrderSectionProps {
  pageType: "restaurant" | "store" | "ride";
  customerId: string; // Logged-in user
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  orderType: string;
}

export default function OrderDataSection({
  pageType,
  customerId,
}: OrderSectionProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOrderItems() {
      try {
        const response: OrderItem[] = await invoke("view_orders", {
          customer_id: customerId,
          order_type: pageType,
        });
        setOrderItems(response);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderItems();
  }, [pageType, customerId]);

  return (
    <section>
      <h2>Your {pageType} Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : orderItems.length > 0 ? (
        <ul>
          {orderItems.map((item) => (
            <li key={item.id}>
              {item.name} - ${item.price} (x{item.quantity})
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found for {pageType}.</p>
      )}
    </section>
  );
}
