interface Order {
  order_id: string;
  customer_id: string;
  item_type: string;
  item_id: string;
  date: string;
  quantity: number;
  is_paid: boolean;
  status?: string;
}
