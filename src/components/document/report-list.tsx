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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Ticket,
} from "lucide-react";

export interface ReportData {
  id: string;
  period: string;
  rideIncome: number;
  marketingIncome: number;
  consumptionIncome: number;
  totalIncome: number;
  percentageChange: number;
  details: {
    source: string;
    amount: number;
    percentageOfTotal: number;
    change: number;
  }[];
}

interface ReportListProps {
  reports: ReportData[];
  role?: "cfo" | "manager" | "supervisor";
}

export function ReportList({ reports, role = "cfo" }: ReportListProps) {
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day");
  const [revenueSource, setRevenueSource] = useState<
    "all" | "rides" | "marketing" | "consumption"
  >("all");

  // Filter reports based on selected time period
  const filteredReports = reports.filter((report) => {
    if (timeFilter === "day" && report.period.includes("Day")) return true;
    if (timeFilter === "week" && report.period.includes("Week")) return true;
    if (timeFilter === "month" && report.period.includes("Month")) return true;
    return false;
  });

  // Get the most recent report for summary cards
  const latestReport = filteredReports[0] || reports[0];

  // Filter report details based on selected revenue source
  const filteredDetails = latestReport?.details.filter((detail) => {
    if (revenueSource === "all") return true;
    if (
      revenueSource === "rides" &&
      detail.source.toLowerCase().includes("ride")
    )
      return true;
    if (
      revenueSource === "marketing" &&
      detail.source.toLowerCase().includes("marketing")
    )
      return true;
    if (
      revenueSource === "consumption" &&
      detail.source.toLowerCase().includes("food")
    )
      return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Financial Reports
          </h2>
          <p className="text-muted-foreground">
            View and analyze revenue from all sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestReport?.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestReport?.percentageChange >= 0 ? "+" : ""}
              {latestReport?.percentageChange}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ride Revenue</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestReport?.rideIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (latestReport?.rideIncome / latestReport?.totalIncome) * 100
              )}
              % of total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Marketing Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestReport?.marketingIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (latestReport?.marketingIncome / latestReport?.totalIncome) *
                  100
              )}
              % of total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">F&B Revenue</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestReport?.consumptionIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (latestReport?.consumptionIncome / latestReport?.totalIncome) *
                  100
              )}
              % of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select
            value={timeFilter}
            onValueChange={(value) =>
              setTimeFilter(value as "day" | "week" | "month")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={revenueSource}
            onValueChange={(value) =>
              setRevenueSource(
                value as "all" | "rides" | "marketing" | "consumption"
              )
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Revenue source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="rides">Rides</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="consumption">Food & Beverage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detailed View</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDetails?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No data available for the selected filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDetails?.map((detail) => (
                          <TableRow key={detail.source}>
                            <TableCell className="font-medium">
                              {detail.source}
                            </TableCell>
                            <TableCell className="text-right">
                              ${detail.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {detail.percentageOfTotal}%
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  detail.change >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {detail.change >= 0 ? "+" : ""}
                                {detail.change}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">
                          Ride Income
                        </TableHead>
                        <TableHead className="text-right">
                          Marketing Income
                        </TableHead>
                        <TableHead className="text-right">F&B Income</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No data available for the selected time period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              {report.period}
                            </TableCell>
                            <TableCell className="text-right">
                              ${report.rideIncome.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${report.marketingIncome.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${report.consumptionIncome.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${report.totalIncome.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
