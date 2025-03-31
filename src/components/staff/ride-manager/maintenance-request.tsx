"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  FileText,
  AlertTriangle,
  Clock,
  PenToolIcon as Tool,
} from "lucide-react";

export type MaintenanceStatus =
  | "Draft"
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Rejected";
export type MaintenancePriority = "Low" | "Medium" | "High" | "Critical";

export interface MaintenanceRequest {
  id: string;
  rideId: string;
  rideName: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  submittedBy: string;
  submittedDate: string;
  estimatedDuration: string;
  assignedTo?: string;
  completedDate?: string;
  notes?: string;
}

export interface RideOption {
  id: string;
  name: string;
}

interface MaintenanceRequestProps {
  requests: MaintenanceRequest[];
  rides: RideOption[];
  onSubmitRequest: (
    request: Omit<MaintenanceRequest, "id" | "status" | "submittedDate">
  ) => void;
  onCancelRequest: (requestId: string) => void;
}

export function MaintenanceRequest({
  requests,
  rides,
  onSubmitRequest,
  onCancelRequest,
}: MaintenanceRequestProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);

  // Form state for new request
  const [formData, setFormData] = useState<
    Omit<MaintenanceRequest, "id" | "status" | "submittedDate">
  >({
    rideId: "",
    rideName: "",
    title: "",
    description: "",
    priority: "Medium",
    submittedBy: "Ride Manager",
    estimatedDuration: "",
  });

  const filteredRequests = requests.filter(
    (request) =>
      request.rideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "rideId") {
      const selectedRide = rides.find((ride) => ride.id === value);
      setFormData((prev) => ({
        ...prev,
        rideId: value,
        rideName: selectedRide?.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitRequest = () => {
    onSubmitRequest(formData);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      rideId: "",
      rideName: "",
      title: "",
      description: "",
      priority: "Medium",
      submittedBy: "Ride Manager",
      estimatedDuration: "",
    });
  };

  const getStatusBadgeVariant = (status: MaintenanceStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Pending":
        return "warning";
      case "In Progress":
        return "info";
      case "Completed":
        return "success";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority: MaintenancePriority) => {
    switch (priority) {
      case "Low":
        return "secondary";
      case "Medium":
        return "info";
      case "High":
        return "warning";
      case "Critical":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const isFormValid = () => {
    return (
      formData.rideId.trim() !== "" &&
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.estimatedDuration.trim() !== ""
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Maintenance Requests
          </h2>
          <p className="text-muted-foreground">
            Submit and track maintenance requests for rides
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Maintenance Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ride Name</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Est. Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No maintenance requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.rideName}
                        </TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getPriorityBadgeVariant(request.priority) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusBadgeVariant(request.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.submittedDate}</TableCell>
                        <TableCell>{request.estimatedDuration}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Request Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
            <DialogDescription>
              Submit a maintenance request for a ride
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ride">Select Ride</Label>
              <Select
                value={formData.rideId}
                onValueChange={(value) => handleSelectChange("rideId", value)}
              >
                <SelectTrigger id="ride">
                  <SelectValue placeholder="Select a ride" />
                </SelectTrigger>
                <SelectContent>
                  {rides.map((ride) => (
                    <SelectItem key={ride.id} value={ride.id}>
                      {ride.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide details about the maintenance issue..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleSelectChange("priority", value as MaintenancePriority)
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">
                  Estimated Repair Duration
                </Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  placeholder="e.g., 2 hours, 1 day"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 mt-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Important Note
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Submitting a maintenance request will disable the ride until
                    maintenance is completed for safety reasons.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={!isFormValid()}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Maintenance Request Details</DialogTitle>
            <DialogDescription>
              View details of the maintenance request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
                  <p className="text-muted-foreground">
                    Ride: {selectedRequest.rideName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      getStatusBadgeVariant(selectedRequest.status) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                  <Badge
                    variant={
                      getPriorityBadgeVariant(selectedRequest.priority) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedRequest.priority} Priority
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Submitted Date</h4>
                    <p className="text-sm">{selectedRequest.submittedDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Estimated Duration</h4>
                    <p className="text-sm">
                      {selectedRequest.estimatedDuration}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Tool className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Submitted By</h4>
                    <p className="text-sm">{selectedRequest.submittedBy}</p>
                  </div>
                </div>
                {selectedRequest.assignedTo && (
                  <div className="flex items-start gap-2">
                    <Tool className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Assigned To</h4>
                      <p className="text-sm">{selectedRequest.assignedTo}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Maintenance Notes</h4>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              {(selectedRequest.status === "Pending" ||
                selectedRequest.status === "In Progress") && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Ride Status
                      </h4>
                      <p className="text-sm text-yellow-700">
                        This ride is currently disabled for safety reasons until
                        maintenance is completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedRequest &&
              (selectedRequest.status === "Draft" ||
                selectedRequest.status === "Pending") && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedRequest) {
                      onCancelRequest(selectedRequest.id);
                      setIsViewDialogOpen(false);
                    }
                  }}
                >
                  Cancel Request
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
