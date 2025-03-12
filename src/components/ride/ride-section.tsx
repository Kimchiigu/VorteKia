"use client";

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Check, Clock, Users, CalendarDays } from "lucide-react";
import SkeletonLoading from "../loader/skeleton";
import { useAuth } from "@/components/provider/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BackHeader from "../util/back-header";

interface Ride {
  ride_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  capacity: number;
  min_height: number;
  thrill_level: string;
  image?: string;
  is_operational: boolean;
}

interface CreateOrderPayload {
  order_id: string;
  customer_id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  is_paid: boolean;
}

export default function RideSection() {
  const { ride_id } = useParams<{ ride_id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    async function fetchRide() {
      try {
        setLoading(true);
        const response = await invoke<{ data: Ride }>("view_ride", {
          rideId: ride_id,
        });
        if (response && response.data) {
          setRide(response.data);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch ride:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRide();
  }, [ride_id]);

  const handleBookRide = () => {
    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!user?.user_id) {
      console.error("User not logged in!");
      return;
    }

    if (!ride) return;

    try {
      const orderId = `order_${Date.now()}`;
      console.log("Creating ride booking...");

      await invoke("create_order", {
        payload: {
          order_id: orderId,
          customer_id: user.user_id,
          item_type: "ride",
          item_id: ride.ride_id,
          quantity: quantity,
          is_paid: false,
        } as CreateOrderPayload,
      });

      console.log("Ride booking created successfully!");

      setIsQuantityModalOpen(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to create booking:", error);
    }
  };

  return (
    <section id="ride-details" className="scroll-mt-16">
      <BackHeader pageType="ride" />

      {loading ? (
        <SkeletonLoading />
      ) : ride ? (
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={
                  ride.image
                    ? `data:image/png;base64,${ride.image}`
                    : "/placeholder.svg?height=400&width=800"
                }
                alt={ride.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{ride.name}</CardTitle>
                  <Badge
                    variant={ride.is_operational ? "default" : "destructive"}
                    className="mt-2"
                  >
                    {ride.is_operational ? "Operational" : "Closed"}
                  </Badge>
                </div>
                <Badge className="text-lg">
                  ${ride.price ? ride.price : 100.99}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <CardDescription className="text-base">
                  {ride.description}
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {ride.duration ? ride.duration : 60} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{ride.capacity} people</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Thrill Level
                    </p>
                    <p className="font-medium">
                      {ride.thrill_level ? ride.thrill_level : "Extreme"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p>
                  Minimum height: {ride.min_height ? ride.min_height : 100} cm
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 pt-2">
              {user && user.role === "Customer" && (
                <Button
                  className="w-full md:w-auto"
                  disabled={!ride.is_operational}
                  onClick={handleBookRide}
                >
                  Book This Ride
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold">Ride not found</h2>
          <p className="text-muted-foreground mt-2">
            The ride you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate("/rides")}>
            View All Rides
          </Button>
        </div>
      )}

      {/* Quantity Selection Modal */}
      <Dialog open={isQuantityModalOpen} onOpenChange={setIsQuantityModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Ride</DialogTitle>
            <DialogDescription>
              How many tickets would you like to purchase?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center">
              <span>Number of tickets:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {ride && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span>Price per ticket:</span>
                  <span>${ride.price ? ride.price : 100}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                  <span>Total:</span>
                  <span>${(ride.price * quantity).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuantityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
            {ride && (
              <p className="text-center text-muted-foreground">
                {quantity} {quantity === 1 ? "ticket" : "tickets"} for{" "}
                {ride.name} has been added to your cart
              </p>
            )}
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Continue Browsing
              </Button>
              <Button onClick={() => navigate("/ride/order")}>View Cart</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
