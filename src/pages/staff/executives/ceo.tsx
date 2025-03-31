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
import { Button } from "@/components/ui/button";
import {
  ProposalApproval,
  type Proposal,
  type ProposalStatus,
} from "@/components/staff/executives/proposal-approval";
import { format } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Store,
  Utensils,
  Users,
  Wrench,
} from "lucide-react";

// Sample data for proposals
const initialProposals: Proposal[] = [
  {
    id: "prop1",
    type: "Store",
    name: "VorteKia Tech Hub",
    submittedBy: "Retail Manager",
    submittedDate: "March 25, 2025",
    description:
      "A modern store focusing on tech gadgets, smart souvenirs, and interactive merchandise.",
    status: "Pending",
    image: "/placeholder.svg?height=200&width=400",
    details: {
      location: "Innovation Zone",
      size: "1,200 sq ft",
      category: "Technology",
      estimatedCost: 85000,
      estimatedRevenue: 150000,
      roi: 76.5,
    },
  },
  {
    id: "prop2",
    type: "Restaurant",
    name: "Cosmic Cuisine",
    submittedBy: "F&B Supervisor",
    submittedDate: "March 22, 2025",
    description:
      "A space-themed restaurant offering international fusion dishes in an immersive environment.",
    status: "Pending",
    image: "/placeholder.svg?height=200&width=400",
    details: {
      location: "Future World",
      cuisine: "International Fusion",
      openingHours: "11:00 AM",
      closingHours: "10:00 PM",
      seatingCapacity: 120,
      estimatedCost: 150000,
      estimatedRevenue: 280000,
      roi: 86.7,
    },
  },
  {
    id: "prop3",
    type: "Removal",
    name: "Vintage Arcade Removal",
    submittedBy: "Retail Manager",
    submittedDate: "March 20, 2025",
    description:
      "Proposal to remove the Vintage Arcade store due to declining revenue and outdated concept.",
    status: "Pending",
    details: {
      facilityName: "Vintage Arcade",
      facilityType: "Store",
      removalReason:
        "Declining revenue and outdated concept. Space will be repurposed for the new VR Experience Zone.",
      currentRevenue: 45000,
      removalCost: 12000,
    },
  },
  {
    id: "prop4",
    type: "Store",
    name: "Aquatic Treasures",
    submittedBy: "Retail Manager",
    submittedDate: "March 15, 2025",
    description:
      "Nautical-themed store with ocean and marine life merchandise, located near the water attractions.",
    status: "Approved",
    image: "/placeholder.svg?height=200&width=400",
    details: {
      location: "Water Park Area",
      size: "950 sq ft",
      category: "Themed Merchandise",
      estimatedCost: 65000,
      estimatedRevenue: 120000,
      roi: 84.6,
    },
  },
  {
    id: "prop5",
    type: "Restaurant",
    name: "Jungle Cafe",
    submittedBy: "F&B Supervisor",
    submittedDate: "March 10, 2025",
    description:
      "A rainforest-themed cafe offering healthy snacks, smoothies, and light meals.",
    status: "Declined",
    image: "/placeholder.svg?height=200&width=400",
    details: {
      location: "Adventure Zone",
      cuisine: "Healthy/Organic",
      openingHours: "9:00 AM",
      closingHours: "8:00 PM",
      seatingCapacity: 60,
      estimatedCost: 90000,
      estimatedRevenue: 110000,
      roi: 22.2,
    },
  },
];

export default function CEO() {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleApproveProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === proposalId
          ? { ...proposal, status: "Approved" as ProposalStatus }
          : proposal
      )
    );
  };

  const handleDeclineProposal = (proposalId: string, reason: string) => {
    setProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === proposalId
          ? {
              ...proposal,
              status: "Declined" as ProposalStatus,
              details: { ...proposal.details, declineReason: reason },
            }
          : proposal
      )
    );
  };

  // Count proposals by type and status
  const pendingProposals = proposals.filter(
    (p) => p.status === "Pending"
  ).length;
  const storeProposals = proposals.filter((p) => p.type === "Store").length;
  const restaurantProposals = proposals.filter(
    (p) => p.type === "Restaurant"
  ).length;
  const removalProposals = proposals.filter((p) => p.type === "Removal").length;

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">CEO Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and oversee all aspects of VorteKia Theme Park
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
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Approvals
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
                  <div className="text-2xl font-bold">{pendingProposals}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingProposals > 0
                      ? `${pendingProposals} proposals require your attention`
                      : "No pending approvals"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Store Proposals
                  </CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{storeProposals}</div>
                  <p className="text-xs text-muted-foreground">
                    {storeProposals > 0
                      ? `${storeProposals} total store proposals`
                      : "No store proposals"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Restaurant Proposals
                  </CardTitle>
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {restaurantProposals}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {restaurantProposals > 0
                      ? `${restaurantProposals} total restaurant proposals`
                      : "No restaurant proposals"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Removal Requests
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{removalProposals}</div>
                  <p className="text-xs text-muted-foreground">
                    {removalProposals > 0
                      ? `${removalProposals} total removal requests`
                      : "No removal requests"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Access key management areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setActiveTab("proposals")}
                  >
                    Review Proposals
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setActiveTab("operations")}
                  >
                    Operations Management
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setActiveTab("reports")}
                  >
                    View Reports
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Department Overview</CardTitle>
                  <CardDescription>
                    Quick access to department management
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <Wrench className="h-8 w-8" />
                    <span>Maintenance</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <Store className="h-8 w-8" />
                    <span>Retail</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <Utensils className="h-8 w-8" />
                    <span>F&B</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="mt-6">
            <ProposalApproval
              proposals={proposals}
              onApproveProposal={handleApproveProposal}
              onDeclineProposal={handleDeclineProposal}
            />
          </TabsContent>

          <TabsContent value="operations" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Operations Management
                  </h2>
                  <p className="text-muted-foreground">
                    Access operational departments to manage rides, stores, and
                    maintenance
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      Maintenance Division
                    </CardTitle>
                    <CardDescription>
                      Manage maintenance schedules and staff
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Access the maintenance management system to oversee
                      park-wide maintenance operations.
                    </p>
                    <Button className="w-full">
                      Access Maintenance Manager
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Retail Division
                    </CardTitle>
                    <CardDescription>
                      Manage stores, products, and sales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Access the retail management system to oversee store
                      operations and product inventory.
                    </p>
                    <Button className="w-full">Access Retail Manager</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Ride Division
                    </CardTitle>
                    <CardDescription>
                      Manage rides, queues, and ride staff
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Access the ride management system to oversee ride
                      operations and staff assignments.
                    </p>
                    <Button className="w-full">Access Ride Manager</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Reports & Analytics
                  </h2>
                  <p className="text-muted-foreground">
                    View comprehensive reports and analytics across all
                    departments
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Financial Reports
                    </CardTitle>
                    <CardDescription>
                      Revenue, expenses, and profit analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">
                      Financial charts and reports will display here
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Attendance Reports
                    </CardTitle>
                    <CardDescription>
                      Visitor statistics and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">
                      Attendance charts and reports will display here
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
