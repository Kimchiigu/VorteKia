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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Clock, Edit, Eye, Plus, Trash2 } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisineType: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  location: string;
}

export function RestaurantManagement() {
  // Mock data - in a real app, this would come from an API
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: "rest1",
      name: "Parkside Grill",
      description: "American grill restaurant with a view of the park",
      image: "/placeholder.svg?height=200&width=300",
      cuisineType: "American",
      openingTime: "10:00",
      closingTime: "22:00",
      isOpen: true,
      location: "Main Street",
    },
    {
      id: "rest2",
      name: "Thrill Bites",
      description: "Quick bites near the roller coasters",
      image: "/placeholder.svg?height=200&width=300",
      cuisineType: "Fast Food",
      openingTime: "09:00",
      closingTime: "21:00",
      isOpen: true,
      location: "Thrill Zone",
    },
    {
      id: "rest3",
      name: "Adventure Café",
      description: "Relaxing café with a variety of pastries and coffee",
      image: "/placeholder.svg?height=200&width=300",
      cuisineType: "Café",
      openingTime: "08:00",
      closingTime: "20:00",
      isOpen: false,
      location: "Adventure Avenue",
    },
  ]);

  const [newRestaurant, setNewRestaurant] = useState<
    Omit<Restaurant, "id" | "isOpen">
  >({
    name: "",
    description: "",
    image: "/placeholder.svg?height=200&width=300",
    cuisineType: "",
    openingTime: "09:00",
    closingTime: "21:00",
    location: "",
  });

  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [proposalSubmitted, setProposalSubmitted] = useState<boolean>(false);

  const handleAddRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.cuisineType) return;

    const id = `rest${restaurants.length + 1}`;
    setRestaurants([...restaurants, { ...newRestaurant, id, isOpen: false }]);

    // Reset form
    setNewRestaurant({
      name: "",
      description: "",
      image: "/placeholder.svg?height=200&width=300",
      cuisineType: "",
      openingTime: "09:00",
      closingTime: "21:00",
      location: "",
    });
  };

  const handleUpdateRestaurant = () => {
    if (!editRestaurant) return;

    const updatedRestaurants = restaurants.map((restaurant) =>
      restaurant.id === editRestaurant.id ? editRestaurant : restaurant
    );

    setRestaurants(updatedRestaurants);
    setEditRestaurant(null);
  };

  const handleDeleteRestaurant = (id: string) => {
    setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
  };

  const handleSubmitProposal = () => {
    // In a real app, this would send the proposal to the CFO and CEO
    setProposalSubmitted(true);
    setTimeout(() => setProposalSubmitted(false), 3000);
  };

  const filteredRestaurants =
    filterStatus === "all"
      ? restaurants
      : restaurants.filter((restaurant) =>
          filterStatus === "open" ? restaurant.isOpen : !restaurant.isOpen
        );

  const cuisineTypes = [
    "American",
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "Fast Food",
    "Café",
    "Dessert",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Management</CardTitle>
          <CardDescription>
            Manage restaurant details and propose new restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList className="mb-4">
              <TabsTrigger value="view">View Restaurants</TabsTrigger>
              <TabsTrigger value="add">Update Restaurant</TabsTrigger>
              <TabsTrigger value="propose">Propose New Restaurant</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <Label htmlFor="filter-status" className="mr-2">
                    Filter by Status
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="filter-status" className="w-[180px]">
                      <SelectValue placeholder="All Restaurants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Restaurants</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredRestaurants.length} of {restaurants.length}{" "}
                  restaurants
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <img
                        src={restaurant.image || "/placeholder.svg"}
                        alt={restaurant.name}
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            restaurant.isOpen ? "success" : "destructive"
                          }
                        >
                          {restaurant.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {restaurant.cuisineType} • {restaurant.location}
                      </p>
                      <div className="flex items-center text-sm mb-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {restaurant.openingTime} - {restaurant.closingTime}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2 mb-4">
                        {restaurant.description}
                      </p>
                      <div className="flex justify-between">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{restaurant.name}</DialogTitle>
                              <DialogDescription>
                                {restaurant.cuisineType} restaurant
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="relative h-48 w-full rounded-md overflow-hidden">
                                <img
                                  src={restaurant.image || "/placeholder.svg"}
                                  alt={restaurant.name}
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                  {restaurant.description}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Location</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {restaurant.location}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Cuisine Type</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {restaurant.cuisineType}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium">Operating Hours</h4>
                                <p className="text-sm text-muted-foreground">
                                  {restaurant.openingTime} -{" "}
                                  {restaurant.closingTime}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium">Status</h4>
                                <Badge
                                  variant={
                                    restaurant.isOpen
                                      ? "success"
                                      : "destructive"
                                  }
                                >
                                  {restaurant.isOpen ? "Open" : "Closed"}
                                </Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditRestaurant(restaurant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Restaurant
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  {restaurant.name}? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteRestaurant(restaurant.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredRestaurants.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">
                      No restaurants found
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Update Restaurant Details</CardTitle>
                  <CardDescription>
                    Select a restaurant to update its details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="select-restaurant">
                        Select Restaurant
                      </Label>
                      <Select
                        value={editRestaurant?.id || ""}
                        onValueChange={(value) => {
                          const restaurant = restaurants.find(
                            (r) => r.id === value
                          );
                          if (restaurant) setEditRestaurant(restaurant);
                        }}
                      >
                        <SelectTrigger id="select-restaurant">
                          <SelectValue placeholder="Select a restaurant" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
                            <SelectItem
                              key={restaurant.id}
                              value={restaurant.id}
                            >
                              {restaurant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {editRestaurant && (
                      <div className="grid gap-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={editRestaurant.name}
                              onChange={(e) =>
                                setEditRestaurant({
                                  ...editRestaurant,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-cuisine">Cuisine Type</Label>
                            <Select
                              value={editRestaurant.cuisineType}
                              onValueChange={(value) =>
                                setEditRestaurant({
                                  ...editRestaurant,
                                  cuisineType: value,
                                })
                              }
                            >
                              <SelectTrigger id="edit-cuisine">
                                <SelectValue placeholder="Select cuisine type" />
                              </SelectTrigger>
                              <SelectContent>
                                {cuisineTypes.map((cuisine) => (
                                  <SelectItem key={cuisine} value={cuisine}>
                                    {cuisine}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Input
                            id="edit-description"
                            value={editRestaurant.description}
                            onChange={(e) =>
                              setEditRestaurant({
                                ...editRestaurant,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="edit-location">Location</Label>
                          <Input
                            id="edit-location"
                            value={editRestaurant.location}
                            onChange={(e) =>
                              setEditRestaurant({
                                ...editRestaurant,
                                location: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-opening">Opening Time</Label>
                            <Input
                              id="edit-opening"
                              type="time"
                              value={editRestaurant.openingTime}
                              onChange={(e) =>
                                setEditRestaurant({
                                  ...editRestaurant,
                                  openingTime: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-closing">Closing Time</Label>
                            <Input
                              id="edit-closing"
                              type="time"
                              value={editRestaurant.closingTime}
                              onChange={(e) =>
                                setEditRestaurant({
                                  ...editRestaurant,
                                  closingTime: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={
                                editRestaurant.isOpen ? "default" : "outline"
                              }
                              onClick={() =>
                                setEditRestaurant({
                                  ...editRestaurant,
                                  isOpen: true,
                                })
                              }
                              className="flex-1"
                            >
                              Open
                            </Button>
                            <Button
                              variant={
                                !editRestaurant.isOpen ? "default" : "outline"
                              }
                              onClick={() =>
                                setEditRestaurant({
                                  ...editRestaurant,
                                  isOpen: false,
                                })
                              }
                              className="flex-1"
                            >
                              Closed
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Image Preview</Label>
                          <div className="relative h-40 w-full rounded-md overflow-hidden border">
                            <img
                              src={editRestaurant.image || "/placeholder.svg"}
                              alt="Restaurant preview"
                              className="object-cover"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            In a real application, you would be able to upload
                            an image here.
                          </p>
                        </div>

                        <Button
                          onClick={handleUpdateRestaurant}
                          disabled={
                            !editRestaurant.name || !editRestaurant.cuisineType
                          }
                          className="mt-2"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="propose">
              <Card>
                <CardHeader>
                  <CardTitle>Propose New Restaurant</CardTitle>
                  <CardDescription>
                    Submit a proposal for a new restaurant to the CFO and CEO
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="propose-name">Restaurant Name</Label>
                        <Input
                          id="propose-name"
                          value={newRestaurant.name}
                          onChange={(e) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter restaurant name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="propose-cuisine">Cuisine Type</Label>
                        <Select
                          value={newRestaurant.cuisineType}
                          onValueChange={(value) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              cuisineType: value,
                            })
                          }
                        >
                          <SelectTrigger id="propose-cuisine">
                            <SelectValue placeholder="Select cuisine type" />
                          </SelectTrigger>
                          <SelectContent>
                            {cuisineTypes.map((cuisine) => (
                              <SelectItem key={cuisine} value={cuisine}>
                                {cuisine}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="propose-description">Description</Label>
                      <Input
                        id="propose-description"
                        value={newRestaurant.description}
                        onChange={(e) =>
                          setNewRestaurant({
                            ...newRestaurant,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter restaurant description"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="propose-location">
                        Proposed Location
                      </Label>
                      <Input
                        id="propose-location"
                        value={newRestaurant.location}
                        onChange={(e) =>
                          setNewRestaurant({
                            ...newRestaurant,
                            location: e.target.value,
                          })
                        }
                        placeholder="Enter proposed location"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="propose-opening">Opening Time</Label>
                        <Input
                          id="propose-opening"
                          type="time"
                          value={newRestaurant.openingTime}
                          onChange={(e) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              openingTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="propose-closing">Closing Time</Label>
                        <Input
                          id="propose-closing"
                          type="time"
                          value={newRestaurant.closingTime}
                          onChange={(e) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              closingTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Concept Image</Label>
                      <div className="relative h-40 w-full rounded-md overflow-hidden border">
                        <img
                          src={newRestaurant.image || "/placeholder.svg"}
                          alt="Restaurant concept"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        In a real application, you would be able to upload a
                        concept image here.
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="propose-budget">Estimated Budget</Label>
                      <Input
                        id="propose-budget"
                        type="number"
                        placeholder="Enter estimated budget"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="propose-roi">Expected ROI (months)</Label>
                      <Input
                        id="propose-roi"
                        type="number"
                        placeholder="Enter expected ROI in months"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitProposal}
                      disabled={
                        !newRestaurant.name ||
                        !newRestaurant.cuisineType ||
                        !newRestaurant.location
                      }
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </Button>

                    {proposalSubmitted && (
                      <div className="bg-green-50 text-green-600 p-3 rounded-md mt-2">
                        Proposal submitted successfully! The CFO and CEO will
                        review your proposal.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
