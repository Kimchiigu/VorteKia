import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import SkeletonLoading from "../loader/skeleton";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "../provider/auth-provider";

interface Ride {
  ride_id: number;
  name: string;
  description: string;
  status: string;
  location: string;
  capacity: number;
  queue_count: number;
  image?: string;
}

export function RidesSection({ pageType }: RideSectionProps) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuth();

  useEffect(() => {
    async function fetchRides() {
      try {
        setLoading(true);
        console.log("Fetching rides...");
        const response = await invoke<{ data: Ride[] }>("view_all_rides");

        if (response && response.data) {
          setRides(response.data);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch rides:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRides();
  }, []);

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <section id="rides" className="scroll-mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Rides & Attractions
          </h2>
          <p className="text-muted-foreground mt-2">
            Discover thrilling rides and attractions throughout VorteKia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rides..."
              className="pl-8 w-full sm:w-[200px] md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <SkeletonLoading key={index} />
            ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.map((ride) => (
              <Card key={ride.ride_id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={
                      ride.image
                        ? `data:image/png;base64,${ride.image}`
                        : "/placeholder.svg?height=200&width=400"
                    }
                    alt={ride.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{ride.name}</CardTitle>
                    <Badge variant="outline">{ride.status}</Badge>
                  </div>
                  <CardDescription>{ride.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">
                        Location: {ride.location}
                      </span>
                    </div>
                    {/* <div className="text-sm">
                      Capacity: {ride.capacity} people
                    </div> */}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Queue: {ride.queue_count}/{ride.capacity}
                      </span>
                    </div>
                    <Progress
                      value={(ride.queue_count / ride.capacity) * 100}
                    />
                  </div>
                  {pageType === "ride" && user.user && (
                    <Button
                      variant="outline"
                      className="w-full mt-5"
                      onClick={() => navigate(`/${pageType}/${ride.ride_id}`)}
                    >
                      Queue Ride
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredRides.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No rides found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
