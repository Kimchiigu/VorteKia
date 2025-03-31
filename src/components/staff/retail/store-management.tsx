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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Edit, Trash2, Upload, Camera, Users } from "lucide-react";

export interface RetailStore {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  status: "Active" | "Under Renovation" | "Closed";
  productCount: number;
  staffCount: number;
  dailyRevenue: number;
}

export interface SalesAssociate {
  id: string;
  name: string;
  assignedStoreId?: string;
}

interface StoreManagementProps {
  stores: RetailStore[];
  salesAssociates: SalesAssociate[];
  onUpdateStore: (store: RetailStore) => void;
  onRequestRemoval: (storeId: string, reason: string) => void;
  onAssignStaff: (storeId: string, staffId: string) => void;
}

export function StoreManagement({
  stores,
  salesAssociates,
  onUpdateStore,
  onRequestRemoval,
  onAssignStaff,
}: StoreManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<RetailStore | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removalReason, setRemovalReason] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");

  // Form state for edit store
  const [formData, setFormData] = useState<Partial<RetailStore>>({
    name: "",
    description: "",
    image: "",
    location: "",
    status: "Active",
  });

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.location.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleUpdateStore = () => {
    if (selectedStore && formData) {
      onUpdateStore({ ...selectedStore, ...formData });
      resetForm();
      setIsEditDialogOpen(false);
    }
  };

  const handleRequestRemoval = () => {
    if (selectedStore && removalReason) {
      onRequestRemoval(selectedStore.id, removalReason);
      setRemovalReason("");
      setIsRemoveDialogOpen(false);
    }
  };

  const handleAssignStaff = () => {
    if (selectedStore && selectedStaffId) {
      onAssignStaff(selectedStore.id, selectedStaffId);
      setSelectedStaffId("");
      setIsStaffDialogOpen(false);
    }
  };

  const openEditDialog = (store: RetailStore) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      description: store.description,
      image: store.image,
      location: store.location,
      status: store.status,
    });
    setImagePreview(store.image);
    setIsEditDialogOpen(true);
  };

  const openRemoveDialog = (store: RetailStore) => {
    setSelectedStore(store);
    setIsRemoveDialogOpen(true);
  };

  const openStaffDialog = (store: RetailStore) => {
    setSelectedStore(store);
    setIsStaffDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      location: "",
      status: "Active",
    });
    setImagePreview(null);
    setSelectedStore(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Under Renovation":
        return "warning";
      case "Closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getAvailableStaff = () => {
    return salesAssociates.filter(
      (staff) =>
        !staff.assignedStoreId || staff.assignedStoreId === selectedStore?.id
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Store Management
          </h2>
          <p className="text-muted-foreground">
            Update store details and manage staff assignments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Products</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                    <TableHead className="text-right">Daily Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No stores found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                            <img
                              src={store.image || "/placeholder.svg"}
                              alt={store.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {store.name}
                        </TableCell>
                        <TableCell>{store.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusBadgeVariant(store.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                                | "success"
                                | "warning"
                            }
                          >
                            {store.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {store.productCount}
                        </TableCell>
                        <TableCell className="text-center">
                          {store.staffCount}
                        </TableCell>
                        <TableCell className="text-right">
                          ${store.dailyRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(store)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openStaffDialog(store)}
                            >
                              <Users className="h-4 w-4" />
                              <span className="sr-only">Assign Staff</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRemoveDialog(store)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
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

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>
              Update store details and information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-image">Store Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Store preview"
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

            <div className="space-y-2">
              <Label htmlFor="edit-name">Store Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
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
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={
                  handleInputChange as React.ChangeEventHandler<HTMLSelectElement>
                }
              >
                <option value="Active">Active</option>
                <option value="Under Renovation">Under Renovation</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
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
            <Button onClick={handleUpdateStore} disabled={!formData.name}>
              Update Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Store Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Store Removal</DialogTitle>
            <DialogDescription>
              Submit a request to remove this store. CEO approval is required.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedStore && (
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-md bg-muted overflow-hidden">
                  <img
                    src={selectedStore.image || "/placeholder.svg"}
                    alt={selectedStore.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedStore.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedStore.location}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="removal-reason">Reason for Removal</Label>
              <Textarea
                id="removal-reason"
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Provide a detailed reason for requesting store removal..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemovalReason("");
                setIsRemoveDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestRemoval}
              disabled={!removalReason}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Staff to Store</DialogTitle>
            <DialogDescription>
              Assign sales associates to this store.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedStore && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md bg-muted overflow-hidden">
                    <img
                      src={selectedStore.image || "/placeholder.svg"}
                      alt={selectedStore.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedStore.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedStore.location}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-select">Select Sales Associate</Label>
                  <select
                    id="staff-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">Select a staff member</option>
                    {getAvailableStaff().map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}{" "}
                        {staff.assignedStoreId === selectedStore.id
                          ? "(Currently Assigned)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-md border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Currently Assigned Staff</h4>
                  {salesAssociates.filter(
                    (staff) => staff.assignedStoreId === selectedStore.id
                  ).length > 0 ? (
                    <ul className="space-y-1">
                      {salesAssociates
                        .filter(
                          (staff) => staff.assignedStoreId === selectedStore.id
                        )
                        .map((staff) => (
                          <li
                            key={staff.id}
                            className="text-sm flex items-center gap-2"
                          >
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {staff.name}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No staff currently assigned to this store.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStaffId("");
                setIsStaffDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignStaff} disabled={!selectedStaffId}>
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
