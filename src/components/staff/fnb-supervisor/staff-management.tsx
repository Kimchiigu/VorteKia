"use client";

import { useState } from "react";
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

interface Chef {
  id: string;
  name: string;
  specialization: string;
  assigned: boolean;
  restaurantId?: string;
}

interface Waiter {
  id: string;
  name: string;
  assigned: boolean;
  restaurantId?: string;
}

interface Restaurant {
  id: string;
  name: string;
  requiredChefs: number;
  requiredWaiters: number;
  assignedChefs: Chef[];
  assignedWaiters: Waiter[];
  isOpen: boolean;
}

export function StaffManagement() {
  // Mock data - in a real app, this would come from an API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: "rest1",
      name: "Parkside Grill",
      requiredChefs: 2,
      requiredWaiters: 3,
      assignedChefs: [],
      assignedWaiters: [],
      isOpen: false,
    },
    {
      id: "rest2",
      name: "Thrill Bites",
      requiredChefs: 1,
      requiredWaiters: 2,
      assignedChefs: [],
      assignedWaiters: [],
      isOpen: false,
    },
    {
      id: "rest3",
      name: "Adventure Café",
      requiredChefs: 2,
      requiredWaiters: 4,
      assignedChefs: [],
      assignedWaiters: [],
      isOpen: false,
    },
  ]);

  const [chefs, setChefs] = useState<Chef[]>([
    {
      id: "chef1",
      name: "Alex Johnson",
      specialization: "Grill",
      assigned: false,
    },
    {
      id: "chef2",
      name: "Maria Garcia",
      specialization: "Pastry",
      assigned: false,
    },
    {
      id: "chef3",
      name: "David Kim",
      specialization: "Asian Cuisine",
      assigned: false,
    },
    {
      id: "chef4",
      name: "Sarah Williams",
      specialization: "Italian",
      assigned: false,
    },
    {
      id: "chef5",
      name: "James Brown",
      specialization: "Grill",
      assigned: false,
    },
  ]);

  const [waiters, setWaiters] = useState<Waiter[]>([
    { id: "waiter1", name: "Emma Davis", assigned: false },
    { id: "waiter2", name: "Michael Wilson", assigned: false },
    { id: "waiter3", name: "Sophia Martinez", assigned: false },
    { id: "waiter4", name: "Daniel Taylor", assigned: false },
    { id: "waiter5", name: "Olivia Anderson", assigned: false },
    { id: "waiter6", name: "Ethan Thomas", assigned: false },
    { id: "waiter7", name: "Ava Jackson", assigned: false },
    { id: "waiter8", name: "Noah White", assigned: false },
    { id: "waiter9", name: "Isabella Harris", assigned: false },
  ]);

  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedChef, setSelectedChef] = useState<string>("");
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");

  const assignChef = () => {
    if (!selectedRestaurant || !selectedChef) return;

    const restaurantIndex = restaurants.findIndex(
      (r) => r.id === selectedRestaurant
    );
    const chefIndex = chefs.findIndex((c) => c.id === selectedChef);

    if (restaurantIndex === -1 || chefIndex === -1) return;
    if (
      restaurants[restaurantIndex].assignedChefs.length >=
      restaurants[restaurantIndex].requiredChefs
    )
      return;

    const updatedChefs = [...chefs];
    updatedChefs[chefIndex] = {
      ...updatedChefs[chefIndex],
      assigned: true,
      restaurantId: selectedRestaurant,
    };

    const updatedRestaurants = [...restaurants];
    updatedRestaurants[restaurantIndex].assignedChefs.push(
      updatedChefs[chefIndex]
    );

    // Check if restaurant can be opened
    checkRestaurantStatus(updatedRestaurants, restaurantIndex);

    setChefs(updatedChefs);
    setRestaurants(updatedRestaurants);
    setSelectedChef("");
  };

  const assignWaiter = () => {
    if (!selectedRestaurant || !selectedWaiter) return;

    const restaurantIndex = restaurants.findIndex(
      (r) => r.id === selectedRestaurant
    );
    const waiterIndex = waiters.findIndex((w) => w.id === selectedWaiter);

    if (restaurantIndex === -1 || waiterIndex === -1) return;
    if (
      restaurants[restaurantIndex].assignedWaiters.length >=
      restaurants[restaurantIndex].requiredWaiters
    )
      return;

    const updatedWaiters = [...waiters];
    updatedWaiters[waiterIndex] = {
      ...updatedWaiters[waiterIndex],
      assigned: true,
      restaurantId: selectedRestaurant,
    };

    const updatedRestaurants = [...restaurants];
    updatedRestaurants[restaurantIndex].assignedWaiters.push(
      updatedWaiters[waiterIndex]
    );

    // Check if restaurant can be opened
    checkRestaurantStatus(updatedRestaurants, restaurantIndex);

    setWaiters(updatedWaiters);
    setRestaurants(updatedRestaurants);
    setSelectedWaiter("");
  };

  const removeChef = (restaurantId: string, chefId: string) => {
    const restaurantIndex = restaurants.findIndex((r) => r.id === restaurantId);
    const chefIndex = chefs.findIndex((c) => c.id === chefId);

    if (restaurantIndex === -1 || chefIndex === -1) return;

    const updatedChefs = [...chefs];
    updatedChefs[chefIndex] = {
      ...updatedChefs[chefIndex],
      assigned: false,
      restaurantId: undefined,
    };

    const updatedRestaurants = [...restaurants];
    updatedRestaurants[restaurantIndex].assignedChefs = updatedRestaurants[
      restaurantIndex
    ].assignedChefs.filter((c) => c.id !== chefId);

    // Check if restaurant should be closed
    checkRestaurantStatus(updatedRestaurants, restaurantIndex);

    setChefs(updatedChefs);
    setRestaurants(updatedRestaurants);
  };

  const removeWaiter = (restaurantId: string, waiterId: string) => {
    const restaurantIndex = restaurants.findIndex((r) => r.id === restaurantId);
    const waiterIndex = waiters.findIndex((w) => w.id === waiterId);

    if (restaurantIndex === -1 || waiterIndex === -1) return;

    const updatedWaiters = [...waiters];
    updatedWaiters[waiterIndex] = {
      ...updatedWaiters[waiterIndex],
      assigned: false,
      restaurantId: undefined,
    };

    const updatedRestaurants = [...restaurants];
    updatedRestaurants[restaurantIndex].assignedWaiters = updatedRestaurants[
      restaurantIndex
    ].assignedWaiters.filter((w) => w.id !== waiterId);

    // Check if restaurant should be closed
    checkRestaurantStatus(updatedRestaurants, restaurantIndex);

    setWaiters(updatedWaiters);
    setRestaurants(updatedRestaurants);
  };

  const checkRestaurantStatus = (
    updatedRestaurants: Restaurant[],
    index: number
  ) => {
    const restaurant = updatedRestaurants[index];
    const hasEnoughChefs =
      restaurant.assignedChefs.length >= restaurant.requiredChefs;
    const hasEnoughWaiters =
      restaurant.assignedWaiters.length >= restaurant.requiredWaiters;

    updatedRestaurants[index].isOpen = hasEnoughChefs && hasEnoughWaiters;
  };

  const getAvailableChefs = () => chefs.filter((chef) => !chef.assigned);
  const getAvailableWaiters = () =>
    waiters.filter((waiter) => !waiter.assigned);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staff Allocation</CardTitle>
          <CardDescription>
            Assign chefs and waiters to restaurants. Restaurants can only open
            when properly staffed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Select Restaurant</label>
              <Select
                value={selectedRestaurant}
                onValueChange={setSelectedRestaurant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
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
                  disabled={!selectedRestaurant}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a chef" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableChefs().map((chef) => (
                      <SelectItem key={chef.id} value={chef.id}>
                        {chef.name} ({chef.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignChef}
                  disabled={!selectedRestaurant || !selectedChef}
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
                  disabled={!selectedRestaurant}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a waiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableWaiters().map((waiter) => (
                      <SelectItem key={waiter.id} value={waiter.id}>
                        {waiter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignWaiter}
                  disabled={!selectedRestaurant || !selectedWaiter}
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
            View and manage staff assignments for each restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="border-2 overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <CardTitle>{restaurant.name}</CardTitle>
                    <Badge
                      variant={restaurant.isOpen ? "success" : "destructive"}
                    >
                      {restaurant.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Required Staff: {restaurant.requiredChefs} Chefs,{" "}
                    {restaurant.requiredWaiters} Waiters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Assigned Chefs ({restaurant.assignedChefs.length}/
                        {restaurant.requiredChefs})
                      </h3>
                      {restaurant.assignedChefs.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Specialization</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {restaurant.assignedChefs.map((chef) => (
                              <TableRow key={chef.id}>
                                <TableCell>{chef.name}</TableCell>
                                <TableCell>{chef.specialization}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeChef(restaurant.id, chef.id)
                                    }
                                  >
                                    Remove
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
                        Assigned Waiters ({restaurant.assignedWaiters.length}/
                        {restaurant.requiredWaiters})
                      </h3>
                      {restaurant.assignedWaiters.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {restaurant.assignedWaiters.map((waiter) => (
                              <TableRow key={waiter.id}>
                                <TableCell>{waiter.name}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeWaiter(restaurant.id, waiter.id)
                                    }
                                  >
                                    Remove
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
                      {restaurant.isOpen ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Restaurant is properly staffed and open
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Restaurant needs more staff to open
                          </span>
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {restaurant.name} Staffing Details
                          </DialogTitle>
                          <DialogDescription>
                            Current staffing status and requirements
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Chef Requirements</h4>
                            <p className="text-sm text-muted-foreground">
                              {restaurant.assignedChefs.length}/
                              {restaurant.requiredChefs} chefs assigned
                            </p>
                            {restaurant.assignedChefs.length <
                              restaurant.requiredChefs && (
                              <p className="text-sm text-red-600">
                                Need{" "}
                                {restaurant.requiredChefs -
                                  restaurant.assignedChefs.length}{" "}
                                more chef(s)
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">Waiter Requirements</h4>
                            <p className="text-sm text-muted-foreground">
                              {restaurant.assignedWaiters.length}/
                              {restaurant.requiredWaiters} waiters assigned
                            </p>
                            {restaurant.assignedWaiters.length <
                              restaurant.requiredWaiters && (
                              <p className="text-sm text-red-600">
                                Need{" "}
                                {restaurant.requiredWaiters -
                                  restaurant.assignedWaiters.length}{" "}
                                more waiter(s)
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">Status</h4>
                            {restaurant.isOpen ? (
                              <p className="text-sm text-green-600">
                                Restaurant is open and fully operational
                              </p>
                            ) : (
                              <p className="text-sm text-red-600">
                                Restaurant is closed due to insufficient
                                staffing
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
