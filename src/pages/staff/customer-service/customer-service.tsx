"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { HeroStaff } from "@/components/staff/hero-staff";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ChatInterface,
  type Customer,
} from "@/components/staff/customer-service/chat-interface";

import {
  BroadcastMessage,
  type Department,
  type BroadcastMessageData,
} from "@/components/staff/customer-service/broadcast-message";

import {
  CustomerAccount,
  type NewCustomerData,
} from "@/components/staff/customer-service/customer-account";

import {
  ParkInformation,
  type Ride,
  type Restaurant,
} from "@/components/staff/customer-service/park-information";

// Dummy data for customers
const initialCustomers: Customer[] = [
  {
    id: "VK-JD123456-789",
    name: "John Doe",
    email: "john.doe@example.com",
    lastActive: new Date(Date.now() - 5 * 60000),
    status: "online",
    unreadCount: 2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "VK-AS234567-012",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    lastActive: new Date(Date.now() - 15 * 60000),
    status: "online",
    unreadCount: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "VK-RJ345678-234",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    lastActive: new Date(Date.now() - 2 * 3600000),
    status: "away",
    unreadCount: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "VK-EW456789-345",
    name: "Emily Wilson",
    email: "emily.wilson@example.com",
    lastActive: new Date(Date.now() - 1 * 3600000),
    status: "online",
    unreadCount: 1,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "VK-MB567890-456",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    lastActive: new Date(Date.now() - 5 * 3600000),
    status: "offline",
    unreadCount: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

// Dummy data for departments
const departments: Department[] = [
  { id: "dept1", name: "Ride Operations" },
  { id: "dept2", name: "Food & Beverage" },
  { id: "dept3", name: "Retail & Merchandise" },
  { id: "dept4", name: "Maintenance" },
  { id: "dept5", name: "Security" },
  { id: "dept6", name: "Guest Relations" },
];

// Dummy data for rides
const rides: Ride[] = [
  {
    id: "ride1",
    name: "Thunderbolt Roller Coaster",
    description: "A high-speed roller coaster with multiple loops and drops.",
    location: "Thrill Zone",
    status: "Operational",
    waitTime: 45,
    capacity: 24,
    minHeight: 122,
    duration: 3,
    thrill: "Extreme",
  },
  {
    id: "ride2",
    name: "Splash Mountain",
    description: "A water log ride with a thrilling drop at the end.",
    location: "Water World",
    status: "Operational",
    waitTime: 30,
    capacity: 8,
    minHeight: 107,
    duration: 7,
    thrill: "High",
  },
  {
    id: "ride3",
    name: "Haunted Mansion",
    description: "A spooky dark ride through a haunted house.",
    location: "Fantasy Land",
    status: "Maintenance",
    waitTime: 0,
    capacity: 4,
    minHeight: 102,
    duration: 8,
    thrill: "Moderate",
  },
  {
    id: "ride4",
    name: "Carousel",
    description: "A classic carousel ride suitable for all ages.",
    location: "Kids Zone",
    status: "Operational",
    waitTime: 10,
    capacity: 30,
    minHeight: 91,
    duration: 5,
    thrill: "Low",
  },
  {
    id: "ride5",
    name: "Space Odyssey",
    description: "A space-themed simulator ride with immersive effects.",
    location: "Future World",
    status: "Closed",
    waitTime: 0,
    capacity: 16,
    minHeight: 112,
    duration: 6,
    thrill: "High",
  },
];

// Dummy data for restaurants
const restaurants: Restaurant[] = [
  {
    id: "rest1",
    name: "Cosmic Café",
    description: "A space-themed restaurant with futuristic decor.",
    location: "Future World",
    status: "Open",
    cuisine: "International",
    priceRange: "$$",
    capacity: 150,
    currentOccupancy: 95,
    openingHours: "10:00 AM - 9:00 PM",
  },
  {
    id: "rest2",
    name: "Pirate's Feast",
    description: "A pirate-themed buffet restaurant with entertainment.",
    location: "Adventure Isle",
    status: "Open",
    cuisine: "Buffet",
    priceRange: "$$$",
    capacity: 200,
    currentOccupancy: 180,
    openingHours: "11:00 AM - 10:00 PM",
  },
  {
    id: "rest3",
    name: "Jungle Grill",
    description: "Quick-service restaurant with burgers and sandwiches.",
    location: "Wild Safari",
    status: "Open",
    cuisine: "American",
    priceRange: "$",
    capacity: 80,
    currentOccupancy: 45,
    openingHours: "10:30 AM - 8:00 PM",
  },
  {
    id: "rest4",
    name: "Ice Cream Palace",
    description: "Specialty ice cream shop with unique flavors.",
    location: "Fantasy Land",
    status: "Open",
    cuisine: "Desserts",
    priceRange: "$",
    capacity: 40,
    currentOccupancy: 25,
    openingHours: "11:00 AM - 9:30 PM",
  },
  {
    id: "rest5",
    name: "Dragon's Den Restaurant",
    description: "Fine dining experience with medieval theme.",
    location: "Castle Area",
    status: "Closed",
    cuisine: "European",
    priceRange: "$$$",
    capacity: 120,
    currentOccupancy: 0,
    openingHours: "5:00 PM - 10:00 PM",
  },
];

export default function CustomerService() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [activeTab, setActiveTab] = useState("chat");

  // Chat handlers
  const handleSendMessage = (customerId: string, message: string) => {
    console.log(`Message sent to ${customerId}: ${message}`);
    // In a real app, this would send the message to the backend

    // Update unread count for demo purposes
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? { ...customer, unreadCount: 0 } : customer
      )
    );
  };

  // Broadcast handlers
  const handleSendBroadcast = (message: BroadcastMessageData) => {
    console.log("Broadcast message sent:", message);
    // In a real app, this would send the broadcast to the backend
  };

  // Customer account handlers
  const handleCreateCustomer = (customer: NewCustomerData) => {
    console.log("New customer created:", customer);
    // In a real app, this would send the customer data to the backend

    // Add customer to the list for demo purposes
    const newCustomer: Customer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      lastActive: new Date(),
      status: "offline",
      unreadCount: 0,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Customer Chat</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast Messages</TabsTrigger>
            <TabsTrigger value="accounts">Customer Accounts</TabsTrigger>
            <TabsTrigger value="information">Park Information</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <ChatInterface
              customers={customers}
              onSendMessage={handleSendMessage}
            />
          </TabsContent>

          <TabsContent value="broadcast" className="mt-6">
            <BroadcastMessage
              departments={departments}
              onSendBroadcast={handleSendBroadcast}
            />
          </TabsContent>

          <TabsContent value="accounts" className="mt-6">
            <CustomerAccount onCreateCustomer={handleCreateCustomer} />
          </TabsContent>

          <TabsContent value="information" className="mt-6">
            <ParkInformation rides={rides} restaurants={restaurants} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
