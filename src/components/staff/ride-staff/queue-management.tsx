import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";

export interface Customer {
  id: string;
  name: string;
  groupSize: number;
  ticketType: string;
  fastPass: boolean;
  specialNeeds?: string;
  addedTime: Date;
}

export interface RideQueue {
  rideId: string;
  rideName: string;
  currentCapacity: number;
  maxCapacity: number;
  estimatedWaitTime: number;
  customers: Customer[];
}

interface QueueManagementProps {
  queue: RideQueue;
  onAddCustomer: (customer: Omit<Customer, "id" | "addedTime">) => void;
  onEditCustomer: (
    customerId: string,
    customer: Omit<Customer, "id" | "addedTime">
  ) => void;
  onRemoveCustomer: (customerId: string) => void;
}

export function QueueManagement({
  queue,
  onAddCustomer,
  onEditCustomer,
  onRemoveCustomer,
}: QueueManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Form state for new/edit customer
  const [formData, setFormData] = useState<Omit<Customer, "id" | "addedTime">>({
    name: "",
    groupSize: 1,
    ticketType: "Standard",
    fastPass: false,
    specialNeeds: "",
  });

  const filteredCustomers = queue.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "groupSize") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseInt(value) || 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCustomer = () => {
    onAddCustomer(formData);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditCustomer = () => {
    if (selectedCustomer) {
      onEditCustomer(selectedCustomer.id, formData);
      resetForm();
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      groupSize: customer.groupSize,
      ticketType: customer.ticketType,
      fastPass: customer.fastPass,
      specialNeeds: customer.specialNeeds || "",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      groupSize: 1,
      ticketType: "Standard",
      fastPass: false,
      specialNeeds: "",
    });
    setSelectedCustomer(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getQueueCapacityPercentage = () => {
    return Math.round((queue.currentCapacity / queue.maxCapacity) * 100);
  };

  const getQueueStatusVariant = () => {
    const percentage = getQueueCapacityPercentage();
    if (percentage < 50) return "success";
    if (percentage < 75) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Queue Management
          </h2>
          <p className="text-muted-foreground">
            Manage the customer queue for {queue.rideName}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer to Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Current Queue Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queue.currentCapacity} / {queue.maxCapacity}
            </div>
            <p className="text-xs text-muted-foreground">
              {getQueueCapacityPercentage()}% of capacity
            </p>
            <Badge
              className="mt-2"
              variant={
                getQueueStatusVariant() as
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline"
                  | "success"
                  | "warning"
                  | "info"
              }
            >
              {getQueueCapacityPercentage() < 50
                ? "Low"
                : getQueueCapacityPercentage() < 75
                ? "Moderate"
                : "High"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Estimated Wait Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queue.estimatedWaitTime} min
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current queue size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queue.customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {queue.customers.reduce(
                (total, customer) => total + customer.groupSize,
                0
              )}{" "}
              people in total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue List</CardTitle>
          <CardDescription>
            Customers currently in the queue for {queue.rideName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Group Size</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Fast Pass</TableHead>
                    <TableHead>Added Time</TableHead>
                    <TableHead>Special Needs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No customers in queue.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.id}
                        </TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {customer.groupSize}
                          </div>
                        </TableCell>
                        <TableCell>{customer.ticketType}</TableCell>
                        <TableCell>
                          {customer.fastPass ? (
                            <Badge variant="success">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatTime(customer.addedTime)}</TableCell>
                        <TableCell>
                          {customer.specialNeeds ? (
                            <Badge variant="outline">
                              {customer.specialNeeds}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(customer)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveCustomer(customer.id)}
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

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Customer to Queue</DialogTitle>
            <DialogDescription>
              Add a new customer or group to the ride queue
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size</Label>
                <Input
                  id="groupSize"
                  name="groupSize"
                  type="number"
                  min="1"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketType">Ticket Type</Label>
                <select
                  id="ticketType"
                  name="ticketType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.ticketType}
                  onChange={handleInputChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="Group">Group</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fastPass"
                name="fastPass"
                checked={formData.fastPass}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="fastPass">Fast Pass</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs (Optional)</Label>
              <Input
                id="specialNeeds"
                name="specialNeeds"
                value={formData.specialNeeds}
                onChange={handleInputChange}
                placeholder="e.g., Wheelchair access, interpreter needed"
              />
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
            <Button
              onClick={handleAddCustomer}
              disabled={!formData.name || formData.groupSize < 1}
            >
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
            <DialogDescription>
              Update customer details in the queue
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-groupSize">Group Size</Label>
                <Input
                  id="edit-groupSize"
                  name="groupSize"
                  type="number"
                  min="1"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ticketType">Ticket Type</Label>
                <select
                  id="edit-ticketType"
                  name="ticketType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.ticketType}
                  onChange={handleInputChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="Group">Group</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-fastPass"
                name="fastPass"
                checked={formData.fastPass}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-fastPass">Fast Pass</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialNeeds">
                Special Needs (Optional)
              </Label>
              <Input
                id="edit-specialNeeds"
                name="specialNeeds"
                value={formData.specialNeeds}
                onChange={handleInputChange}
                placeholder="e.g., Wheelchair access, interpreter needed"
              />
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
            <Button
              onClick={handleEditCustomer}
              disabled={!formData.name || formData.groupSize < 1}
            >
              Update Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
