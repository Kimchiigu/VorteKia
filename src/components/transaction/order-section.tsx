import { useEffect, useState } from "react";
import { useAuth } from "../provider/auth-provider";
import { invoke } from "@tauri-apps/api/core";
import OrderSummary from "./order-summary";
import CheckoutDialog from "./checkout-dialog";
import OrderItem from "./order-item";
import BackHeader from "../util/back-header";

export default function OrderSection({ pageType }: OrderSectionProps) {
  const user = useAuth();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemDetails, setItemDetails] = useState<{
    [key: string]: ItemDetails;
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  useEffect(() => {
    if (user.user?.user_id) {
      setCustomerId(user.user.user_id);
    }
  }, [user.user?.user_id]);

  useEffect(() => {
    async function fetchOrders() {
      if (!customerId) {
        console.error("❌ Missing customer_id: User is not logged in.");
        setLoading(false);
        return;
      }

      console.log("Fetching orders for user ID:", customerId);

      try {
        const ordersResponse = await invoke("view_orders", {
          customerId: customerId,
          orderType: pageType,
        });

        if (ordersResponse && Array.isArray(ordersResponse.data)) {
          const unpaidOrders = ordersResponse.data.filter(
            (order: Order) => !order.is_paid
          );
          setOrders(unpaidOrders);
          fetchItemDetails(unpaidOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      fetchOrders();
    }
  }, [pageType, customerId]);

  async function fetchItemDetails(orders: Order[]) {
    const newItemDetails: { [key: string]: ItemDetails } = {};

    await Promise.all(
      orders.map(async (order) => {
        try {
          let response;
          if (order.item_type === "restaurant") {
            response = await invoke("view_menu", { menuId: order.item_id });
          } else if (order.item_type === "store") {
            response = await invoke("view_souvenir", {
              souvenirId: order.item_id,
            });
          }

          if (response && response.data) {
            newItemDetails[order.item_id] = {
              name: response.data.name,
              description: response.data.description,
              price: response.data.price,
              image: response.data.image
                ? `data:image/png;base64,${response.data.image}`
                : "/placeholder.svg",
            };
          }
        } catch (error) {
          console.error(
            `Failed to fetch item details for ${order.item_id}:`,
            error
          );
        }
      })
    );

    setItemDetails(newItemDetails);
  }

  const balance = user.user?.balance || 0;
  const subtotal = orders.reduce((total, order) => {
    const item = itemDetails[order.item_id];
    return total + (item ? item.price * order.quantity : 0);
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const totalItems = orders.reduce((count, order) => count + order.quantity, 0);
  const insufficientBalance = (user.user?.balance || 0) < total;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackHeader pageType={pageType} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <OrderItem
          orders={orders}
          itemDetails={itemDetails}
          totalItems={totalItems}
          loading={loading}
        />
        <OrderSummary
          orders={orders}
          subtotal={subtotal}
          tax={tax}
          total={total}
          insufficientBalance={insufficientBalance}
          balance={balance}
          setCheckoutDialogOpen={setCheckoutDialogOpen}
        />
        <CheckoutDialog
          totalItems={totalItems}
          subtotal={subtotal}
          tax={tax}
          total={total}
          balance={user.user?.balance || 0}
          checkoutDialogOpen={checkoutDialogOpen}
          setCheckoutDialogOpen={setCheckoutDialogOpen}
          orders={orders}
        />
      </div>
    </div>
  );
}
