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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BellRing, Send, Users, Clock } from "lucide-react";

export interface Department {
  id: string;
  name: string;
}

export interface BroadcastMessageData {
  title: string;
  content: string;
  type: "announcement" | "alert" | "update";
  recipients: {
    allCustomers: boolean;
    departments: string[];
  };
  scheduledTime?: Date;
}

interface BroadcastMessageProps {
  departments: Department[];
  onSendBroadcast: (message: BroadcastMessageData) => void;
}

export function BroadcastMessage({
  departments,
  onSendBroadcast,
}: BroadcastMessageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<
    "announcement" | "alert" | "update"
  >("announcement");
  const [sendToAllCustomers, setSendToAllCustomers] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string>("");

  const handleSendBroadcast = () => {
    const broadcastData: BroadcastMessageData = {
      title,
      content,
      type: messageType,
      recipients: {
        allCustomers: sendToAllCustomers,
        departments: selectedDepartments,
      },
      scheduledTime:
        isScheduled && scheduledTime ? new Date(scheduledTime) : undefined,
    };

    onSendBroadcast(broadcastData);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMessageType("announcement");
    setSendToAllCustomers(true);
    setSelectedDepartments([]);
    setIsScheduled(false);
    setScheduledTime("");
  };

  const handleDepartmentChange = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, departmentId]);
    } else {
      setSelectedDepartments(
        selectedDepartments.filter((id) => id !== departmentId)
      );
    }
  };

  const isFormValid = () => {
    return (
      title.trim() !== "" &&
      content.trim() !== "" &&
      (sendToAllCustomers || selectedDepartments.length > 0) &&
      (!isScheduled || (isScheduled && scheduledTime !== ""))
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
          Create and send announcements to customers or departments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Message Title</Label>
            <Input
              id="title"
              placeholder="Enter message title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

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

          <div className="space-y-2">
            <Label>Message Type</Label>
            <RadioGroup
              value={messageType}
              onValueChange={(value) => setMessageType(value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="announcement" id="announcement" />
                <Label htmlFor="announcement">Announcement</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alert" id="alert" />
                <Label htmlFor="alert">Alert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update" id="update" />
                <Label htmlFor="update">Update</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Recipients</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-customers"
                checked={sendToAllCustomers}
                onCheckedChange={(checked) => {
                  setSendToAllCustomers(checked as boolean);
                  if (checked) {
                    setSelectedDepartments([]);
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
                <Label>Select Departments</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {departments.map((department) => (
                    <div
                      key={department.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`dept-${department.id}`}
                        checked={selectedDepartments.includes(department.id)}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange(
                            department.id,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`dept-${department.id}`}>
                        {department.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule"
                checked={isScheduled}
                onCheckedChange={(checked) =>
                  setIsScheduled(checked as boolean)
                }
              />
              <Label htmlFor="schedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule for later
              </Label>
            </div>

            {isScheduled && (
              <div className="pl-6">
                <Label htmlFor="scheduled-time">Select Date and Time</Label>
                <Input
                  id="scheduled-time"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSendBroadcast} disabled={!isFormValid()}>
            <Send className="h-4 w-4 mr-2" />
            {isScheduled ? "Schedule Broadcast" : "Send Broadcast"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
