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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Upload, Camera, Info } from "lucide-react";

export type RideStatus =
  | "Operational"
  | "Maintenance"
  | "Closed"
  | "Under Construction";
export type ThrillLevel = "Low" | "Moderate" | "High" | "Extreme";

export interface Ride {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  status: RideStatus;
  capacity: number;
  hourlyCapacity: number;
  minHeight: number;
  duration: number;
  thrill: ThrillLevel;
  openingYear: number;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceFrequency: string;
  operatingHours: string;
  staffRequired: number;
  currentStaffCount: number;
}

interface RideManagementProps {
  rides: Ride[];
  onAddRide: (ride: Omit<Ride, "id">) => void;
  onUpdateRide: (ride: Ride) => void;
  onDeleteRide: (rideId: string) => void;
}

export function RideManagement({
  rides,
  onAddRide,
  onUpdateRide,
  onDeleteRide,
}: RideManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Form state for new/edit ride
  const [formData, setFormData] = useState<Omit<Ride, "id">>({
    name: "",
    description: "",
    image: "/placeholder.svg?height=200&width=400",
    location: "",
    status: "Under Construction",
    capacity: 0,
    hourlyCapacity: 0,
    minHeight: 0,
    duration: 0,
    thrill: "Moderate",
    openingYear: new Date().getFullYear(),
    lastMaintenance: "",
    nextMaintenance: "",
    maintenanceFrequency: "",
    operatingHours: "",
    staffRequired: 0,
    currentStaffCount: 0,
  });

  const filteredRides = rides.filter(
    (ride) =>
      ride.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      name === "capacity" ||
      name === "hourlyCapacity" ||
      name === "minHeight" ||
      name === "duration" ||
      name === "openingYear" ||
      name === "staffRequired" ||
      name === "currentStaffCount"
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRide = () => {
    onAddRide(formData);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdateRide = () => {
    if (selectedRide) {
      onUpdateRide({ ...selectedRide, ...formData });
      resetForm();
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteRide = () => {
    if (selectedRide) {
      onDeleteRide(selectedRide.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleViewDetails = (ride: Ride) => {
    setSelectedRide(ride);
    setIsDetailsDialogOpen(true);
  };

  const handleEditRide = (ride: Ride) => {
    setSelectedRide(ride);
    setFormData({
      name: ride.name,
      description: ride.description,
      image: ride.image,
      location: ride.location,
      status: ride.status,
      capacity: ride.capacity,
      hourlyCapacity: ride.hourlyCapacity,
      minHeight: ride.minHeight,
      duration: ride.duration,
      thrill: ride.thrill,
      openingYear: ride.openingYear,
      lastMaintenance: ride.lastMaintenance,
      nextMaintenance: ride.nextMaintenance,
      maintenanceFrequency: ride.maintenanceFrequency,
      operatingHours: ride.operatingHours,
      staffRequired: ride.staffRequired,
      currentStaffCount: ride.currentStaffCount,
    });
    setImagePreview(ride.image);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialog = (ride: Ride) => {
    setSelectedRide(ride);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "/placeholder.svg?height=200&width=400",
      location: "",
      status: "Under Construction",
      capacity: 0,
      hourlyCapacity: 0,
      minHeight: 0,
      duration: 0,
      thrill: "Moderate",
      openingYear: new Date().getFullYear(),
      lastMaintenance: "",
      nextMaintenance: "",
      maintenanceFrequency: "",
      operatingHours: "",
      staffRequired: 0,
      currentStaffCount: 0,
    });
    setImagePreview(null);
    setSelectedRide(null);
  };

  const getStatusBadgeVariant = (status: RideStatus) => {
    switch (status) {
      case "Operational":
        return "success";
      case "Maintenance":
        return "warning";
      case "Closed":
        return "destructive";
      case "Under Construction":
        return "info";
      default:
        return "secondary";
    }
  };

  const getThrillBadgeVariant = (thrill: ThrillLevel) => {
    switch (thrill) {
      case "Low":
        return "secondary";
      case "Moderate":
        return "info";
      case "High":
        return "warning";
      case "Extreme":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.capacity > 0 &&
      formData.hourlyCapacity > 0 &&
      formData.minHeight > 0 &&
      formData.duration > 0 &&
      formData.openingYear > 0 &&
      formData.operatingHours.trim() !== "" &&
      formData.staffRequired > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Ride Management</h2>
          <p className="text-muted-foreground">
            Add, update, or remove rides from the park
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Ride
        </Button>
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
                placeholder="Search rides..."
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
                    <TableHead>Thrill Level</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Duration</TableHead>
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
                        <TableCell>
                          <Badge
                            variant={
                              getThrillBadgeVariant(ride.thrill) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                                | "info"
                            }
                          >
                            {ride.thrill}
                          </Badge>
                        </TableCell>
                        <TableCell>{ride.capacity} riders</TableCell>
                        <TableCell>{ride.duration} min</TableCell>
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
                              onClick={() => handleEditRide(ride)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDialog(ride)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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

      {/* Add Ride Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Ride</DialogTitle>
            <DialogDescription>
              Enter the details for the new ride
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Ride Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Ride preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Ride Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thrill">Thrill Level</Label>
                    <select
                      id="thrill"
                      name="thrill"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.thrill}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">
                      Capacity (riders per cycle)
                    </Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyCapacity">Hourly Capacity</Label>
                    <Input
                      id="hourlyCapacity"
                      name="hourlyCapacity"
                      type="number"
                      min="1"
                      value={formData.hourlyCapacity || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minHeight">Minimum Height (cm)</Label>
                    <Input
                      id="minHeight"
                      name="minHeight"
                      type="number"
                      min="0"
                      value={formData.minHeight || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.duration || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openingYear">Opening Year</Label>
                    <Input
                      id="openingYear"
                      name="openingYear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={formData.openingYear || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Closed">Closed</option>
                      <option value="Under Construction">
                        Under Construction
                      </option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operations" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      name="operatingHours"
                      placeholder="e.g., 9:00 AM - 8:00 PM"
                      value={formData.operatingHours}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenanceFrequency">
                      Maintenance Frequency
                    </Label>
                    <Input
                      id="maintenanceFrequency"
                      name="maintenanceFrequency"
                      placeholder="e.g., Weekly, Monthly, Quarterly"
                      value={formData.maintenanceFrequency}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastMaintenance">
                      Last Maintenance Date
                    </Label>
                    <Input
                      id="lastMaintenance"
                      name="lastMaintenance"
                      placeholder="e.g., March 15, 2025"
                      value={formData.lastMaintenance}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextMaintenance">
                      Next Maintenance Date
                    </Label>
                    <Input
                      id="nextMaintenance"
                      name="nextMaintenance"
                      placeholder="e.g., April 15, 2025"
                      value={formData.nextMaintenance}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffRequired">Staff Required</Label>
                    <Input
                      id="staffRequired"
                      name="staffRequired"
                      type="number"
                      min="1"
                      value={formData.staffRequired || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentStaffCount">
                      Current Staff Count
                    </Label>
                    <Input
                      id="currentStaffCount"
                      name="currentStaffCount"
                      type="number"
                      min="0"
                      value={formData.currentStaffCount || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
            <Button onClick={handleAddRide} disabled={!isFormValid()}>
              Add Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ride Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Ride</DialogTitle>
            <DialogDescription>
              Update the details for this ride
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
              </TabsList>

              {/* Same content as Add Ride Dialog */}
              <TabsContent value="details" className="space-y-4 pt-4">
                {/* Same content as Add Ride Dialog */}
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Ride Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Ride preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("edit-image")?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-name">Ride Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-thrill">Thrill Level</Label>
                    <select
                      id="edit-thrill"
                      name="thrill"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.thrill}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4 pt-4">
                {/* Same content as Add Ride Dialog */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-capacity">
                      Capacity (riders per cycle)
                    </Label>
                    <Input
                      id="edit-capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-hourlyCapacity">Hourly Capacity</Label>
                    <Input
                      id="edit-hourlyCapacity"
                      name="hourlyCapacity"
                      type="number"
                      min="1"
                      value={formData.hourlyCapacity || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-minHeight">Minimum Height (cm)</Label>
                    <Input
                      id="edit-minHeight"
                      name="minHeight"
                      type="number"
                      min="0"
                      value={formData.minHeight || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      name="duration"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.duration || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-openingYear">Opening Year</Label>
                    <Input
                      id="edit-openingYear"
                      name="openingYear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={formData.openingYear || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      name="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Closed">Closed</option>
                      <option value="Under Construction">
                        Under Construction
                      </option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operations" className="space-y-4 pt-4">
                {/* Same content as Add Ride Dialog */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-operatingHours">Operating Hours</Label>
                    <Input
                      id="edit-operatingHours"
                      name="operatingHours"
                      placeholder="e.g., 9:00 AM - 8:00 PM"
                      value={formData.operatingHours}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-maintenanceFrequency">
                      Maintenance Frequency
                    </Label>
                    <Input
                      id="edit-maintenanceFrequency"
                      name="maintenanceFrequency"
                      placeholder="e.g., Weekly, Monthly, Quarterly"
                      value={formData.maintenanceFrequency}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-lastMaintenance">
                      Last Maintenance Date
                    </Label>
                    <Input
                      id="edit-lastMaintenance"
                      name="lastMaintenance"
                      placeholder="e.g., March 15, 2025"
                      value={formData.lastMaintenance}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-nextMaintenance">
                      Next Maintenance Date
                    </Label>
                    <Input
                      id="edit-nextMaintenance"
                      name="nextMaintenance"
                      placeholder="e.g., April 15, 2025"
                      value={formData.nextMaintenance}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-staffRequired">Staff Required</Label>
                    <Input
                      id="edit-staffRequired"
                      name="staffRequired"
                      type="number"
                      min="1"
                      value={formData.staffRequired || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-currentStaffCount">
                      Current Staff Count
                    </Label>
                    <Input
                      id="edit-currentStaffCount"
                      name="currentStaffCount"
                      type="number"
                      min="0"
                      value={formData.currentStaffCount || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRide} disabled={!isFormValid()}>
              Update Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Ride Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Ride</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ride? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRide && (
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-md bg-muted overflow-hidden">
                  <img
                    src={selectedRide.image || "/placeholder.svg"}
                    alt={selectedRide.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedRide.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRide.location}
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-destructive">
              Warning: Deleting this ride will remove all associated data,
              including maintenance records and staff assignments.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRide}>
              Delete Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ride Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected ride
            </DialogDescription>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-md bg-muted overflow-hidden">
                <img
                  src={
                    selectedRide.image ||
                    "/placeholder.svg?height=200&width=600"
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
                <div className="flex gap-2">
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
                  <Badge
                    variant={
                      getThrillBadgeVariant(selectedRide.thrill) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                        | "info"
                    }
                  >
                    {selectedRide.thrill} Thrill
                  </Badge>
                </div>
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
                  <TabsTrigger value="staffing">Staffing</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Capacity</h4>
                      <p>{selectedRide.capacity} riders per cycle</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Hourly Capacity</h4>
                      <p>{selectedRide.hourlyCapacity} riders per hour</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Minimum Height</h4>
                      <p>{selectedRide.minHeight} cm</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Ride Duration</h4>
                      <p>{selectedRide.duration} minutes</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Opening Year</h4>
                      <p>{selectedRide.openingYear}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Operating Hours</h4>
                      <p>{selectedRide.operatingHours}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Last Maintenance</h4>
                      <p>{selectedRide.lastMaintenance || "Not recorded"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        Next Scheduled Maintenance
                      </h4>
                      <p>{selectedRide.nextMaintenance || "Not scheduled"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        Maintenance Frequency
                      </h4>
                      <p>
                        {selectedRide.maintenanceFrequency || "Not specified"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="staffing" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Staff Required</h4>
                      <p>{selectedRide.staffRequired} staff members</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        Current Staff Count
                      </h4>
                      <p>{selectedRide.currentStaffCount} staff members</p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium">Staffing Status</h4>
                      <p>
                        {selectedRide.currentStaffCount >=
                        selectedRide.staffRequired
                          ? "Fully Staffed"
                          : selectedRide.currentStaffCount >=
                            selectedRide.staffRequired * 0.75
                          ? "Adequately Staffed"
                          : selectedRide.currentStaffCount >=
                            selectedRide.staffRequired * 0.5
                          ? "Understaffed"
                          : "Critically Understaffed"}
                      </p>
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
            <Button
              onClick={() => {
                setIsDetailsDialogOpen(false);
                if (selectedRide) {
                  handleEditRide(selectedRide);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
