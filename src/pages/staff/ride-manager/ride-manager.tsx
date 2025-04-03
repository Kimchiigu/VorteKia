"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import { invoke } from "@tauri-apps/api/core";

import {
  RideInformation,
  type RideDetails,
  type RideStaff,
} from "@/components/staff/ride-manager/ride-information";

import { RideProposal } from "@/components/staff/ride-manager/ride-proposal";

import {
  MaintenanceRequest,
  type RideOption,
} from "@/components/staff/ride-manager/maintenance-request";

import { MaintenanceChat } from "@/components/staff/ride-manager/maintenance-chat";

const initialProposals = [
  {
    id: "PRO-001",
    title: "New Ride Proposal: Roller Coaster",
    type: "Ride",
    cost: 999.99,
    image: "",
    description: "You should buy this",
    status: "Pending",
    date: "",
    feedback: "",
  },
];

interface RideManagerProps {
  staffId: string;
  staffName?: string;
}

export default function RideManager({
  staffId,
  staffName = "Ride Manager",
}: RideManagerProps) {
  const [rides, setRides] = useState<RideDetails[]>([]);
  const [staff, setStaff] = useState<RideStaff[]>([]);
  const [proposals, setProposals] = useState<RideProposal[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);
  const [activeTab, setActiveTab] = useState("rides");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rideRes, staffRes, maintenanceRes, proposalRes]: any =
          await Promise.all([
            invoke("view_all_rides"),
            invoke("get_all_ride_staff"),
            invoke("view_all_maintenance"),
            invoke("view_all_proposal"),
          ]);

        const rideMap = new Map();
        const formattedRides = rideRes.data.map((ride: any) => {
          rideMap.set(ride.ride_id, ride.name);
          return {
            id: ride.ride_id,
            staffId: ride.staff_id,
            name: ride.name,
            description: ride.description,
            location: ride.location,
            status: ride.status,
            capacity: ride.capacity,
            price: ride.price,
            maintenanceStatus: ride.maintenance_status,
            image: `data:image/png;base64,${ride.image}`,
          };
        });
        setRides(formattedRides);

        const formattedStaff = staffRes.data.map((user: any) => ({
          id: user.user_id,
          name: user.name,
          role: user.role,
          status: user.status || "Available",
        }));
        setStaff(formattedStaff);

        const formattedProposals: RideProposal[] = proposalRes.data.map(
          (proposal: any) => ({
            id: proposal.proposal_id,
            title: proposal.title,
            type: proposal.type as "Ride" | "Restaurant" | "Store",
            cost: proposal.cost,
            image: `data:image/png;base64,${proposal.image}`,
            description: proposal.description,
            status: proposal.status,
            date: proposal.date,
            feedback: proposal.feedback || "",
          })
        );
        setProposals(formattedProposals);

        const formattedMaintenance = maintenanceRes.data.map((item: any) => ({
          id: item.maintenance_id,
          rideId: item.ride_id,
          rideName: rideMap.get(item.ride_id) || "Unknown Ride",
          issue: item.issue,
          type: item.type,
          status: item.status,
          senderId: item.sender_id,
          date: item.date,
          maintenanceStaffId: item.maintenance_staff_id || undefined,
        }));

        setMaintenanceRequests(formattedMaintenance);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchAll();
  }, []);

  const handleAssignStaff = async (rideId: string, staffId: string) => {
    try {
      await invoke("assign_ride_staff", {
        payload: {
          ride_id: rideId,
          staff_id: staffId,
        },
      });

      const [rideRes, staffRes]: any = await Promise.all([
        invoke("view_all_rides"),
        invoke("get_all_ride_staff"),
      ]);

      const refreshedRides: RideDetails[] = rideRes.data.map((ride: any) => ({
        id: ride.ride_id,
        staffId: ride.staff_id,
        name: ride.name,
        description: ride.description,
        location: ride.location,
        status: ride.status,
        capacity: ride.capacity,
        price: ride.price,
        maintenanceStatus: ride.maintenance_status,
        image: `data:image/png;base64,${ride.image}`,
      }));

      const refreshedStaff: RideStaff[] = staffRes.data.map((user: any) => ({
        id: user.user_id,
        name: user.name,
        role: user.role,
        status: user.status || "Available",
      }));

      setRides(refreshedRides);
      setStaff(refreshedStaff);
    } catch (err) {
      console.error("Failed to assign staff", err);
    }
  };

  const handleEditRide = async (updatedRide: RideDetails) => {
    try {
      const imageBase64 = updatedRide.image.split(",")[1] || "";
      const binary = atob(imageBase64);
      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      await invoke("update_ride", {
        payload: {
          ride_id: updatedRide.id,
          staff_id: updatedRide.staffId,
          name: updatedRide.name,
          price: updatedRide.price,
          image: Array.from(byteArray),
          description: updatedRide.description,
          location: updatedRide.location,
          status: updatedRide.status,
          capacity: updatedRide.capacity,
          maintenance_status: updatedRide.maintenanceStatus,
        },
      });

      const refreshedRidesRes: any = await invoke("view_all_rides");
      const refreshedRides: RideDetails[] = refreshedRidesRes.data.map(
        (ride: any) => ({
          id: ride.ride_id,
          staffId: ride.staff_id,
          name: ride.name,
          description: ride.description,
          location: ride.location,
          status: ride.status,
          capacity: ride.capacity,
          price: ride.price,
          maintenanceStatus: ride.maintenance_status,
          image: `data:image/png;base64,${ride.image}`,
        })
      );

      setRides(refreshedRides);
    } catch (err) {
      console.error("Failed to update ride:", err);
    }
  };

  const handleSubmitProposal = async (
    proposal: Omit<
      (typeof initialProposals)[0],
      "id" | "status" | "date" | "feedback" | "type"
    >
  ) => {
    try {
      const base64 = proposal.image.split(",")[1] || "";
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      const shortId = uuidv4().split("-")[0].toUpperCase();
      const proposalId = `PRO-${shortId}`;

      await invoke("create_proposal", {
        payload: {
          proposal_id: proposalId,
          title: proposal.title,
          type: "Ride",
          cost: proposal.cost,
          image: Array.from(byteArray),
          description: proposal.description,
          sender_id: staffId,
        },
      });

      const res: any = await invoke("view_all_proposal");
      const formatted = res.data.map((p: any) => ({
        id: p.proposal_id,
        title: p.title,
        type: p.type,
        cost: p.cost,
        image: `data:image/png;base64,${p.image}`,
        description: p.description,
        status: p.status,
        date: p.date,
        feedback: p.feedback || "",
      }));
      setProposals(formatted);
    } catch (err) {
      console.error("Failed to submit proposal:", err);
    }
  };

  const handleSubmitMaintenanceRequest = async (
    request: Omit<MaintenanceRequest, "id" | "status" | "submittedDate">
  ) => {
    try {
      const shortId = uuidv4().split("-")[0].toUpperCase();
      const maintenanceId = `MAIN-${shortId}`;

      await invoke("create_maintenance_request", {
        payload: {
          maintenance_id: maintenanceId,
          ride_id: request.rideId,
          type: request.type,
          issue: request.issue,
          sender_id: staffId,
        },
      });

      const refreshedRides: any = await invoke("view_all_rides");
      const formattedRides = refreshedRides.data.map((ride: any) => ({
        id: ride.ride_id,
        staffId: ride.staff_id,
        name: ride.name,
        description: ride.description,
        location: ride.location,
        status: ride.status,
        capacity: ride.capacity,
        price: ride.price,
        maintenanceStatus: ride.maintenance_status,
        image: `data:image/png;base64,${ride.image}`,
      }));

      setRides(formattedRides);
    } catch (err) {
      console.error("Failed to submit maintenance request:", err);
    }
  };

  const rideOptions: RideOption[] = rides.map((ride) => ({
    id: ride.id,
    name: ride.name,
  }));

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rides">Ride Information</TabsTrigger>
            <TabsTrigger value="proposals">Ride Proposals</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Requests</TabsTrigger>
            <TabsTrigger value="chat">Maintenance Chat</TabsTrigger>
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
            />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceRequest
              requests={maintenanceRequests}
              rides={rideOptions}
              onSubmitRequest={handleSubmitMaintenanceRequest}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <MaintenanceChat staffId={staffId} staffName={staffName} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
