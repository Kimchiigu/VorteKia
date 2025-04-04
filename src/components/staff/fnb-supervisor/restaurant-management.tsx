import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
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
  DialogFooter,
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
import { Camera, Clock, Edit, Eye, Plus, Trash2, Upload } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RestaurantManagementProps {
  restaurants: Restaurant[];
  staffId: string;
  users: User[];
  menus: Menu[];
}

export type ProposalStatus = "Pending" | "Approved" | "Rejected";

export interface RestaurantProposal {
  id: string;
  title: string;
  type: "Ride" | "Restaurant" | "Store";
  cost: number;
  image: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  feedback?: string;
}

export function RestaurantManagement({
  restaurants,
  staffId,
  users,
  menus,
}: RestaurantManagementProps) {
  const [newRestaurant, setNewRestaurant] = useState<
    Omit<Restaurant, "id" | "isOpen">
  >({
    restaurant_id: "",
    name: "",
    description: "",
    cuisine_type: "",
    image: "/placeholder.svg?height=200&width=300",
    location: "",
    required_waiter: 0,
    required_chef: 0,
    operational_status: "",
    operational_start_hours: "09:00",
    operational_end_hours: "21:00",
  });

  const [restaurantList, setRestaurants] = useState<Restaurant[]>(restaurants);
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [proposalSubmitted, setProposalSubmitted] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [proposals, setProposals] = useState<RestaurantProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proposalCost, setProposalCost] = useState<string>("");

  const fetchRestaurants = async () => {
    try {
      const response = await invoke("view_all_restaurants");
      // @ts-ignore
      if (response.data) {
        // @ts-ignore
        console.log("Restaurants:", response.data);
        // @ts-ignore
        setRestaurants(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const handleAddRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.cuisine_type) return;

    const id = `REST_${restaurants.length + 1}`;
    setRestaurants([
      ...restaurants,
      { ...newRestaurant, restaurant_id: id, operational_status: "Closed" },
    ]);

    setNewRestaurant({
      restaurant_id: "",
      name: "",
      description: "",
      cuisine_type: "",
      image: "/placeholder.svg?height=200&width=300",
      location: "",
      required_waiter: 0,
      required_chef: 0,
      operational_status: "",
      operational_start_hours: "09:00",
      operational_end_hours: "21:00",
    });
  };

  const handleUpdateRestaurant = async () => {
    if (!editRestaurant) return;

    try {
      const base64 = (editRestaurant.image ?? "").split(",")[1] || "";
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      await invoke("update_restaurant", {
        payload: {
          restaurant_id: editRestaurant.restaurant_id,
          name: editRestaurant.name,
          description: editRestaurant.description,
          cuisine_type: editRestaurant.cuisine_type,
          image: Array.from(byteArray),
          location: editRestaurant.location,
          required_waiter: editRestaurant.required_waiter,
          required_chef: editRestaurant.required_chef,
          operational_status: editRestaurant.operational_status,
          operational_start_hours: editRestaurant.operational_start_hours,
          operational_end_hours: editRestaurant.operational_end_hours,
        },
      });

      await fetchRestaurants();

      setEditRestaurant(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      const staffToRemove = users.filter(
        (user) => user.restaurant_id === restaurantId
      );

      const menuToRemove = menus.filter(
        (menu) => menu.restaurant_id === restaurantId
      );

      for (const staff of staffToRemove) {
        await invoke("assign_restaurant_staff", {
          payload: {
            staff_id: staff.user_id,
            restaurant_id: null,
          },
        });
        console.log(
          `Staff ${staff.user_id} removed from restaurant ${restaurantId}`
        );
      }

      for (const menu of menuToRemove) {
        await invoke("delete_menu", {
          payload: {
            menu_id: menu.menu_id,
          },
        });
      }

      await invoke("delete_restaurant", {
        payload: {
          restaurant_id: restaurantId,
        },
      });

      await fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setEditRestaurant((prev) => {
          if (prev === null) return null;
          return { ...prev, image: imageUrl };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProposal = async () => {
    try {
      const cost = parseFloat(proposalCost);
      if (isNaN(cost)) {
        console.error("Invalid cost");
        return;
      }
      const proposal = {
        title: newRestaurant.name,
        type: "Restaurant" as const,
        cost: cost,
        image: newRestaurant.image || "",
        description: `${newRestaurant.description}\nCuisine Type: ${newRestaurant.cuisine_type},\nOperational Hours: ${newRestaurant.operational_start_hours} - ${newRestaurant.operational_end_hours}`,
      };

      let byteArray = new Uint8Array(0);
      if (proposal.image.startsWith("data:")) {
        const base64 = proposal.image.split(",")[1] || "";
        const binary = atob(base64);
        byteArray = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          byteArray[i] = binary.charCodeAt(i);
        }
      }

      const shortId = uuidv4().split("-")[0].toUpperCase();
      const proposalId = `PRO-${shortId}`;

      await invoke("create_proposal", {
        payload: {
          proposal_id: proposalId,
          title: proposal.title,
          type: proposal.type,
          cost: proposal.cost,
          image: Array.from(byteArray),
          description: proposal.description,
          sender_id: staffId,
        },
      });

      const res: any = await invoke("view_all_proposal");
      const formatted = res.data.map((p: any) => ({
        id: p.proposal_id,
        title: p.title,
        type: p.type,
        cost: p.cost,
        image: `data:image/png;base64,${p.image}`,
        description: p.description,
        status: p.status,
        date: p.date,
        feedback: p.feedback || "",
      }));
      setProposals(formatted);
      setProposalSubmitted(true);
      setNewRestaurant({
        restaurant_id: "",
        name: "",
        description: "",
        cuisine_type: "",
        image: "/placeholder.svg?height=200&width=300",
        location: "",
        required_waiter: 0,
        required_chef: 0,
        operational_status: "",
        operational_start_hours: "09:00",
        operational_end_hours: "21:00",
      });
      setProposalCost("");
    } catch (err) {
      console.error("Failed to submit proposal:", err);
    }
  };

  const filteredRestaurants =
    filterStatus === "all"
      ? restaurantList
      : restaurantList.filter((restaurant) =>
          filterStatus === "open"
            ? restaurant.operational_status === "Open"
            : restaurant.operational_status === "Closed"
        );

  const getStatusBadgeVariant = (status: ProposalStatus) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Ride":
        return "info";
      case "Restaurant":
        return "success";
      case "Store":
        return "warning";
      default:
        return "secondary";
    }
  };

  const cuisine_types = ["Italian", "Western", "Mexican", "Asian", "Japanese"];

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
              <TabsTrigger value="propose">Propose New Restaurant</TabsTrigger>
              <TabsTrigger value="view-proposal">
                View Restaurant Proposals
              </TabsTrigger>
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
                  <Card
                    key={restaurant.restaurant_id}
                    className="overflow-hidden"
                  >
                    <div className="relative h-48 w-full">
                      <img
                        src={
                          restaurant.image
                            ? `data:image/png;base64,${restaurant.image}`
                            : "/placeholder.svg"
                        }
                        alt={restaurant.name}
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            restaurant.operational_status === "Open"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {restaurant.operational_status === "Open"
                            ? "Open"
                            : "Closed"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {restaurant.cuisine_type} • {restaurant.location}
                      </p>
                      <div className="flex items-center text-sm mb-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {restaurant.operational_start_hours} -{" "}
                          {restaurant.operational_end_hours}
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
                                {restaurant.cuisine_type} restaurant
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="relative h-48 w-full rounded-md overflow-hidden">
                                <img
                                  src={
                                    restaurant.image
                                      ? `data:image/png;base64,${restaurant.image}`
                                      : "/placeholder.svg"
                                  }
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
                                    {restaurant.cuisine_type}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium">Operating Hours</h4>
                                <p className="text-sm text-muted-foreground">
                                  {restaurant.operational_start_hours} -{" "}
                                  {restaurant.operational_end_hours}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium">Status</h4>
                                <Badge
                                  variant={
                                    restaurant.operational_status === "Open"
                                      ? "success"
                                      : "destructive"
                                  }
                                >
                                  {restaurant.operational_status === "Open"
                                    ? "Open"
                                    : "Closed"}
                                </Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditRestaurant(restaurant)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Restaurant</DialogTitle>
                              </DialogHeader>
                              {editRestaurant && (
                                <div className="grid gap-4 py-4">
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
                                    <Label htmlFor="edit-description">
                                      Description
                                    </Label>
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
                                    <Label htmlFor="edit-cuisine">
                                      Cuisine Type
                                    </Label>
                                    <Input
                                      id="edit-cuisine"
                                      value={editRestaurant.cuisine_type}
                                      onChange={(e) =>
                                        setEditRestaurant({
                                          ...editRestaurant,
                                          cuisine_type: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-location">
                                      Location
                                    </Label>
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
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-location">
                                      Restaurant Image
                                    </Label>
                                    <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                                      {imagePreview ? (
                                        <img
                                          src={
                                            imagePreview || "/placeholder.svg"
                                          }
                                          alt="Concept preview"
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
                                          document
                                            .getElementById("image")
                                            ?.click()
                                        }
                                        className="w-full"
                                      >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Image
                                      </Button>
                                    </div>
                                  </div>
                                  {/* Field Tambahan */}
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-status">
                                      Operational Status
                                    </Label>
                                    <Select
                                      value={editRestaurant.operational_status}
                                      onValueChange={(value) =>
                                        setEditRestaurant({
                                          ...editRestaurant,
                                          operational_status: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger id="edit-status">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Open">
                                          Open
                                        </SelectItem>
                                        <SelectItem value="Closed">
                                          Closed
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-start-hours">
                                        Start Hours
                                      </Label>
                                      <Input
                                        id="edit-start-hours"
                                        type="time"
                                        value={
                                          editRestaurant.operational_start_hours
                                        }
                                        onChange={(e) =>
                                          setEditRestaurant({
                                            ...editRestaurant,
                                            operational_start_hours:
                                              e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-end-hours">
                                        End Hours
                                      </Label>
                                      <Input
                                        id="edit-end-hours"
                                        type="time"
                                        value={
                                          editRestaurant.operational_end_hours
                                        }
                                        onChange={(e) =>
                                          setEditRestaurant({
                                            ...editRestaurant,
                                            operational_end_hours:
                                              e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditRestaurant(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateRestaurant}
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

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
                                    handleDeleteRestaurant(
                                      restaurant.restaurant_id
                                    )
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
                          value={newRestaurant.cuisine_type}
                          onValueChange={(value) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              cuisine_type: value,
                            })
                          }
                        >
                          <SelectTrigger id="propose-cuisine">
                            <SelectValue placeholder="Select cuisine type" />
                          </SelectTrigger>
                          <SelectContent>
                            {cuisine_types.map((cuisine) => (
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
                          value={newRestaurant.operational_start_hours}
                          onChange={(e) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              operational_start_hours: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="propose-closing">Closing Time</Label>
                        <Input
                          id="propose-closing"
                          type="time"
                          value={newRestaurant.operational_end_hours}
                          onChange={(e) =>
                            setNewRestaurant({
                              ...newRestaurant,
                              operational_end_hours: e.target.value,
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
                      <Label htmlFor="propose-budget">Cost</Label>
                      <Input
                        id="propose-budget"
                        type="number"
                        value={proposalCost}
                        onChange={(e) => setProposalCost(e.target.value)}
                        placeholder="Enter estimated cost"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitProposal}
                      disabled={
                        !newRestaurant.name ||
                        !newRestaurant.cuisine_type ||
                        !newRestaurant.location ||
                        !proposalCost
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

            <TabsContent value="view-proposal">
              <Card>
                <CardHeader>
                  <CardTitle>Proposals</CardTitle>
                  <CardDescription>List of submitted proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No proposals found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          proposals.map((proposal) => (
                            <TableRow key={proposal.id}>
                              <TableCell className="font-medium">
                                {proposal.title}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    getTypeBadgeVariant(proposal.type) as
                                      | "default"
                                      | "secondary"
                                      | "destructive"
                                      | "outline"
                                      | "success"
                                      | "warning"
                                      | "info"
                                  }
                                >
                                  {proposal.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{proposal.description}</TableCell>
                              <TableCell>
                                ${proposal.cost.toLocaleString()}
                              </TableCell>
                              <TableCell>{proposal.date}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    getStatusBadgeVariant(proposal.status) as
                                      | "default"
                                      | "secondary"
                                      | "destructive"
                                      | "outline"
                                      | "success"
                                      | "warning"
                                      | "info"
                                  }
                                >
                                  {proposal.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
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
