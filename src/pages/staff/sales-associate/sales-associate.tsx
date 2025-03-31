import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { HeroStaff } from "@/components/staff/hero-staff";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreDetail } from "@/components/store/store-detail";
import { StoreIncome, type Order } from "@/components/store/store-income";

// Dummy data for store
const storeData = {
  id: "store1",
  name: "VorteKia Fashion Outlet",
  description:
    "Premium fashion retail store offering the latest trends in clothing, accessories, and footwear.",
  image: "/placeholder.svg?height=400&width=800",
  location: "123 Fashion Avenue, Shopping Mall, Level 2",
  operatingHours: "Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM",
  salesStats: {
    dailyTarget: 15000,
    currentSales: 12450,
    percentageToTarget: 83,
    customerCount: 187,
    averageOrderValue: 66.58,
  },
};

// Dummy data for daily income
const dailyIncomeData = {
  date: "March 31, 2025",
  totalAmount: 12450,
  orderCount: 187,
  topSellingItem: "Designer T-Shirt",
};

// Dummy data for orders
const ordersData: Order[] = [
  {
    id: "ord1",
    orderNumber: "ORD-2025-001",
    time: "09:15 AM",
    items: [
      { name: "Designer T-Shirt", quantity: 2, price: 49.99 },
      { name: "Slim Fit Jeans", quantity: 1, price: 79.99 },
    ],
    totalAmount: 179.97,
    paymentMethod: "Credit Card",
  },
  {
    id: "ord2",
    orderNumber: "ORD-2025-002",
    time: "10:22 AM",
    items: [
      { name: "Summer Dress", quantity: 1, price: 89.99 },
      { name: "Leather Belt", quantity: 1, price: 29.99 },
    ],
    totalAmount: 119.98,
    paymentMethod: "Cash",
  },
  {
    id: "ord3",
    orderNumber: "ORD-2025-003",
    time: "11:05 AM",
    items: [
      { name: "Designer T-Shirt", quantity: 1, price: 49.99 },
      { name: "Sunglasses", quantity: 1, price: 129.99 },
    ],
    totalAmount: 179.98,
    paymentMethod: "Mobile Payment",
  },
  {
    id: "ord4",
    orderNumber: "ORD-2025-004",
    time: "12:30 PM",
    items: [
      { name: "Running Shoes", quantity: 1, price: 119.99 },
      { name: "Sports Socks (3 Pack)", quantity: 1, price: 19.99 },
    ],
    totalAmount: 139.98,
    paymentMethod: "Credit Card",
  },
  {
    id: "ord5",
    orderNumber: "ORD-2025-005",
    time: "01:45 PM",
    items: [{ name: "Winter Jacket", quantity: 1, price: 199.99 }],
    totalAmount: 199.99,
    paymentMethod: "Cash",
  },
  {
    id: "ord6",
    orderNumber: "ORD-2025-006",
    time: "02:50 PM",
    items: [
      { name: "Designer T-Shirt", quantity: 3, price: 49.99 },
      { name: "Casual Shorts", quantity: 2, price: 39.99 },
    ],
    totalAmount: 229.95,
    paymentMethod: "Mobile Payment",
  },
];

export default function SalesAssociate() {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Store Details</TabsTrigger>
            <TabsTrigger value="income">View Income</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Store Information</h2>
            <StoreDetail store={storeData} />
          </TabsContent>
          <TabsContent value="income" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Daily Income</h2>
            <StoreIncome dailyIncome={dailyIncomeData} orders={ordersData} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
