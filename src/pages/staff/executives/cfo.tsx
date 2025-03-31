import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportList, type ReportData } from "@/components/document/report-list";
import {
  ProposalList,
  type Proposal,
  type ProposalStatus,
} from "@/components/document/proposal-list";

// Dummy data for financial reports
const reportsData: ReportData[] = [
  {
    id: "rep1",
    period: "Day - March 31, 2025",
    rideIncome: 85000,
    marketingIncome: 15000,
    consumptionIncome: 45000,
    totalIncome: 145000,
    percentageChange: 5.2,
    details: [
      {
        source: "Roller Coaster Rides",
        amount: 35000,
        percentageOfTotal: 24.1,
        change: 7.5,
      },
      {
        source: "Water Rides",
        amount: 28000,
        percentageOfTotal: 19.3,
        change: 4.2,
      },
      {
        source: "Family Rides",
        amount: 22000,
        percentageOfTotal: 15.2,
        change: 3.1,
      },
      {
        source: "Sponsorship Deals",
        amount: 8000,
        percentageOfTotal: 5.5,
        change: 12.0,
      },
      {
        source: "Advertising Revenue",
        amount: 7000,
        percentageOfTotal: 4.8,
        change: -2.1,
      },
      {
        source: "Food Court Sales",
        amount: 25000,
        percentageOfTotal: 17.2,
        change: 8.3,
      },
      {
        source: "Restaurant Sales",
        amount: 15000,
        percentageOfTotal: 10.3,
        change: 5.7,
      },
      {
        source: "Snack Stands",
        amount: 5000,
        percentageOfTotal: 3.4,
        change: 1.2,
      },
    ],
  },
  {
    id: "rep2",
    period: "Day - March 30, 2025",
    rideIncome: 80000,
    marketingIncome: 14500,
    consumptionIncome: 43000,
    totalIncome: 137500,
    percentageChange: 3.8,
    details: [
      {
        source: "Roller Coaster Rides",
        amount: 32500,
        percentageOfTotal: 23.6,
        change: 6.2,
      },
      {
        source: "Water Rides",
        amount: 26800,
        percentageOfTotal: 19.5,
        change: 3.5,
      },
      {
        source: "Family Rides",
        amount: 20700,
        percentageOfTotal: 15.1,
        change: 2.8,
      },
      {
        source: "Sponsorship Deals",
        amount: 7500,
        percentageOfTotal: 5.5,
        change: 10.5,
      },
      {
        source: "Advertising Revenue",
        amount: 7000,
        percentageOfTotal: 5.1,
        change: -1.5,
      },
      {
        source: "Food Court Sales",
        amount: 23500,
        percentageOfTotal: 17.1,
        change: 7.2,
      },
      {
        source: "Restaurant Sales",
        amount: 14200,
        percentageOfTotal: 10.3,
        change: 4.5,
      },
      {
        source: "Snack Stands",
        amount: 5300,
        percentageOfTotal: 3.9,
        change: 2.1,
      },
    ],
  },
  {
    id: "rep3",
    period: "Week - March 24-30, 2025",
    rideIncome: 560000,
    marketingIncome: 95000,
    consumptionIncome: 320000,
    totalIncome: 975000,
    percentageChange: 8.3,
    details: [
      {
        source: "Roller Coaster Rides",
        amount: 230000,
        percentageOfTotal: 23.6,
        change: 9.2,
      },
      {
        source: "Water Rides",
        amount: 185000,
        percentageOfTotal: 19.0,
        change: 7.5,
      },
      {
        source: "Family Rides",
        amount: 145000,
        percentageOfTotal: 14.9,
        change: 6.8,
      },
      {
        source: "Sponsorship Deals",
        amount: 55000,
        percentageOfTotal: 5.6,
        change: 15.0,
      },
      {
        source: "Advertising Revenue",
        amount: 40000,
        percentageOfTotal: 4.1,
        change: 3.5,
      },
      {
        source: "Food Court Sales",
        amount: 175000,
        percentageOfTotal: 17.9,
        change: 10.3,
      },
      {
        source: "Restaurant Sales",
        amount: 105000,
        percentageOfTotal: 10.8,
        change: 8.7,
      },
      {
        source: "Snack Stands",
        amount: 40000,
        percentageOfTotal: 4.1,
        change: 5.2,
      },
    ],
  },
  {
    id: "rep4",
    period: "Month - March 2025",
    rideIncome: 2400000,
    marketingIncome: 420000,
    consumptionIncome: 1350000,
    totalIncome: 4170000,
    percentageChange: 12.5,
    details: [
      {
        source: "Roller Coaster Rides",
        amount: 980000,
        percentageOfTotal: 23.5,
        change: 13.2,
      },
      {
        source: "Water Rides",
        amount: 820000,
        percentageOfTotal: 19.7,
        change: 11.5,
      },
      {
        source: "Family Rides",
        amount: 600000,
        percentageOfTotal: 14.4,
        change: 9.8,
      },
      {
        source: "Sponsorship Deals",
        amount: 250000,
        percentageOfTotal: 6.0,
        change: 18.0,
      },
      {
        source: "Advertising Revenue",
        amount: 170000,
        percentageOfTotal: 4.1,
        change: 7.5,
      },
      {
        source: "Food Court Sales",
        amount: 750000,
        percentageOfTotal: 18.0,
        change: 14.3,
      },
      {
        source: "Restaurant Sales",
        amount: 450000,
        percentageOfTotal: 10.8,
        change: 12.7,
      },
      {
        source: "Snack Stands",
        amount: 150000,
        percentageOfTotal: 3.6,
        change: 8.2,
      },
    ],
  },
];

// Dummy data for restaurant proposals
const proposalsData: Proposal[] = [
  {
    id: "prop1",
    name: "Seafood Grill Restaurant",
    submittedBy: "Maria Johnson (F&B Supervisor)",
    submittedDate: "March 28, 2025",
    estimatedCost: 450000,
    estimatedRevenue: 720000,
    roi: 60,
    status: "Pending",
    description:
      "A high-end seafood restaurant featuring fresh, locally-sourced seafood with an open grill concept. The restaurant will offer a premium dining experience with ocean views.",
    details: {
      location: "North Wing, 2nd Floor",
      size: "3,500 sq ft",
      cuisine: "Seafood",
      staffingRequirements:
        "1 Head Chef, 2 Sous Chefs, 8 Line Cooks, 12 Servers",
      equipmentNeeds:
        "Commercial kitchen equipment, open grill station, bar setup, dining furniture",
    },
  },
  {
    id: "prop2",
    name: "Family Pizza Parlor",
    submittedBy: "Robert Smith (F&B Supervisor)",
    submittedDate: "March 25, 2025",
    estimatedCost: 280000,
    estimatedRevenue: 520000,
    roi: 85,
    status: "Approved",
    description:
      "A family-friendly pizza restaurant with an interactive dough-making station where kids can create their own pizzas. Features arcade games and a casual dining atmosphere.",
    details: {
      location: "East Wing, 1st Floor",
      size: "2,800 sq ft",
      cuisine: "Italian/Pizza",
      staffingRequirements: "1 Head Chef, 6 Pizza Chefs, 10 Servers",
      equipmentNeeds:
        "Pizza ovens, dough preparation area, arcade games, family-style seating",
    },
  },
  {
    id: "prop3",
    name: "Asian Fusion Food Court",
    submittedBy: "Jennifer Lee (F&B Supervisor)",
    submittedDate: "March 20, 2025",
    estimatedCost: 350000,
    estimatedRevenue: 580000,
    roi: 65,
    status: "Declined",
    description:
      "A collection of Asian cuisine stalls featuring Japanese, Chinese, Thai, and Korean food options. Centralized seating area with themed decor.",
    details: {
      location: "South Wing, Food Court Area",
      size: "4,200 sq ft",
      cuisine: "Asian Fusion",
      staffingRequirements:
        "4 Head Chefs (one per cuisine), 12 Line Cooks, 8 Servers",
      equipmentNeeds:
        "Specialized cooking equipment for each cuisine, shared seating area, themed decor",
    },
  },
  {
    id: "prop4",
    name: "Healthy Options Café",
    submittedBy: "David Wilson (F&B Supervisor)",
    submittedDate: "March 15, 2025",
    estimatedCost: 220000,
    estimatedRevenue: 380000,
    roi: 72,
    status: "Pending",
    description:
      "A health-focused café offering nutritious meals, smoothies, and snacks. Catering to health-conscious visitors and families looking for lighter options.",
    details: {
      location: "West Wing, Near Water Park",
      size: "1,800 sq ft",
      cuisine: "Health Food",
      staffingRequirements: "1 Head Chef, 4 Line Cooks, 6 Servers",
      equipmentNeeds:
        "Smoothie stations, salad bar, light cooking equipment, café-style seating",
    },
  },
];

export default function CFO() {
  const [activeTab, setActiveTab] = useState("reports");
  const [proposals, setProposals] = useState<Proposal[]>(proposalsData);

  const handleUpdateProposalStatus = (
    proposalId: string,
    newStatus: ProposalStatus
  ) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === proposalId
          ? { ...proposal, status: newStatus }
          : proposal
      )
    );
  };

  return (
    <main className="min-h-screen w-full bg-background">
        <div className="mt-12 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">Financial Reports</TabsTrigger>
              <TabsTrigger value="proposals">Restaurant Proposals</TabsTrigger>
            </TabsList>
            <TabsContent value="reports" className="mt-6">
              <ReportList reports={reportsData} role="cfo" />
            </TabsContent>
            <TabsContent value="proposals" className="mt-6">
              <ProposalList
                proposals={proposals}
                role="cfo"
                onUpdateStatus={handleUpdateProposalStatus}
              />
            </TabsContent>
          </Tabs>
        </div>
    </main>
  );
}
