"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Search, MapPin } from "lucide-react";

export interface Ride {
  ride_id: string;
  name: string;
  price: number;
  description: string;
  location: string;
  status: string;
  capacity: number;
  maintenance_status: string;
}

export interface Restaurant {
  restaurant_id: string;
  name: string;
  description: string;
  cuisine_type: string;
  location: string;
  operational_status: string;
  operational_start_hours: string;
  operational_end_hours: string;
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
      restaurant.cuisine_type
        .toLowerCase()
        .includes(restaurantSearchTerm.toLowerCase()) ||
      restaurant.location
        .toLowerCase()
        .includes(restaurantSearchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Park Information</CardTitle>
        <CardDescription>View all rides and restaurants</CardDescription>
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
                placeholder="Search rides..."
                className="pl-8"
                value={rideSearchTerm}
                onChange={(e) => setRideSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRides.map((ride) => (
                    <TableRow key={ride.ride_id}>
                      <TableCell className="font-medium">{ride.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {ride.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{ride.status}</Badge>
                      </TableCell>
                      <TableCell>{ride.capacity}</TableCell>
                      <TableCell>{ride.maintenance_status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                className="pl-8"
                value={restaurantSearchTerm}
                onChange={(e) => setRestaurantSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Open Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.map((restaurant) => (
                    <TableRow key={restaurant.restaurant_id}>
                      <TableCell className="font-medium">
                        {restaurant.name}
                      </TableCell>
                      <TableCell>{restaurant.location}</TableCell>
                      <TableCell>
                        <Badge>{restaurant.operational_status}</Badge>
                      </TableCell>
                      <TableCell>{restaurant.cuisine_type}</TableCell>
                      <TableCell>
                        {restaurant.operational_start_hours} -{" "}
                        {restaurant.operational_end_hours}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
