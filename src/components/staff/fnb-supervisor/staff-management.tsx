import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Restaurant {
  restaurant_id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image: string;
  location: string;
  required_waiter: number;
  required_chef: number;
  operational_status: string;
  operational_start_hours: string;
  operational_end_hours: string;
}

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  restaurant_id?: string;
}

interface StaffManagementProps {
  restaurants: Restaurant[];
  users: User[];
}

export function StaffManagement({ restaurants, users }: StaffManagementProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedChef, setSelectedChef] = useState<string>("");
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chefs = users.filter((user) => user.role === "Chef");
  const waiters = users.filter((user) => user.role === "Waiter");

  const availableChefs = chefs.filter((chef) => !chef.restaurant_id);
  const availableWaiters = waiters.filter((waiter) => !waiter.restaurant_id);

  const assignStaff = async (staffId: string, restaurantId: string) => {
    setLoading(true);
    try {
      console.log("Trying to assign staff");
      console.log("Staff ID:", staffId);
      console.log("Restaurant ID:", restaurantId);
      await invoke("assign_restaurant_staff", {
        payload: {
          staff_id: staffId,
          restaurant_id: restaurantId,
        },
      });
      setError(null);
    } catch (err) {
      setError(`Gagal meng-assign staff: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const removeStaff = async (staffId: string) => {
    setLoading(true);
    try {
      console.log("Removing staff with ID:", staffId);
      await invoke("assign_restaurant_staff", {
        payload: {
          staff_id: staffId,
          restaurant_id: null,
        },
      });
      console.log("Staff removed successfully");
      setError(null);
    } catch (err) {
      setError(`Gagal menghapus staff: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const assignChef = () => {
    if (!selectedRestaurant || !selectedChef) return;
    assignStaff(selectedChef, selectedRestaurant);
    setSelectedChef("");
  };

  const assignWaiter = () => {
    if (!selectedRestaurant || !selectedWaiter) return;
    assignStaff(selectedWaiter, selectedRestaurant);
    setSelectedWaiter("");
  };

  const removeChef = (staffId: string) => {
    removeStaff(staffId);
  };

  const removeWaiter = (staffId: string) => {
    removeStaff(staffId);
  };

  const getAssignedChefs = (restaurantId: string) =>
    chefs.filter((chef) => chef.restaurant_id === restaurantId);
  const getAssignedWaiters = (restaurantId: string) =>
    waiters.filter((waiter) => waiter.restaurant_id === restaurantId);

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Staff Allocation</CardTitle>
          <CardDescription>
            Assign chefs and waiters to restaurants. Restaurant can only be open
            if the staff requirements is sufficient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Choose Restaurant</label>
              <Select
                value={selectedRestaurant}
                onValueChange={setSelectedRestaurant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem
                      key={restaurant.restaurant_id}
                      value={restaurant.restaurant_id}
                    >
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Assign Chef</label>
              <div className="flex space-x-2">
                <Select
                  value={selectedChef}
                  onValueChange={setSelectedChef}
                  disabled={!selectedRestaurant || loading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih chef" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChefs.map((chef) => (
                      <SelectItem key={chef.user_id} value={chef.user_id}>
                        {chef.name} {chef.role ? `(${chef.role})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignChef}
                  disabled={!selectedRestaurant || !selectedChef || loading}
                >
                  Assign
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Assign Waiter</label>
              <div className="flex space-x-2">
                <Select
                  value={selectedWaiter}
                  onValueChange={setSelectedWaiter}
                  disabled={!selectedRestaurant || loading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih waiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWaiters.map((waiter) => (
                      <SelectItem key={waiter.user_id} value={waiter.user_id}>
                        {waiter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignWaiter}
                  disabled={!selectedRestaurant || !selectedWaiter || loading}
                >
                  Assign
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Staffing Status</CardTitle>
          <CardDescription>
            View and manage staff assignment for every restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {restaurants.map((restaurant) => {
              const assignedChefs = getAssignedChefs(restaurant.restaurant_id);
              const assignedWaiters = getAssignedWaiters(
                restaurant.restaurant_id
              );
              const isOpen =
                assignedChefs.length >= restaurant.required_chef &&
                assignedWaiters.length >= restaurant.required_waiter;

              return (
                <Card
                  key={restaurant.restaurant_id}
                  className="border-2 overflow-hidden"
                >
                  <CardHeader className="bg-muted/50">
                    <div className="flex justify-between items-center">
                      <CardTitle>{restaurant.name}</CardTitle>
                      <Badge variant={isOpen ? "success" : "destructive"}>
                        {isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Required staff: {restaurant.required_chef} Chef,{" "}
                      {restaurant.required_waiter} Waiter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Assigned Chef ({assignedChefs.length}/
                          {restaurant.required_chef})
                        </h3>
                        {assignedChefs.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {assignedChefs.map((chef) => (
                                <TableRow key={chef.user_id}>
                                  <TableCell>{chef.name}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeChef(chef.user_id)}
                                      disabled={loading}
                                    >
                                      Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            No chefs assigned
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Assigned Waiter ({assignedWaiters.length}/
                          {restaurant.required_waiter})
                        </h3>
                        {assignedWaiters.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {assignedWaiters.map((waiter) => (
                                <TableRow key={waiter.user_id}>
                                  <TableCell>{waiter.name}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeWaiter(waiter.user_id)
                                      }
                                      disabled={loading}
                                    >
                                      Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            No waiters assigned
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <div className="flex-1">
                        {isOpen ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              Restaurant staff requirements are met and open
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              Restoran needs more staff to open
                            </span>
                          </div>
                        )}
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Staffing Details of "{restaurant.name}"
                            </DialogTitle>
                            <DialogDescription>
                              Staffing status details and requirements
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Chef Requirement</h4>
                              <p className="text-sm text-muted-foreground">
                                {assignedChefs.length}/
                                {restaurant.required_chef} chef's assigned
                              </p>
                              {assignedChefs.length <
                                restaurant.required_chef && (
                                <p className="text-sm text-red-600">
                                  Need{" "}
                                  {restaurant.required_chef -
                                    assignedChefs.length}{" "}
                                  more chef
                                </p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Waiter Requirement
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {assignedWaiters.length}/
                                {restaurant.required_waiter} waiter's assigned
                              </p>
                              {assignedWaiters.length <
                                restaurant.required_waiter && (
                                <p className="text-sm text-red-600">
                                  Need{" "}
                                  {restaurant.required_waiter -
                                    assignedWaiters.length}{" "}
                                  more waiter
                                </p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">Status</h4>
                              {isOpen ? (
                                <p className="text-sm text-green-600">
                                  Restaurant open and fully operational
                                </p>
                              ) : (
                                <p className="text-sm text-red-600">
                                  Restaurant closed due insufficient staff
                                </p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
