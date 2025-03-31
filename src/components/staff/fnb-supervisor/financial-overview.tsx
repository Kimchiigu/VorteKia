"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, DollarSign, TrendingUp } from "lucide-react";

interface RestaurantIncome {
  id: string;
  name: string;
  totalIncome: number;
  mealsSold: number;
  averageOrderValue: number;
  comparisonToYesterday: number;
}

export function FinancialOverview() {
  // Mock data - in a real app, this would come from an API
  const [restaurantIncomes] = useState<RestaurantIncome[]>([
    {
      id: "rest1",
      name: "Parkside Grill",
      totalIncome: 4250.75,
      mealsSold: 187,
      averageOrderValue: 22.73,
      comparisonToYesterday: 8.5,
    },
    {
      id: "rest2",
      name: "Thrill Bites",
      totalIncome: 3120.5,
      mealsSold: 312,
      averageOrderValue: 10.0,
      comparisonToYesterday: -3.2,
    },
    {
      id: "rest3",
      name: "Adventure Café",
      totalIncome: 1875.25,
      mealsSold: 145,
      averageOrderValue: 12.93,
      comparisonToYesterday: 5.7,
    },
  ]);

  const [sortBy, setSortBy] = useState<string>("income");

  const totalDailyIncome = restaurantIncomes.reduce(
    (sum, restaurant) => sum + restaurant.totalIncome,
    0
  );
  const totalMealsSold = restaurantIncomes.reduce(
    (sum, restaurant) => sum + restaurant.mealsSold,
    0
  );
  const averageOrderValue = totalDailyIncome / totalMealsSold;

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

  // Mock data for hourly income
  const hourlyData = [
    { hour: "8 AM", income: 120.5 },
    { hour: "9 AM", income: 245.75 },
    { hour: "10 AM", income: 380.25 },
    { hour: "11 AM", income: 520.5 },
    { hour: "12 PM", income: 950.75 },
    { hour: "1 PM", income: 1120.25 },
    { hour: "2 PM", income: 875.5 },
    { hour: "3 PM", income: 650.25 },
    { hour: "4 PM", income: 580.75 },
    { hour: "5 PM", income: 720.5 },
    { hour: "6 PM", income: 1050.25 },
    { hour: "7 PM", income: 950.75 },
    { hour: "8 PM", income: 780.5 },
    { hour: "9 PM", income: 450.25 },
  ];

  // Calculate max income for scaling the chart
  const maxIncome = Math.max(...hourlyData.map((item) => item.income));

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
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Daily Summary</TabsTrigger>
              <TabsTrigger value="hourly">Hourly Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
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
                      <SelectItem value="average">
                        Average Order Value
                      </SelectItem>
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
                      <TableHead className="text-right">
                        Avg. Order Value
                      </TableHead>
                      <TableHead className="text-right">
                        vs. Yesterday
                      </TableHead>
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
            </TabsContent>

            <TabsContent value="hourly">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Income Distribution</CardTitle>
                  <CardDescription>
                    Income breakdown by hour across all restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <div className="flex h-full items-end space-x-2">
                      {hourlyData.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className="w-full bg-primary rounded-t-md"
                            style={{
                              height: `${(item.income / maxIncome) * 100}%`,
                            }}
                          ></div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {item.hour}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Peak hours: 12 PM - 1 PM and 6 PM - 7 PM
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
