"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Users, AlertTriangle, Info, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface RideStaff {
  id: string;
  name: string;
  role: string;
  status: "Available" | "Working";
}

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

interface RideInformationProps {
  rides: RideDetails[];
  staff: RideStaff[];
  onAssignStaff: (rideId: string, staffId: string) => void;
  onEditRide: (ride: RideDetails) => void;
}

export function RideInformation({
  rides,
  staff,
  onAssignStaff,
  onEditRide,
}: RideInformationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRide, setSelectedRide] = useState<RideDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [editedRide, setEditedRide] = useState<RideDetails | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredRides = rides.filter(
    (ride) =>
      ride.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (ride: RideDetails) => {
    setSelectedRide(ride);
    setEditedRide({ ...ride });
    setIsDetailsDialogOpen(true);
    setActiveTab("details");
    setErrors({});
  };

  const handleOpenStaffDialog = (ride: RideDetails) => {
    setSelectedRide(ride);
    setIsStaffDialogOpen(true);
  };

  const handleAssignStaff = () => {
    if (selectedRide && selectedStaffId) {
      onAssignStaff(selectedRide.id, selectedStaffId);
      setSelectedStaffId("");
      setIsStaffDialogOpen(false);
    }
  };

  const handleEditChange = (field: keyof RideDetails, value: any) => {
    if (editedRide) {
      setEditedRide({ ...editedRide, [field]: value });

      // Clear error for this field if it exists
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editedRide?.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!editedRide?.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!editedRide?.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (
      editedRide &&
      (isNaN(editedRide.capacity) || editedRide.capacity <= 0)
    ) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    if (editedRide && (isNaN(editedRide.price) || editedRide.price < 0)) {
      newErrors.price = "Price must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = () => {
    if (validateForm() && editedRide) {
      onEditRide(editedRide);
      setIsDetailsDialogOpen(false);
    } else {
      setActiveTab("edit");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Operational":
        return "success";
      case "Maintenance":
        return "warning";
      case "Closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStaffStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Working":
        return "success";
      case "Available":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getAvailableStaff = () => {
    return staff.filter((s) => s.status === "Available");
  };

  const getRideStaff = (rideId: string) => {
    return staff.filter(
      (s) => s.id === rides.find((r) => r.id === rideId)?.staffId
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Ride Information
          </h2>
          <p className="text-muted-foreground">
            View and manage ride details and staff assignments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides by name or location..."
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
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Maintenance Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No rides found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell className="font-medium">
                          {ride.name}
                        </TableCell>
                        <TableCell>{ride.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusBadgeVariant(ride.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {ride.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{ride.maintenanceStatus}</TableCell>
                        <TableCell>{ride.capacity}</TableCell>
                        <TableCell>${ride.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(ride)}
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStaffDialog(ride)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Staff
                            </Button>
                          </div>
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

      {/* Ride Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected ride
            </DialogDescription>
          </DialogHeader>
          {selectedRide && editedRide && (
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden">
                <img
                  src={
                    selectedRide.image ||
                    "/placeholder.svg?height=200&width=600" ||
                    "/placeholder.svg"
                  }
                  alt={selectedRide.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedRide.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedRide.location}
                  </p>
                </div>
                <Badge
                  variant={
                    getStatusBadgeVariant(selectedRide.status) as
                      | "default"
                      | "secondary"
                      | "destructive"
                      | "outline"
                      | "success"
                      | "warning"
                      | "info"
                  }
                >
                  {selectedRide.status}
                </Badge>
              </div>

              <p>{selectedRide.description}</p>

              <Tabs
                defaultValue="details"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Capacity</h4>
                      <p>{selectedRide.capacity} riders</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Price</h4>
                      <p>${selectedRide.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Location</h4>
                      <p>{selectedRide.location}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Assigned Staff</h4>
                      <p>
                        {staff.find((s) => s.id === selectedRide.staffId)
                          ?.name || "-"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">
                        Maintenance Status
                      </h4>
                      <p>{selectedRide.maintenanceStatus}</p>
                    </div>
                  </div>
                  {selectedRide.status === "Maintenance" && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            Maintenance in Progress
                          </h4>
                          <p className="text-sm text-yellow-700">
                            This ride is currently undergoing maintenance and is
                            not operational.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="edit" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ride Name</Label>
                      <Input
                        id="name"
                        value={editedRide.name}
                        onChange={(e) =>
                          handleEditChange("name", e.target.value)
                        }
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editedRide.location}
                        onChange={(e) =>
                          handleEditChange("location", e.target.value)
                        }
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={editedRide.capacity}
                        onChange={(e) =>
                          handleEditChange(
                            "capacity",
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                        className={errors.capacity ? "border-red-500" : ""}
                      />
                      {errors.capacity && (
                        <p className="text-sm text-red-500">
                          {errors.capacity}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editedRide.price}
                        onChange={(e) =>
                          handleEditChange(
                            "price",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500">{errors.price}</p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editedRide.description}
                        onChange={(e) =>
                          handleEditChange("description", e.target.value)
                        }
                        className={errors.description ? "border-red-500" : ""}
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <Button onClick={handleSaveEdit} className="mt-4">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
            {activeTab !== "edit" && (
              <Button onClick={() => setActiveTab("edit")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Ride
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Ride Staff</DialogTitle>
            <DialogDescription>
              Assign staff members to this ride
            </DialogDescription>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                  <img
                    src={
                      selectedRide.image ||
                      "/placeholder.svg?height=50&width=50" ||
                      "/placeholder.svg"
                    }
                    alt={selectedRide.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedRide.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRide.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Staff</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getRideStaff(selectedRide.id).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-12 text-center">
                            No staff assigned.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getRideStaff(selectedRide.id).map((staffMember) => (
                          <TableRow key={staffMember.id}>
                            <TableCell className="font-medium">
                              {staffMember.name}
                            </TableCell>
                            <TableCell>{staffMember.role}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  getStaffStatusBadgeVariant(
                                    staffMember.status
                                  ) as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                    | "success"
                                    | "warning"
                                    | "info"
                                }
                              >
                                {staffMember.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {!selectedRide.staffId ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Assign New Staff Member
                  </h4>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">Select a staff member</option>
                    {getAvailableStaff().map((staffMember) => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.name} - {staffMember.role} (
                        {staffMember.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  This ride already has a staff assigned.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStaffDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignStaff}
              disabled={!selectedStaffId || !!selectedRide?.staffId}
            >
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
