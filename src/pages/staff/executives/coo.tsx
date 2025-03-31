import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  StaffCreation,
  type NewStaffData,
} from "@/components/staff/executives/staff-creation";
import {
  RideManagement,
  type Ride,
} from "@/components/staff/executives/ride-management";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Clock, Users, Wrench } from "lucide-react";

// Sample data for rides
const initialRides: Ride[] = [
  {
    id: "ride1",
    name: "Thunderbolt Roller Coaster",
    description: "A high-speed roller coaster with multiple loops and drops.",
    location: "Thrill Zone",
    status: "Operational",
    capacity: 24,
    hourlyCapacity: 800,
    minHeight: 122,
    duration: 3,
    thrill: "Extreme",
    openingYear: 2018,
    lastMaintenance: "February 15, 2025",
    nextMaintenance: "April 15, 2025",
    maintenanceFrequency: "Bi-monthly",
    operatingHours: "9:00 AM - 8:00 PM",
    staffRequired: 6,
    currentStaffCount: 6,
    image: "/placeholder.svg?height=200&width=600",
  },
  {
    id: "ride2",
    name: "Splash Mountain",
    description: "A water log ride with a thrilling drop at the end.",
    location: "Water World",
    status: "Operational",
    capacity: 8,
    hourlyCapacity: 600,
    minHeight: 107,
    duration: 7,
    thrill: "High",
    openingYear: 2019,
    lastMaintenance: "March 1, 2025",
    nextMaintenance: "May 1, 2025",
    maintenanceFrequency: "Bi-monthly",
    operatingHours: "10:00 AM - 7:00 PM",
    staffRequired: 4,
    currentStaffCount: 3,
    image: "/placeholder.svg?height=200&width=600",
  },
  {
    id: "ride3",
    name: "Haunted Mansion",
    description: "A spooky dark ride through a haunted house.",
    location: "Fantasy Land",
    status: "Maintenance",
    capacity: 4,
    hourlyCapacity: 400,
    minHeight: 102,
    duration: 8,
    thrill: "Moderate",
    openingYear: 2017,
    lastMaintenance: "March 20, 2025",
    nextMaintenance: "March 25, 2025",
    maintenanceFrequency: "Quarterly",
    operatingHours: "10:00 AM - 9:00 PM",
    staffRequired: 5,
    currentStaffCount: 5,
    image: "/placeholder.svg?height=200&width=600",
  },
  {
    id: "ride4",
    name: "Carousel",
    description: "A classic carousel ride suitable for all ages.",
    location: "Kids Zone",
    status: "Operational",
    capacity: 30,
    hourlyCapacity: 300,
    minHeight: 91,
    duration: 5,
    thrill: "Low",
    openingYear: 2015,
    lastMaintenance: "January 10, 2025",
    nextMaintenance: "April 10, 2025",
    maintenanceFrequency: "Quarterly",
    operatingHours: "9:00 AM - 7:00 PM",
    staffRequired: 2,
    currentStaffCount: 2,
    image: "/placeholder.svg?height=200&width=600",
  },
  {
    id: "ride5",
    name: "Space Odyssey",
    description: "A space-themed simulator ride with immersive effects.",
    location: "Future World",
    status: "Closed",
    capacity: 16,
    hourlyCapacity: 240,
    minHeight: 112,
    duration: 6,
    thrill: "High",
    openingYear: 2020,
    lastMaintenance: "December 5, 2024",
    nextMaintenance: "March 5, 2025",
    maintenanceFrequency: "Quarterly",
    operatingHours: "10:00 AM - 8:00 PM",
    staffRequired: 4,
    currentStaffCount: 0,
    image: "/placeholder.svg?height=200&width=600",
  },
];

// Sample data for staff
const initialStaff: NewStaffData[] = [
  {
    id: "VK-RIJS123456-001",
    name: "John Smith",
    email: "john.smith@vortekia.com",
    phone: "555-123-4567",
    role: "Ride Staff",
    department: "Rides",
    password: "password123",
  },
  {
    id: "VK-MAED987654-002",
    name: "Emily Davis",
    email: "emily.davis@vortekia.com",
    phone: "555-987-6543",
    role: "Maintenance Staff",
    department: "Maintenance",
    password: "password456",
  },
];

export default function COO() {
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [staff, setStaff] = useState<NewStaffData[]>(initialStaff);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Ride Management handlers
  const handleAddRide = (newRide: Omit<Ride, "id">) => {
    const rideWithId = {
      ...newRide,
      id: uuidv4(),
    };
    setRides((prev) => [rideWithId, ...prev]);
  };

  const handleUpdateRide = (updatedRide: Ride) => {
    setRides((prev) =>
      prev.map((ride) => (ride.id === updatedRide.id ? updatedRide : ride))
    );
  };

  const handleDeleteRide = (rideId: string) => {
    setRides((prev) => prev.filter((ride) => ride.id !== rideId));
  };

  // Staff Creation handler
  const handleCreateStaff = (newStaff: NewStaffData) => {
    setStaff((prev) => [newStaff, ...prev]);
  };

  // Count rides by status
  const operationalRides = rides.filter(
    (r) => r.status === "Operational"
  ).length;
  const maintenanceRides = rides.filter(
    (r) => r.status === "Maintenance"
  ).length;
  const closedRides = rides.filter((r) => r.status === "Closed").length;
  const constructionRides = rides.filter(
    (r) => r.status === "Under Construction"
  ).length;

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">COO Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage park operations, rides, and staff
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="text-muted-foreground">Today is</span>
            <span className="font-medium">
              {format(new Date(), "MMMM d, yyyy")}
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="rides">Ride Management</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Operational Rides
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{operationalRides}</div>
                  <p className="text-xs text-muted-foreground">
                    {operationalRides > 0
                      ? `${operationalRides} rides currently operational`
                      : "No operational rides"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Maintenance
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{maintenanceRides}</div>
                  <p className="text-xs text-muted-foreground">
                    {maintenanceRides > 0
                      ? `${maintenanceRides} rides under maintenance`
                      : "No rides under maintenance"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Closed Rides
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{closedRides}</div>
                  <p className="text-xs text-muted-foreground">
                    {closedRides > 0
                      ? `${closedRides} rides currently closed`
                      : "No closed rides"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Under Construction
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{constructionRides}</div>
                  <p className="text-xs text-muted-foreground">
                    {constructionRides > 0
                      ? `${constructionRides} rides under construction`
                      : "No rides under construction"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ride Status Overview</CardTitle>
                  <CardDescription>
                    Current status of all rides in the park
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">
                    Ride status chart will display here
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>
                    Upcoming maintenance for rides
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">
                    Maintenance schedule will display here
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rides" className="mt-6">
            <RideManagement
              rides={rides}
              onAddRide={handleAddRide}
              onUpdateRide={handleUpdateRide}
              onDeleteRide={handleDeleteRide}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Maintenance Management
                  </h2>
                  <p className="text-muted-foreground">
                    Oversee and manage maintenance schedules for all rides
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>
                    View and manage upcoming maintenance tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">
                    Maintenance schedule component will be displayed here
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Staff Management
                  </h2>
                  <p className="text-muted-foreground">
                    Create and manage staff accounts
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <StaffCreation onCreateStaff={handleCreateStaff} />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Staff Overview</CardTitle>
                    <CardDescription>
                      Current staff members by department
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] flex items-center justify-center bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">
                      Staff overview chart will display here
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
