import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaffManagement } from "@/components/staff/fnb-supervisor/staff-management";
import { MenuManagement } from "@/components/staff/fnb-supervisor/menu-management";
import { RestaurantManagement } from "@/components/staff/fnb-supervisor/restaurant-management";
import { FinancialOverview } from "@/components/staff/fnb-supervisor/financial-overview";
import { Utensils, Users, Menu, Building2, BarChart3 } from "lucide-react";

// Definisikan tipe data berdasarkan response dari backend
interface Restaurant {
  restaurant_id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image: string;
  location: string;
  required_waiter: number;
  required_chef: number;
  operational_status: string;
  operational_start_hours: string;
  operational_end_hours: string;
}

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  restaurant_id?: string;
}

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
  customer_id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  is_paid: boolean;
  date: string;
}

// Interface untuk ApiResponse dari backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface FNBSupervisorProps {
  staffId: string;
}

export default function FNBSupervisor({ staffId }: FNBSupervisorProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data saat komponen dimuat
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

  // Jika masih loading
  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  // Jika ada error
  if (error) {
    return <div className="container mx-auto py-6">{error}</div>;
  }

  // Hitung data untuk tab Overview
  const totalRestaurants = restaurants.length;
  const openRestaurants = restaurants.filter(
    (r) => r.operational_status === "Open"
  ).length;
  const closedRestaurants = restaurants.filter(
    (r) => r.operational_status === "Closed"
  ).length;
  const staff = users.filter((u) => u.role === "Chef" || u.role === "Waiter");
  const chefs = staff.filter((u) => u.role === "Chef").length;
  const waiters = staff.filter((u) => u.role === "Waiter").length;
  const totalMenuItems = menus.length;
  const today = new Date().toISOString().split("T")[0];

  // Hitung revenue (quantity * price untuk item_type "restaurant" yang sudah dibayar)
  const paidRestaurantOrders = orders.filter(
    (o) => o.is_paid && o.item_type === "restaurant" && o.date.split("T")[0] === today
  );
  const revenue = paidRestaurantOrders.reduce((sum, order) => {
    const menuItem = menus.find((m) => m.menu_id === order.item_id);
    return menuItem ? sum + order.quantity * menuItem.price : sum;
  }, 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            F&B Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage restaurant operations, staff, and menus
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
          <Utensils className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>Staff</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center">
            <Menu className="h-4 w-4 mr-2" />
            <span>Menu</span>
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            <span>Restaurants</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span>Financial</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Restaurants
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRestaurants}</div>
                <p className="text-xs text-muted-foreground">
                  {openRestaurants} open, {closedRestaurants} closed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Staff Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staff.length}</div>
                <p className="text-xs text-muted-foreground">
                  {chefs} chefs, {waiters} waiters
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Menu Items
                </CardTitle>
                <Menu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMenuItems}</div>
                <p className="text-xs text-muted-foreground">
                  Across {totalRestaurants} restaurants
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Revenue
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {/* Jika ada data sebelumnya, bisa hitung persentase di sini */}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Restaurant Status</CardTitle>
                <CardDescription>
                  Current status of all restaurants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.restaurant_id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {restaurant.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {restaurant.cuisine_type} • {restaurant.location}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${
                            restaurant.operational_status === "Open"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm">
                          {restaurant.operational_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Allocation</CardTitle>
                <CardDescription>Current staff distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants.map((restaurant) => {
                    const requiredStaff =
                      restaurant.required_chef + restaurant.required_waiter;
                    const currentStaff = staff.filter(
                      (s) => s.restaurant_id === restaurant.restaurant_id
                    ).length;
                    const percentage =
                      requiredStaff > 0
                        ? (currentStaff / requiredStaff) * 100
                        : 0;

                    return (
                      <div key={restaurant.restaurant_id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{restaurant.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {currentStaff}/{requiredStaff}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              currentStaff >= requiredStaff
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <StaffManagement restaurants={restaurants} users={users} />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManagement menus={menus} restaurants={restaurants} />
        </TabsContent>

        <TabsContent value="restaurants">
          <RestaurantManagement
            restaurants={restaurants}
            staffId={staffId}
            users={users}
            menus={menus}
          />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialOverview
            orders={orders}
            menus={menus}
            restaurants={restaurants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
