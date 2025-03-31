"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { HeroStaff } from "@/components/staff/hero-staff";
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

import {
  QueueManagement,
  type Customer,
  type RideQueue,
} from "@/components/staff/ride-staff/queue-management";

import type { RideDetails } from "@/components/staff/ride-manager/ride-information";

// Dummy data for the assigned ride
const assignedRide: RideDetails = {
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
};

// Dummy data for the queue
const initialQueue: RideQueue = {
  rideId: "ride1",
  rideName: "Thunderbolt Roller Coaster",
  currentCapacity: 45,
  maxCapacity: 100,
  estimatedWaitTime: 30,
  customers: [
    {
      id: "cust1",
      name: "John Smith",
      groupSize: 2,
      ticketType: "Standard",
      fastPass: false,
      addedTime: new Date(Date.now() - 15 * 60000),
    },
    {
      id: "cust2",
      name: "Sarah Johnson",
      groupSize: 4,
      ticketType: "Premium",
      fastPass: true,
      addedTime: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "cust3",
      name: "Michael Brown",
      groupSize: 1,
      ticketType: "VIP",
      fastPass: true,
      specialNeeds: "Wheelchair",
      addedTime: new Date(Date.now() - 10 * 60000),
    },
    {
      id: "cust4",
      name: "Emily Davis",
      groupSize: 3,
      ticketType: "Standard",
      fastPass: false,
      addedTime: new Date(Date.now() - 20 * 60000),
    },
    {
      id: "cust5",
      name: "Robert Wilson",
      groupSize: 2,
      ticketType: "Group",
      fastPass: false,
      addedTime: new Date(Date.now() - 25 * 60000),
    },
  ],
};

export default function RideStaff() {
  const [queue, setQueue] = useState<RideQueue>(initialQueue);
  const [activeTab, setActiveTab] = useState("queue");

  // Queue Management handlers
  const handleAddCustomer = (customer: Omit<Customer, "id" | "addedTime">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust${uuidv4().substring(0, 8)}`,
      addedTime: new Date(),
    };

    setQueue((prev) => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
      currentCapacity: prev.currentCapacity + customer.groupSize,
      estimatedWaitTime: Math.round(
        (prev.estimatedWaitTime * (prev.currentCapacity + customer.groupSize)) /
          prev.currentCapacity
      ),
    }));
  };

  const handleEditCustomer = (
    customerId: string,
    updatedCustomer: Omit<Customer, "id" | "addedTime">
  ) => {
    const existingCustomer = queue.customers.find((c) => c.id === customerId);

    if (existingCustomer) {
      const groupSizeDifference =
        updatedCustomer.groupSize - existingCustomer.groupSize;

      setQueue((prev) => ({
        ...prev,
        customers: prev.customers.map((c) =>
          c.id === customerId ? { ...c, ...updatedCustomer } : c
        ),
        currentCapacity: prev.currentCapacity + groupSizeDifference,
        estimatedWaitTime: Math.max(
          5,
          Math.round(
            (prev.estimatedWaitTime *
              (prev.currentCapacity + groupSizeDifference)) /
              prev.currentCapacity
          )
        ),
      }));
    }
  };

  const handleRemoveCustomer = (customerId: string) => {
    const customerToRemove = queue.customers.find((c) => c.id === customerId);

    if (customerToRemove) {
      setQueue((prev) => ({
        ...prev,
        customers: prev.customers.filter((c) => c.id !== customerId),
        currentCapacity: prev.currentCapacity - customerToRemove.groupSize,
        estimatedWaitTime:
          prev.customers.length > 1
            ? Math.max(
                5,
                Math.round(
                  (prev.estimatedWaitTime *
                    (prev.currentCapacity - customerToRemove.groupSize)) /
                    prev.currentCapacity
                )
              )
            : 0,
      }));
    }
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{assignedRide.name}</CardTitle>
                <CardDescription>{assignedRide.location}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    assignedRide.status === "Operational"
                      ? "success"
                      : assignedRide.status === "Maintenance"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {assignedRide.status}
                </Badge>
                <Badge variant="outline">
                  Capacity: {assignedRide.capacity}
                </Badge>
                <Badge variant="outline">
                  Min Height: {assignedRide.minHeight} cm
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden mb-4">
              <img
                src={
                  assignedRide.image || "/placeholder.svg?height=200&width=600"
                }
                alt={assignedRide.name}
                className="h-full w-full object-cover"
              />
            </div>
            <p>{assignedRide.description}</p>
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
              onEditCustomer={handleEditCustomer}
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
                      <h3 className="text-sm font-medium">Operating Hours</h3>
                      <p>{assignedRide.operatingHours}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Ride Duration</h3>
                      <p>{assignedRide.duration} minutes</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Hourly Capacity</h3>
                      <p>{assignedRide.hourlyCapacity} riders per hour</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Thrill Level</h3>
                      <Badge
                        variant={
                          assignedRide.thrill === "Low"
                            ? "secondary"
                            : assignedRide.thrill === "Moderate"
                            ? "info"
                            : assignedRide.thrill === "High"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {assignedRide.thrill}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Last Maintenance</h3>
                      <p>{assignedRide.lastMaintenance}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Next Maintenance</h3>
                      <p>{assignedRide.nextMaintenance}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Staff Required</h3>
                      <p>{assignedRide.staffRequired} staff members</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Opening Year</h3>
                      <p>{assignedRide.openingYear}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">
                    Safety Instructions
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Ensure all riders meet the minimum height requirement of{" "}
                      {assignedRide.minHeight} cm.
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
