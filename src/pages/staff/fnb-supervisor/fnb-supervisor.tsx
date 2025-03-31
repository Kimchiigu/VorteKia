import { useState } from "react";
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

export default function FNBSupervisor() {
  const [activeTab, setActiveTab] = useState("overview");

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
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  2 open, 1 closed
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
                <div className="text-2xl font-bold">14</div>
                <p className="text-xs text-muted-foreground">
                  5 chefs, 9 waiters
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
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Across 3 restaurants
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
                <div className="text-2xl font-bold">$9,246.50</div>
                <p className="text-xs text-muted-foreground">
                  +4.3% from yesterday
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
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Parkside Grill
                      </p>
                      <p className="text-sm text-muted-foreground">
                        American • Main Street
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Open</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Thrill Bites
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fast Food • Thrill Zone
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Open</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Adventure Café
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Café • Adventure Avenue
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Closed</span>
                    </div>
                  </div>
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
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Parkside Grill</span>
                      <span className="text-sm text-muted-foreground">5/5</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Thrill Bites</span>
                      <span className="text-sm text-muted-foreground">3/3</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Adventure Café</span>
                      <span className="text-sm text-muted-foreground">2/6</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-1/3"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManagement />
        </TabsContent>

        <TabsContent value="restaurants">
          <RestaurantManagement />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
