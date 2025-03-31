"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Search,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface StoreIncome {
  id: string;
  name: string;
  image: string;
  dailyRevenue: number;
  targetRevenue: number;
  percentageToTarget: number;
  salesCount: number;
  averageSale: number;
  staffCount: number;
  topSellingItem: string;
}

interface RetailIncomeProps {
  stores: StoreIncome[];
  totalDailyIncome: number;
  totalSalesCount: number;
  date: string;
}

export function RetailIncome({
  stores,
  totalDailyIncome,
  totalSalesCount,
  date,
}: RetailIncomeProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalStores = stores.length;
  const averageStoreRevenue = totalDailyIncome / totalStores;
  const bestPerformingStore = [...stores].sort(
    (a, b) => b.dailyRevenue - a.dailyRevenue
  )[0];
  const worstPerformingStore = [...stores].sort(
    (a, b) => a.percentageToTarget - b.percentageToTarget
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Retail Income</h2>
          <p className="text-muted-foreground">
            Daily income for all stores - {date}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Daily Income
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalDailyIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all retail stores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSalesCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Best Performing
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {bestPerformingStore?.name}
            </div>
            <p className="text-xs text-muted-foreground">
              ${bestPerformingStore?.dailyRevenue.toLocaleString()} in sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Store Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageStoreRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Per store average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Top Selling Item</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                    <TableHead className="text-center">Sales</TableHead>
                    <TableHead className="text-right">Avg Sale</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Target Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No stores found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                              <img
                                src={store.image || "/placeholder.svg"}
                                alt={store.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="font-medium">{store.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{store.topSellingItem}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{store.staffCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {store.salesCount}
                        </TableCell>
                        <TableCell className="text-right">
                          ${store.averageSale.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${store.dailyRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{store.percentageToTarget}%</span>
                              <span>
                                ${store.targetRevenue.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={store.percentageToTarget}
                              className="h-2"
                              // Add color based on performance
                              style={{
                                backgroundColor:
                                  store.percentageToTarget < 50
                                    ? "#fecaca"
                                    : store.percentageToTarget < 75
                                    ? "#fed7aa"
                                    : "#bbf7d0",
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
