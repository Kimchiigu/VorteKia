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
import { Search, Plus, Trash2 } from "lucide-react";

export interface Customer {
  id: string;
  name: string;
  groupSize: number;
  ticketType: string;
  fastPass: boolean;
  specialNeeds?: string;
  addedTime: Date;
  position: number;
  queue_id: string;
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
  onAddCustomer: (customerId: string) => void;
  onMoveCustomer: (customerId: string, direction: "up" | "down") => void;
  onRemoveCustomer: (customerId: string) => void;
}

export function QueueManagement({
  queue,
  onAddCustomer,
  onMoveCustomer,
  onRemoveCustomer,
}: QueueManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const filteredCustomers = queue.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (customerIdInput) {
      onAddCustomer(customerIdInput);
      setCustomerIdInput("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      onRemoveCustomer(customerToDelete);
      setCustomerToDelete(null);
    }
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
                    <TableHead>Position</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Added Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No customers in queue.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.position}</TableCell>
                        <TableCell className="font-medium">
                          {customer.id}
                        </TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{formatTime(customer.addedTime)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onMoveCustomer(customer.id, "up")}
                              disabled={
                                queue.customers.findIndex(
                                  (c) => c.id === customer.id
                                ) === 0
                              }
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                onMoveCustomer(customer.id, "down")
                              }
                              disabled={
                                queue.customers.findIndex(
                                  (c) => c.id === customer.id
                                ) ===
                                queue.customers.length - 1
                              }
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCustomerToDelete(customer.id)}
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
              Masukkan Customer ID untuk menambahkan ke queue
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                value={customerIdInput}
                onChange={(e) => setCustomerIdInput(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} disabled={!customerIdInput}>
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!customerToDelete}
        onOpenChange={() => setCustomerToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this customer from the queue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
