"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Clock, Users, MapPin, Timer } from "lucide-react";

export interface Ride {
  id: string;
  name: string;
  description: string;
  location: string;
  status: "Operational" | "Maintenance" | "Closed";
  waitTime: number;
  capacity: number;
  minHeight: number;
  duration: number;
  thrill: "Low" | "Moderate" | "High" | "Extreme";
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  status: "Open" | "Closed";
  cuisine: string;
  priceRange: "$" | "$$" | "$$$";
  capacity: number;
  currentOccupancy: number;
  openingHours: string;
}

interface ParkInformationProps {
  rides: Ride[];
  restaurants: Restaurant[];
}

export function ParkInformation({ rides, restaurants }: ParkInformationProps) {
  const [activeTab, setActiveTab] = useState("rides");
  const [rideSearchTerm, setRideSearchTerm] = useState("");
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState("");

  const filteredRides = rides.filter(
    (ride) =>
      ride.name.toLowerCase().includes(rideSearchTerm.toLowerCase()) ||
      ride.location.toLowerCase().includes(rideSearchTerm.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name
        .toLowerCase()
        .includes(restaurantSearchTerm.toLowerCase()) ||
      restaurant.cuisine
        .toLowerCase()
        .includes(restaurantSearchTerm.toLowerCase()) ||
      restaurant.location
        .toLowerCase()
        .includes(restaurantSearchTerm.toLowerCase())
  );

  const getRideStatusBadgeVariant = (status: string) => {
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

  const getRestaurantStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Open":
        return "success";
      case "Closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getThrillBadgeVariant = (thrill: string) => {
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

  const getPriceRangeBadgeVariant = (priceRange: string) => {
    switch (priceRange) {
      case "$":
        return "secondary";
      case "$$":
        return "info";
      case "$$$":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getOccupancyPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Park Information</CardTitle>
        <CardDescription>
          View detailed information about rides and restaurants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rides">Rides</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          </TabsList>

          <TabsContent value="rides" className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides by name or location..."
                className="pl-8"
                value={rideSearchTerm}
                onChange={(e) => setRideSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ride Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Thrill Level</TableHead>
                    <TableHead>Min. Height</TableHead>
                    <TableHead>Duration</TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {ride.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getRideStatusBadgeVariant(ride.status) as
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
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {ride.waitTime} min
                          </div>
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
                        <TableCell>{ride.minHeight} cm</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3 text-muted-foreground" />
                            {ride.duration} min
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants by name, cuisine, or location..."
                className="pl-8"
                value={restaurantSearchTerm}
                onChange={(e) => setRestaurantSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No restaurants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">
                          {restaurant.name}
                        </TableCell>
                        <TableCell>{restaurant.cuisine}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {restaurant.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getRestaurantStatusBadgeVariant(
                                restaurant.status
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
                            {restaurant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getPriceRangeBadgeVariant(
                                restaurant.priceRange
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
                            {restaurant.priceRange}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {restaurant.currentOccupancy}/{restaurant.capacity}(
                            {getOccupancyPercentage(
                              restaurant.currentOccupancy,
                              restaurant.capacity
                            )}
                            %)
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {restaurant.openingHours}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
