import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

import {
  ProductManagement,
  type Product,
  type Store as ProductStore,
} from "@/components/staff/retail/product-management";

import {
  StoreManagement,
  type RetailStore,
  type SalesAssociate,
} from "@/components/staff/retail/store-management";

import {
  SalesProposal,
  type StoreProposal,
  type ProposalStatus,
} from "@/components/staff/retail/sales-proposal";

import {
  RetailIncome,
  type StoreIncome,
} from "@/components/staff/retail/retail-income";

// Dummy data for products
const initialProducts: Product[] = [
  {
    id: "prod1",
    name: "VorteKia T-Shirt",
    description: "Official VorteKia theme park t-shirt with logo.",
    price: 24.99,
    category: "Apparel",
    image: "/placeholder.svg?height=100&width=100",
    stock: 150,
    storeId: "store1",
    storeName: "Main Gift Shop",
    status: "Active",
  },
  {
    id: "prod2",
    name: "Roller Coaster Keychain",
    description: "Metal keychain featuring our famous roller coaster.",
    price: 9.99,
    category: "Accessories",
    image: "/placeholder.svg?height=100&width=100",
    stock: 200,
    storeId: "store1",
    storeName: "Main Gift Shop",
    status: "Active",
  },
  {
    id: "prod3",
    name: "VorteKia Water Bottle",
    description: "Reusable water bottle with park map design.",
    price: 14.99,
    category: "Drinkware",
    image: "/placeholder.svg?height=100&width=100",
    stock: 75,
    storeId: "store2",
    storeName: "Adventure Zone Shop",
    status: "Low Stock",
  },
  {
    id: "prod4",
    name: "Plush Mascot Toy",
    description: "Soft plush toy of our park mascot.",
    price: 19.99,
    category: "Toys",
    image: "/placeholder.svg?height=100&width=100",
    stock: 100,
    storeId: "store3",
    storeName: "Kids' Emporium",
    status: "Active",
  },
  {
    id: "prod5",
    name: "Park Photo Frame",
    description: "Decorative frame for your park memories.",
    price: 12.99,
    category: "Home Goods",
    image: "/placeholder.svg?height=100&width=100",
    stock: 0,
    storeId: "store1",
    storeName: "Main Gift Shop",
    status: "Out of Stock",
  },
  {
    id: "prod6",
    name: "VorteKia Hoodie",
    description: "Warm hoodie with embroidered park logo.",
    price: 39.99,
    category: "Apparel",
    image: "/placeholder.svg?height=100&width=100",
    stock: 50,
    storeId: "store2",
    storeName: "Adventure Zone Shop",
    status: "Active",
  },
];

// Dummy data for stores
const initialStores: RetailStore[] = [
  {
    id: "store1",
    name: "Main Gift Shop",
    description:
      "Our flagship store located at the park entrance, offering a wide variety of souvenirs and gifts.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Park Entrance",
    status: "Active",
    productCount: 45,
    staffCount: 4,
    dailyRevenue: 3250,
  },
  {
    id: "store2",
    name: "Adventure Zone Shop",
    description: "Themed store with adventure and outdoor-focused merchandise.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Adventure Zone - Central",
    status: "Active",
    productCount: 30,
    staffCount: 2,
    dailyRevenue: 1850,
  },
  {
    id: "store3",
    name: "Kids' Emporium",
    description: "Store specializing in toys, games, and children's apparel.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Kids Zone",
    status: "Active",
    productCount: 35,
    staffCount: 3,
    dailyRevenue: 2100,
  },
  {
    id: "store4",
    name: "Thrill Seeker Outlet",
    description:
      "Merchandise related to our most thrilling rides and attractions.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Thrill Zone",
    status: "Under Renovation",
    productCount: 20,
    staffCount: 1,
    dailyRevenue: 950,
  },
];

// Dummy data for store proposals
const initialProposals: StoreProposal[] = [
  {
    id: "prop1",
    name: "VorteKia Tech Hub",
    description:
      "A modern store focusing on tech gadgets, smart souvenirs, and interactive merchandise.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Innovation Zone",
    proposedBy: "Alex Johnson",
    submittedDate: "March 25, 2025",
    status: "Pending",
    estimatedCost: 85000,
    estimatedRevenue: 150000,
    roi: 76.5,
    category: "Technology",
    targetMarket: "Teens and Young Adults",
  },
  {
    id: "prop2",
    name: "Aquatic Treasures",
    description:
      "Nautical-themed store with ocean and marine life merchandise, located near the water attractions.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Water Park Area",
    proposedBy: "Maria Rodriguez",
    submittedDate: "March 20, 2025",
    status: "Approved",
    estimatedCost: 65000,
    estimatedRevenue: 120000,
    roi: 84.6,
    category: "Themed Merchandise",
    targetMarket: "Families and Water Attraction Visitors",
    feedback:
      "Great concept that aligns with our water park expansion. Approved for implementation in Q3.",
  },
  {
    id: "prop3",
    name: "Retro Arcade Shop",
    description:
      "Vintage gaming merchandise, collectibles, and arcade-themed souvenirs.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Entertainment District",
    proposedBy: "Current Retail Manager",
    submittedDate: "March 15, 2025",
    status: "Rejected",
    estimatedCost: 70000,
    estimatedRevenue: 95000,
    roi: 35.7,
    category: "Gaming & Entertainment",
    targetMarket: "Gamers and Nostalgia Enthusiasts",
    feedback:
      "ROI is too low compared to our minimum threshold of 50%. Consider revising the concept or finding ways to increase revenue projections.",
  },
];

// Dummy data for sales associates
const initialSalesAssociates: SalesAssociate[] = [
  { id: "staff1", name: "Emma Thompson", assignedStoreId: "store1" },
  { id: "staff2", name: "James Wilson", assignedStoreId: "store1" },
  { id: "staff3", name: "Sophia Martinez", assignedStoreId: "store2" },
  { id: "staff4", name: "Noah Garcia", assignedStoreId: "store3" },
  { id: "staff5", name: "Olivia Brown", assignedStoreId: "store1" },
  { id: "staff6", name: "William Davis", assignedStoreId: "store3" },
  { id: "staff7", name: "Ava Johnson", assignedStoreId: "store1" },
  { id: "staff8", name: "Liam Miller", assignedStoreId: "store2" },
  { id: "staff9", name: "Isabella Wilson", assignedStoreId: "store3" },
  { id: "staff10", name: "Mason Taylor" },
  { id: "staff11", name: "Charlotte Anderson" },
];

// Dummy data for store income
const initialStoreIncome: StoreIncome[] = [
  {
    id: "store1",
    name: "Main Gift Shop",
    image: "/placeholder.svg?height=200&width=400",
    dailyRevenue: 3250,
    targetRevenue: 4000,
    percentageToTarget: 81,
    salesCount: 130,
    averageSale: 25,
    staffCount: 4,
    topSellingItem: "VorteKia T-Shirt",
  },
  {
    id: "store2",
    name: "Adventure Zone Shop",
    image: "/placeholder.svg?height=200&width=400",
    dailyRevenue: 1850,
    targetRevenue: 2000,
    percentageToTarget: 92,
    salesCount: 74,
    averageSale: 25,
    staffCount: 2,
    topSellingItem: "VorteKia Hoodie",
  },
  {
    id: "store3",
    name: "Kids' Emporium",
    image: "/placeholder.svg?height=200&width=400",
    dailyRevenue: 2100,
    targetRevenue: 2500,
    percentageToTarget: 84,
    salesCount: 105,
    averageSale: 20,
    staffCount: 3,
    topSellingItem: "Plush Mascot Toy",
  },
  {
    id: "store4",
    name: "Thrill Seeker Outlet",
    image: "/placeholder.svg?height=200&width=400",
    dailyRevenue: 950,
    targetRevenue: 1500,
    percentageToTarget: 63,
    salesCount: 38,
    averageSale: 25,
    staffCount: 1,
    topSellingItem: "Roller Coaster Model",
  },
];

export default function RetailManager() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stores, setStores] = useState<RetailStore[]>(initialStores);
  const [proposals, setProposals] = useState<StoreProposal[]>(initialProposals);
  const [salesAssociates, setSalesAssociates] = useState<SalesAssociate[]>(
    initialSalesAssociates
  );
  const [storeIncome, setStoreIncome] =
    useState<StoreIncome[]>(initialStoreIncome);
  const [activeTab, setActiveTab] = useState("products");

  // Calculate totals for income view
  const totalDailyIncome = storeIncome.reduce(
    (sum, store) => sum + store.dailyRevenue,
    0
  );
  const totalSalesCount = storeIncome.reduce(
    (sum, store) => sum + store.salesCount,
    0
  );
  const currentDate = format(new Date(), "MMMM d, yyyy");

  // Product Management Handlers
  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const productWithId = {
      ...newProduct,
      id: uuidv4(),
    };
    setProducts((prev) => [productWithId, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  // Store Management Handlers
  const handleUpdateStore = (updatedStore: RetailStore) => {
    setStores((prev) =>
      prev.map((store) => (store.id === updatedStore.id ? updatedStore : store))
    );
  };

  const handleRequestRemoval = (storeId: string, reason: string) => {
    // In a real app, this would send a request to the CEO
    console.log(`Removal request for store ${storeId}: ${reason}`);
    // For demo purposes, we'll just mark the store as "Under Renovation"
    setStores((prev) =>
      prev.map((store) =>
        store.id === storeId ? { ...store, status: "Under Renovation" } : store
      )
    );
  };

  const handleAssignStaff = (storeId: string, staffId: string) => {
    // Update the staff assignment
    setSalesAssociates((prev) =>
      prev.map((staff) => {
        if (staff.id === staffId) {
          return { ...staff, assignedStoreId: storeId };
        }
        return staff;
      })
    );

    // Update store staff count
    setStores((prev) =>
      prev.map((store) => {
        const storeStaffCount = salesAssociates.filter(
          (staff) => staff.assignedStoreId === store.id
        ).length;

        if (store.id === storeId) {
          return { ...store, staffCount: storeStaffCount + 1 };
        } else {
          return store;
        }
      })
    );
  };

  // Proposal Handlers
  const handleSubmitProposal = (
    newProposal: Omit<
      StoreProposal,
      "id" | "status" | "submittedDate" | "feedback"
    >
  ) => {
    const proposalWithId = {
      ...newProposal,
      id: uuidv4(),
      status: "Pending" as ProposalStatus,
      submittedDate: format(new Date(), "MMMM d, yyyy"),
    };
    setProposals((prev) => [proposalWithId, ...prev]);
  };

  // Get stores for product management dropdown
  const productStores: ProductStore[] = stores.map((store) => ({
    id: store.id,
    name: store.name,
  }));

  return (
    <main className="min-h-screen w-full bg-background">
        <div className="mt-12 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <ProductManagement
                products={products}
                stores={productStores}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </TabsContent>

            <TabsContent value="stores" className="mt-6">
              <StoreManagement
                stores={stores}
                salesAssociates={salesAssociates}
                onUpdateStore={handleUpdateStore}
                onRequestRemoval={handleRequestRemoval}
                onAssignStaff={handleAssignStaff}
              />
            </TabsContent>

            <TabsContent value="proposals" className="mt-6">
              <SalesProposal
                proposals={proposals}
                onSubmitProposal={handleSubmitProposal}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-6">
              <RetailIncome
                stores={storeIncome}
                totalDailyIncome={totalDailyIncome}
                totalSalesCount={totalSalesCount}
                date={currentDate}
              />
            </TabsContent>
          </Tabs>
        </div>
    </main>
  );
}
