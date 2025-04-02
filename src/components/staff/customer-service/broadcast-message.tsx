"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BellRing, Send, Users, Building2 } from "lucide-react";

export interface CustomerDepartment {
  id: string;
  name: string;
}

export interface StaffDepartment {
  id: string;
  name: string;
  description: string;
}

export interface BroadcastMessageData {
  content: string;
  recipients: {
    allCustomers: boolean;
    customerDepartments: string[];
    allStaff: boolean;
    staffDepartments: string[];
  };
}

interface BroadcastMessageProps {
  customerDepartments: CustomerDepartment[];
  onSendBroadcast: (message: BroadcastMessageData) => void;
}

export function BroadcastMessage({
  customerDepartments,
  onSendBroadcast,
}: BroadcastMessageProps) {
  const [content, setContent] = useState("");
  const [sendToAllCustomers, setSendToAllCustomers] = useState(true);
  const [selectedCustomerDepartments, setSelectedCustomerDepartments] =
    useState<string[]>([]);
  const [sendToAllStaff, setSendToAllStaff] = useState(false);
  const [selectedStaffDepartments, setSelectedStaffDepartments] = useState<
    string[]
  >([]);

  // Staff departments list
  const staffDepartments: StaffDepartment[] = [
    {
      id: "GRP-CSS",
      name: "Customer Service Division",
      description: "Customer Service staff",
    },
    {
      id: "GRP-LFS",
      name: "Lost and Found Division",
      description: "Lost and Found staff",
    },
    {
      id: "GRP-OPS",
      name: "Operational Division",
      description: "Ride Manager and Ride Staff",
    },
    {
      id: "GRP-CSM",
      name: "Consumption Division",
      description: "F&B Supervisor, Chef, and Waiter",
    },
    {
      id: "GRP-CMD",
      name: "Care and Maintenance Division",
      description: "Maintenance Manager and Staff",
    },
    {
      id: "GRP-MKT",
      name: "Marketing Division",
      description: "Retail Manager and Sales Associate",
    },
    {
      id: "GRP-EXC",
      name: "Executive Division",
      description: "CEO, CFO, and COO",
    },
  ];

  const handleSendBroadcast = () => {
    const broadcastData: BroadcastMessageData = {
      content,
      recipients: {
        allCustomers: sendToAllCustomers,
        customerDepartments: selectedCustomerDepartments,
        allStaff: sendToAllStaff,
        staffDepartments: selectedStaffDepartments,
      },
    };

    onSendBroadcast(broadcastData);
    resetForm();
  };

  const resetForm = () => {
    setContent("");
    setSendToAllCustomers(true);
    setSelectedCustomerDepartments([]);
    setSendToAllStaff(false);
    setSelectedStaffDepartments([]);
  };

  const handleCustomerDepartmentChange = (
    departmentId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedCustomerDepartments([
        ...selectedCustomerDepartments,
        departmentId,
      ]);
    } else {
      setSelectedCustomerDepartments(
        selectedCustomerDepartments.filter((id) => id !== departmentId)
      );
    }
  };

  const handleStaffDepartmentChange = (
    departmentId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedStaffDepartments([...selectedStaffDepartments, departmentId]);
    } else {
      setSelectedStaffDepartments(
        selectedStaffDepartments.filter((id) => id !== departmentId)
      );
    }
  };

  const isFormValid = () => {
    return (
      content.trim() !== "" &&
      (sendToAllCustomers ||
        selectedCustomerDepartments.length > 0 ||
        sendToAllStaff ||
        selectedStaffDepartments.length > 0)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Broadcast Message
        </CardTitle>
        <CardDescription>
          Create and send announcements to customers or staff departments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Message Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label>Customer Recipients</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-customers"
                checked={sendToAllCustomers}
                onCheckedChange={(checked) => {
                  setSendToAllCustomers(checked as boolean);
                  if (checked) {
                    setSelectedCustomerDepartments([]);
                  }
                }}
              />
              <Label
                htmlFor="all-customers"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                All Customers
              </Label>
            </div>

            {!sendToAllCustomers && (
              <div className="space-y-2 pl-6">
                <Label>Select Customer Departments</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {customerDepartments.map((department) => (
                    <div
                      key={department.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`customer-dept-${department.id}`}
                        checked={selectedCustomerDepartments.includes(
                          department.id
                        )}
                        onCheckedChange={(checked) =>
                          handleCustomerDepartmentChange(
                            department.id,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`customer-dept-${department.id}`}>
                        {department.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Staff Departments</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-staff"
                checked={sendToAllStaff}
                onCheckedChange={(checked) => {
                  setSendToAllStaff(checked as boolean);
                  if (checked) {
                    setSelectedStaffDepartments([]);
                  }
                }}
              />
              <Label htmlFor="all-staff" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                All Staff Departments
              </Label>
            </div>

            {!sendToAllStaff && (
              <div className="space-y-2 pl-6">
                <Label>Select Staff Departments</Label>
                <div className="grid grid-cols-1 gap-2">
                  {staffDepartments.map((department) => (
                    <div
                      key={department.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`staff-dept-${department.id}`}
                        checked={selectedStaffDepartments.includes(
                          department.id
                        )}
                        onCheckedChange={(checked) =>
                          handleStaffDepartmentChange(
                            department.id,
                            checked as boolean
                          )
                        }
                      />
                      <div>
                        <Label
                          htmlFor={`staff-dept-${department.id}`}
                          className="font-medium"
                        >
                          {department.name} ({department.id})
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {department.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSendBroadcast} disabled={!isFormValid()}>
            <Send className="h-4 w-4 mr-2" />
            Send Broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
