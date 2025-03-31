"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { HeroStaff } from "@/components/staff/hero-staff";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

import {
  RideInformation,
  type RideDetails,
  type RideStaff,
} from "@/components/staff/ride-manager/ride-information";

import {
  RideProposal,
  type ProposalStatus,
} from "@/components/staff/ride-manager/ride-proposal";

import {
  MaintenanceRequest,
  type MaintenanceStatus,
  type MaintenancePriority,
  type RideOption,
} from "@/components/staff/ride-manager/maintenance-request";

// Dummy data for rides
const initialRides: RideDetails[] = [
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

// Dummy data for staff
const initialStaff: RideStaff[] = [
  {
    id: "staff1",
    name: "John Smith",
    role: "Ride Operator",
    shift: "Morning (8:00 AM - 4:00 PM)",
    experience: "3 years",
    status: "On Duty",
  },
  {
    id: "staff2",
    name: "Sarah Johnson",
    role: "Ride Supervisor",
    shift: "Morning (8:00 AM - 4:00 PM)",
    experience: "5 years",
    status: "On Duty",
  },
  {
    id: "staff3",
    name: "Michael Brown",
    role: "Ride Operator",
    shift: "Evening (4:00 PM - 12:00 AM)",
    experience: "2 years",
    status: "Off Duty",
  },
  {
    id: "staff4",
    name: "Emily Davis",
    role: "Safety Inspector",
    shift: "Morning (8:00 AM - 4:00 PM)",
    experience: "4 years",
    status: "On Duty",
  },
  {
    id: "staff5",
    name: "Robert Wilson",
    role: "Ride Operator",
    shift: "Evening (4:00 PM - 12:00 AM)",
    experience: "1 year",
    status: "On Break",
  },
  {
    id: "staff6",
    name: "Jessica Martinez",
    role: "Ride Operator",
    shift: "Morning (8:00 AM - 4:00 PM)",
    experience: "2 years",
    status: "On Duty",
  },
  {
    id: "staff7",
    name: "David Thompson",
    role: "Ride Supervisor",
    shift: "Evening (4:00 PM - 12:00 AM)",
    experience: "6 years",
    status: "Off Duty",
  },
  {
    id: "staff8",
    name: "Amanda Garcia",
    role: "Ride Operator",
    shift: "Morning (8:00 AM - 4:00 PM)",
    experience: "3 years",
    status: "On Duty",
  },
];

// Dummy data for ride proposals
const initialProposals = [
  {
    id: "prop1",
    name: "Gravity Defier",
    description:
      "A revolutionary roller coaster that simulates zero gravity through innovative magnetic technology.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Thrill Zone Expansion",
    thrill: "Extreme" as const,
    capacity: 16,
    estimatedDuration: 4,
    minHeight: 140,
    estimatedCost: 8500000,
    estimatedConstructionTime: "18 months",
    staffRequired: 8,
    status: "Pending" as ProposalStatus,
    submittedDate: "March 15, 2025",
    designDocuments: [],
  },
  {
    id: "prop2",
    name: "Enchanted Forest Adventure",
    description:
      "A family-friendly dark ride through a magical forest with interactive elements and animatronics.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Fantasy Land",
    thrill: "Low" as const,
    capacity: 24,
    estimatedDuration: 8,
    minHeight: 91,
    estimatedCost: 3200000,
    estimatedConstructionTime: "12 months",
    staffRequired: 5,
    status: "Approved" as ProposalStatus,
    submittedDate: "March 1, 2025",
    feedback:
      "Approved. This family-friendly attraction aligns with our goal to expand offerings for younger guests.",
    designDocuments: [],
  },
  {
    id: "prop3",
    name: "Underwater Explorer",
    description:
      "A submarine-themed ride that takes guests on an immersive journey through an underwater world.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Water World",
    thrill: "Moderate" as const,
    capacity: 12,
    estimatedDuration: 6,
    minHeight: 102,
    estimatedCost: 5700000,
    estimatedConstructionTime: "14 months",
    staffRequired: 6,
    status: "Rejected" as ProposalStatus,
    submittedDate: "February 20, 2025",
    feedback:
      "Rejected due to budget constraints and overlap with existing attractions. Consider revising the concept.",
    designDocuments: [],
  },
  {
    id: "prop4",
    name: "Virtual Reality Coaster",
    description:
      "A hybrid roller coaster that combines physical thrills with virtual reality headsets for an enhanced experience.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Future World",
    thrill: "High" as const,
    capacity: 20,
    estimatedDuration: 3,
    minHeight: 122,
    estimatedCost: 6800000,
    estimatedConstructionTime: "16 months",
    staffRequired: 7,
    status: "Draft" as ProposalStatus,
    submittedDate: "March 25, 2025",
    designDocuments: [],
  },
];

// Dummy data for maintenance requests
const initialMaintenanceRequests = [
  {
    id: "maint1",
    rideId: "ride1",
    rideName: "Thunderbolt Roller Coaster",
    title: "Brake System Inspection",
    description:
      "Routine inspection of the primary and secondary brake systems due to slight delay in stopping observed.",
    priority: "High" as MaintenancePriority,
    status: "Completed" as MaintenanceStatus,
    submittedBy: "Ride Manager",
    submittedDate: "March 10, 2025",
    estimatedDuration: "4 hours",
    assignedTo: "Maintenance Team A",
    completedDate: "March 11, 2025",
    notes:
      "Replaced worn brake pads and adjusted timing. All systems now functioning within normal parameters.",
  },
  {
    id: "maint2",
    rideId: "ride3",
    rideName: "Haunted Mansion",
    title: "Audio System Failure",
    description:
      "Multiple audio elements throughout the ride have stopped working, affecting the guest experience.",
    priority: "Medium" as MaintenancePriority,
    status: "In Progress" as MaintenanceStatus,
    submittedBy: "Ride Supervisor",
    submittedDate: "March 20, 2025",
    estimatedDuration: "1-2 days",
    assignedTo: "Maintenance Team C",
  },
  {
    id: "maint3",
    rideId: "ride2",
    rideName: "Splash Mountain",
    title: "Water Pump Maintenance",
    description:
      "Scheduled maintenance for the main water pumps to ensure optimal performance for the summer season.",
    priority: "Low" as MaintenancePriority,
    status: "Pending" as MaintenanceStatus,
    submittedBy: "Ride Manager",
    submittedDate: "March 22, 2025",
    estimatedDuration: "1 day",
  },
  {
    id: "maint4",
    rideId: "ride5",
    rideName: "Space Odyssey",
    title: "Simulator Platform Malfunction",
    description:
      "The main hydraulic system for the simulator platforms is experiencing intermittent failures causing jerky movements.",
    priority: "Critical" as MaintenancePriority,
    status: "Pending" as MaintenanceStatus,
    submittedBy: "Safety Inspector",
    submittedDate: "March 18, 2025",
    estimatedDuration: "3-5 days",
  },
];

export default function RideManager() {
  const [rides, setRides] = useState<RideDetails[]>(initialRides);
  const [staff, setStaff] = useState<RideStaff[]>(initialStaff);
  const [proposals, setProposals] = useState(initialProposals);
  const [maintenanceRequests, setMaintenanceRequests] = useState(
    initialMaintenanceRequests
  );
  const [activeTab, setActiveTab] = useState("rides");

  // Ride Information handlers
  const handleAssignStaff = (rideId: string, staffId: string) => {
    console.log(`Assigning staff ${staffId} to ride ${rideId}`);
    // In a real app, this would update the staff assignment in the backend

    // Update ride staff count for demo purposes
    setRides((prev) =>
      prev.map((ride) =>
        ride.id === rideId
          ? { ...ride, currentStaffCount: ride.currentStaffCount + 1 }
          : ride
      )
    );
  };

  const handleEditRide = (updatedRide: RideDetails) => {
    console.log("Editing ride:", updatedRide);
    // In a real app, this would open a dialog to edit the ride details
  };

  // Ride Proposal handlers
  const handleSubmitProposal = (
    proposal: Omit<
      (typeof initialProposals)[0],
      "id" | "status" | "submittedDate" | "feedback"
    >
  ) => {
    const newProposal = {
      ...proposal,
      id: uuidv4(),
      status: "Pending" as ProposalStatus,
      submittedDate: format(new Date(), "MMMM d, yyyy"),
    };

    setProposals((prev) => [newProposal, ...prev]);
  };

  const handleDeleteProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.filter((proposal) => proposal.id !== proposalId)
    );
  };

  // Maintenance Request handlers
  const handleSubmitMaintenanceRequest = (
    request: Omit<MaintenanceRequest, "id" | "status" | "submittedDate">
  ) => {
    const newRequest = {
      ...request,
      id: uuidv4(),
      status: "Pending" as MaintenanceStatus,
      submittedDate: format(new Date(), "MMMM d, yyyy"),
    };

    setMaintenanceRequests((prev) => [newRequest, ...prev]);

    // Update ride status to Maintenance
    setRides((prev) =>
      prev.map((ride) =>
        ride.id === request.rideId ? { ...ride, status: "Maintenance" } : ride
      )
    );
  };

  const handleCancelMaintenanceRequest = (requestId: string) => {
    // Find the request to get the ride ID
    const request = maintenanceRequests.find((req) => req.id === requestId);

    if (request) {
      // Remove the request
      setMaintenanceRequests((prev) =>
        prev.filter((req) => req.id !== requestId)
      );

      // Update ride status back to Operational if it was in Maintenance due to this request
      // In a real app, you would need to check if there are other pending maintenance requests for this ride
      setRides((prev) =>
        prev.map((ride) =>
          ride.id === request.rideId && ride.status === "Maintenance"
            ? { ...ride, status: "Operational" }
            : ride
        )
      );
    }
  };

  // Create ride options for maintenance request dropdown
  const rideOptions: RideOption[] = rides.map((ride) => ({
    id: ride.id,
    name: ride.name,
  }));

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rides">Ride Information</TabsTrigger>
            <TabsTrigger value="proposals">Ride Proposals</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="rides" className="mt-6">
            <RideInformation
              rides={rides}
              staff={staff}
              onAssignStaff={handleAssignStaff}
              onEditRide={handleEditRide}
            />
          </TabsContent>

          <TabsContent value="proposals" className="mt-6">
            <RideProposal
              proposals={proposals}
              onSubmitProposal={handleSubmitProposal}
              onDeleteProposal={handleDeleteProposal}
            />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceRequest
              requests={maintenanceRequests}
              rides={rideOptions}
              onSubmitRequest={handleSubmitMaintenanceRequest}
              onCancelRequest={handleCancelMaintenanceRequest}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
