import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, DollarSign, TrendingUp } from "lucide-react";

interface Order {
  order_id: string;
  customer_id: string;
  item_type: string;
  item_id: string;
  date: string;
  quantity: number;
  is_paid: boolean;
}

interface Menu {
  menu_id: string;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  image?: string;
  restaurant_id: string;
}

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

interface RestaurantIncome {
  id: string;
  name: string;
  totalIncome: number;
  mealsSold: number;
  averageOrderValue: number;
  comparisonToYesterday: number;
}

interface FinancialOverviewProps {
  orders: Order[];
  menus: Menu[];
  restaurants: Restaurant[];
}

export function FinancialOverview({
  orders,
  menus,
  restaurants,
}: FinancialOverviewProps) {
  const [restaurantIncomes, setRestaurantIncomes] = useState<
    RestaurantIncome[]
  >([]);
  const [sortBy, setSortBy] = useState<string>("income");

  useEffect(() => {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];

    orders.forEach((order) => {
      order.date = order.date.split("T")[0];
    });

    console.log("Updated Orders :", orders);

    const todayOrders = orders.filter(
      (order) =>
        order.date === todayDate &&
        order.item_type === "restaurant" &&
        order.is_paid
    );

    const yesterdayOrders = orders.filter(
      (order) =>
        order.date === yesterdayDate &&
        order.item_type === "restaurant" &&
        order.is_paid
    );

    const menuMap = new Map(menus.map((menu) => [menu.menu_id, menu]));

    const restaurantData: {
      [key: string]: {
        totalIncome: number;
        mealsSold: number;
        orderCount: number;
      };
    } = {};

    todayOrders.forEach((order) => {
      const menu = menuMap.get(order.item_id);
      if (menu) {
        const revenue = menu.price * order.quantity;
        if (!restaurantData[menu.restaurant_id]) {
          restaurantData[menu.restaurant_id] = {
            totalIncome: 0,
            mealsSold: 0,
            orderCount: 0,
          };
        }
        restaurantData[menu.restaurant_id].totalIncome += revenue;
        restaurantData[menu.restaurant_id].mealsSold += order.quantity;
        restaurantData[menu.restaurant_id].orderCount += 1;
      }
    });

    const yesterdayData: { [key: string]: number } = {};
    yesterdayOrders.forEach((order) => {
      const menu = menuMap.get(order.item_id);
      if (menu) {
        if (!yesterdayData[menu.restaurant_id]) {
          yesterdayData[menu.restaurant_id] = 0;
        }
        yesterdayData[menu.restaurant_id] += menu.price * order.quantity;
      }
    });

    const incomes: RestaurantIncome[] = restaurants.map((restaurant) => {
      const data = restaurantData[restaurant.restaurant_id] || {
        totalIncome: 0,
        mealsSold: 0,
        orderCount: 0,
      };
      const averageOrderValue =
        data.orderCount > 0 ? data.totalIncome / data.orderCount : 0;
      const yesterdayIncome = yesterdayData[restaurant.restaurant_id] || 0;
      const comparisonToYesterday =
        yesterdayIncome > 0
          ? ((data.totalIncome - yesterdayIncome) / yesterdayIncome) * 100
          : 0;

      return {
        id: restaurant.restaurant_id,
        name: restaurant.name,
        totalIncome: data.totalIncome,
        mealsSold: data.mealsSold,
        averageOrderValue,
        comparisonToYesterday,
      };
    });

    setRestaurantIncomes(incomes);
  }, [orders, menus, restaurants]);

  const totalDailyIncome = restaurantIncomes.reduce(
    (sum, restaurant) => sum + restaurant.totalIncome,
    0
  );
  const totalMealsSold = restaurantIncomes.reduce(
    (sum, restaurant) => sum + restaurant.mealsSold,
    0
  );
  const averageOrderValue =
    totalMealsSold > 0 ? totalDailyIncome / totalMealsSold : 0;

  const sortedRestaurants = [...restaurantIncomes].sort((a, b) => {
    switch (sortBy) {
      case "income":
        return b.totalIncome - a.totalIncome;
      case "meals":
        return b.mealsSold - a.mealsSold;
      case "average":
        return b.averageOrderValue - a.averageOrderValue;
      case "comparison":
        return b.comparisonToYesterday - a.comparisonToYesterday;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            View daily income and performance metrics for all restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Daily Income
                    </p>
                    <h3 className="text-2xl font-bold">
                      ${totalDailyIncome.toFixed(2)}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Meals Sold
                    </p>
                    <h3 className="text-2xl font-bold">{totalMealsSold}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Order Value
                    </p>
                    <h3 className="text-2xl font-bold">
                      ${averageOrderValue.toFixed(2)}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <div>
              <Label htmlFor="sort-by" className="mr-2">
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Total Income</SelectItem>
                  <SelectItem value="meals">Meals Sold</SelectItem>
                  <SelectItem value="average">Average Order Value</SelectItem>
                  <SelectItem value="comparison">
                    Comparison to Yesterday
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead className="text-right">Total Income</TableHead>
                  <TableHead className="text-right">Meals Sold</TableHead>
                  <TableHead className="text-right">Avg. Order Value</TableHead>
                  <TableHead className="text-right">vs. Yesterday</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">
                      {restaurant.name}
                    </TableCell>
                    <TableCell className="text-right">
                      ${restaurant.totalIncome.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {restaurant.mealsSold}
                    </TableCell>
                    <TableCell className="text-right">
                      ${restaurant.averageOrderValue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {restaurant.comparisonToYesterday > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span
                          className={
                            restaurant.comparisonToYesterday > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {Math.abs(restaurant.comparisonToYesterday)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
