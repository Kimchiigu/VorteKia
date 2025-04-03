"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";
import { AlertCircle } from "lucide-react";

import {
  QueueManagement,
  type RideQueue,
} from "@/components/staff/ride-staff/queue-management";

// Define the RideResponse interface based on the backend
interface RideResponse {
  ride_id: string;
  staff_id?: string;
  name: string;
  description: string;
  location: string;
  status: string;
  capacity: number;
  price: number;
  maintenance_status: string;
  image: string;
}

// Define RideDetails interface
export interface RideDetails {
  id: string;
  staffId: string;
  name: string;
  description: string;
  location: string;
  status: string;
  capacity: number;
  maintenanceStatus: string;
  price: number;
  image: string;
}

// Updated QueueResponse to include position
interface QueueResponse {
  queue_id: string;
  ride_id: string;
  customer_id: string;
  joined_at: string; // Changed to lowercase string to match backend
  position: number; // Added position
}

// Define UserLiteResponse based on get_user_lite_by_id
interface UserLiteResponse {
  user_id: string;
  name: string;
  role: string;
}

// Updated Customer interface to include position and queue_id
export interface Customer {
  id: string;
  name: string;
  groupSize: number;
  ticketType: string;
  fastPass: boolean;
  addedTime: Date;
  position: number; // Added position
  queue_id: string; // Added queue_id
}

// Dummy data for the queue (as fallback)
const initialQueue: RideQueue = {
  rideId: "ride1",
  rideName: "Thunderbolt Roller Coaster",
  currentCapacity: 0,
  maxCapacity: 100,
  estimatedWaitTime: 0,
  customers: [],
};

interface RideStaffProps {
  staffId: string;
}

export default function RideStaff({ staffId }: RideStaffProps) {
  const [assignedRides, setAssignedRides] = useState<RideDetails[]>([]);
  const [queue, setQueue] = useState<RideQueue>(initialQueue);
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    const fetchAssignedRides = async () => {
      try {
        const response = await invoke<{
          data?: RideResponse[];
          error?: string;
        }>("view_all_rides");

        if (response.error) {
          console.error("Error fetching rides:", response.error);
          setAssignedRides([]);
          return;
        }

        const allRides = response.data || [];
        const filteredRides = allRides
          .filter((ride) => ride.staff_id === staffId)
          .map((ride) => ({
            id: ride.ride_id,
            staffId: ride.staff_id || "",
            name: ride.name,
            description: ride.description,
            location: ride.location,
            status: ride.status,
            capacity: ride.capacity,
            maintenanceStatus: ride.maintenance_status,
            price: ride.price || 0,
            image: ride.image,
          }));
        setAssignedRides(filteredRides);
      } catch (error) {
        console.error("Failed to fetch rides:", error);
        setAssignedRides([]);
      }
    };

    fetchAssignedRides();
  }, [staffId]);

  useEffect(() => {
    if (assignedRides.length > 0) {
      const rideId = assignedRides[0].id;
      fetchQueueData(rideId);
    }
  }, [assignedRides]);

  const fetchQueueData = async (rideId: string) => {
    try {
      const queueResponse = await invoke<{
        data?: QueueResponse[];
        error?: string;
      }>("get_queues_by_ride", { rideId });

      if (queueResponse.error) {
        console.error("Error fetching queue:", queueResponse.error);
        setQueue({
          ...initialQueue,
          rideId,
          maxCapacity: assignedRides[0].capacity,
        });
        return;
      }

      const queueData = queueResponse.data || [];
      const customers = await Promise.all(
        queueData.map(async (q) => {
          try {
            const userResponse = await invoke<{
              data?: UserLiteResponse;
              error?: string;
            }>("get_user_lite_by_id", { userId: q.customer_id });

            const customerName =
              userResponse.data?.name || `Customer ${q.customer_id}`;
            return {
              id: q.customer_id,
              name: customerName,
              groupSize: 1,
              ticketType: "Standard",
              fastPass: false,
              addedTime: new Date(q.joined_at),
              position: q.position,
              queue_id: q.queue_id,
            };
          } catch (error) {
            console.error(`Failed to fetch user ${q.customer_id}:`, error);
            return {
              id: q.customer_id,
              name: `Customer ${q.customer_id}`,
              groupSize: 1,
              ticketType: "Standard",
              fastPass: false,
              addedTime: new Date(q.joined_at),
              position: q.position, 
              queue_id: q.queue_id, 
            };
          }
        })
      );

      customers.sort((a, b) => a.position - b.position);

      setQueue({
        rideId,
        rideName: assignedRides[0].name,
        currentCapacity: customers.reduce((sum, c) => sum + c.groupSize, 0),
        maxCapacity: assignedRides[0].capacity,
        estimatedWaitTime: calculateWaitTime(customers),
        customers,
      });
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      setQueue({
        ...initialQueue,
        rideId,
        maxCapacity: assignedRides[0].capacity,
      });
    }
  };

  const calculateWaitTime = (customers: Customer[]) => {
    return customers.reduce((sum, c) => sum + c.groupSize, 0) * 5;
  };

  const handleAddCustomer = async (customerId: string) => {
    try {
      const joinedAt = new Date().toISOString();
      const payload = {
        queue_id: "QUE-".concat(uuidv4()),
        ride_id: assignedRides[0].id,
        customer_id: customerId,
        joined_at: joinedAt,
      };
      await invoke("create_queue", { payload });
      fetchQueueData(assignedRides[0].id);
    } catch (error) {
      console.error("Failed to add customer:", error);
    }
  };

  const handleMoveCustomer = async (
    customerId: string,
    direction: "up" | "down"
  ) => {
    const currentIndex = queue.customers.findIndex((c) => c.id === customerId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === queue.customers.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentCustomer = queue.customers[currentIndex];
    const adjacentCustomer = queue.customers[newIndex];

    try {
      const payload1 = {
        queue_id: currentCustomer.queue_id,
        new_position: adjacentCustomer.position,
      };
      const payload2 = {
        queue_id: adjacentCustomer.queue_id,
        new_position: currentCustomer.position,
      };

      await Promise.all([
        invoke("edit_queue", { payload: payload1 }),
        invoke("edit_queue", { payload: payload2 }),
      ]);

      fetchQueueData(assignedRides[0].id);
    } catch (error) {
      console.error("Failed to move customer:", error);
    }
  };

  const handleRemoveCustomer = async (customerId: string) => {
    try {
      const queueResponse = await invoke<{
        data?: QueueResponse[];
        error?: string;
      }>("get_queues_by_ride", { rideId: assignedRides[0].id });

      const queueToDelete = queueResponse.data?.find(
        (q) => q.customer_id === customerId
      );
      if (queueToDelete) {
        const positionToDelete = queueToDelete.position;
        const queueId = queueToDelete.queue_id;

        const payload = { queue_id: queueId };
        await invoke("delete_queue", { payload });

        const customersToUpdate =
          queueResponse.data?.filter((q) => q.position > positionToDelete) ||
          [];
        await Promise.all(
          customersToUpdate.map(async (q) => {
            const newPosition = q.position - 1;
            const updatePayload = {
              queue_id: q.queue_id,
              new_position: newPosition,
            };
            await invoke("edit_queue", { payload: updatePayload });
          })
        );

        fetchQueueData(assignedRides[0].id);
      }
    } catch (error) {
      console.error("Failed to remove customer:", error);
    }
  };

  if (assignedRides.length === 0) {
    return (
      <div className="w-full mx-auto p-6 border-2 rounded-lg bg-background">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-medium">No Ride Assignments</h3>
        </div>
        <p className="text-muted-foreground">
          You're not assigned to any ride at the moment. Please check back later
          or contact your Ride Manager.
        </p>
      </div>
    );
  }

  const ride = assignedRides[0];

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{ride.name}</CardTitle>
                <CardDescription>{ride.location}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    ride.status === "Operational"
                      ? "success"
                      : ride.status === "Maintenance"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {ride.status}
                </Badge>
                <Badge variant="outline">Capacity: {ride.capacity}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden mb-4">
              <img
                src={`data:image/jpeg;base64,${ride.image}`}
                alt={ride.name}
                className="h-full w-full object-cover"
              />
            </div>
            <p>{ride.description}</p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queue">Queue Management</TabsTrigger>
            <TabsTrigger value="info">Ride Information</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            <QueueManagement
              queue={queue}
              onAddCustomer={handleAddCustomer}
              onMoveCustomer={handleMoveCustomer}
              onRemoveCustomer={handleRemoveCustomer}
            />
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ride Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Price</h3>
                      <p>{ride.price} USD</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">
                        Maintenance Status
                      </h3>
                      <p>{ride.maintenanceStatus}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">
                    Safety Instructions
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Ensure all riders meet the ride’s safety requirements.
                    </li>
                    <li>
                      Check that all safety restraints are properly secured
                      before operation.
                    </li>
                    <li>
                      Monitor the loading and unloading process to ensure rider
                      safety.
                    </li>
                    <li>
                      Keep the queue area organized and manage crowd flow
                      efficiently.
                    </li>
                    <li>
                      Report any unusual sounds, movements, or technical issues
                      immediately.
                    </li>
                    <li>
                      Follow emergency procedures in case of ride malfunction or
                      weather conditions.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
