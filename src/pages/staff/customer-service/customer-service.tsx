import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invoke } from "@tauri-apps/api/core";

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
import { OfficialChatInterface } from "@/components/staff/customer-service/official-chat-interface";

const departments: Department[] = [
  { id: "dept1", name: "Ride Operations" },
  { id: "dept2", name: "Food & Beverage" },
  { id: "dept3", name: "Retail & Merchandise" },
  { id: "dept4", name: "Maintenance" },
  { id: "dept5", name: "Security" },
  { id: "dept6", name: "Guest Relations" },
];

interface CustomerServiceProps {
  userId: string;
}

export default function CustomerService({ userId }: CustomerServiceProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [rides, setRides] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const handleSendBroadcast = async (message: BroadcastMessageData) => {
    try {
      await invoke("send_broadcast_message", {
        payload: {
          content: message.content,
          recipients: {
            all_customers: message.recipients.allCustomers,
            customer_departments: message.recipients.customerDepartments,
            all_staff: message.recipients.allStaff,
            staff_departments: message.recipients.staffDepartments,
          },
        },
      });

      console.log("✅ Broadcast sent successfully");
    } catch (error) {
      console.error("❌ Failed to send broadcast:", error);
    }
  };

  const handleCreateCustomer = async (customer: NewCustomerData) => {
    try {
      await invoke("create_customer", {
        payload: {
          user_id: customer.id,
          name: customer.name,
          email: customer.email,
          dob: customer.dob,
          balance: customer.initialBalance,
        },
      });

      console.log("✅ Customer created successfully");
    } catch (error) {
      console.error("❌ Failed to create customer:", error);
    }
  };

  useEffect(() => {
    const fetchRidesAndRestaurants = async () => {
      try {
        const rideResponse = await invoke("view_all_rides");
        const restaurantResponse = await invoke("view_all_restaurants");

        if ("data" in rideResponse) {
          setRides(rideResponse.data);
        }

        if ("data" in restaurantResponse) {
          setRestaurants(restaurantResponse.data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch rides or restaurants:", err);
      }
    };

    fetchRidesAndRestaurants();
  }, []);

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
            <OfficialChatInterface userId={userId} />
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
