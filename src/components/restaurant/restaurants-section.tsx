import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import SkeletonLoading from "../loader/skeleton";

interface Restaurant {
  restaurant_id: number;
  name: string;
  description: string;
  cuisine_type: string;
  location: string;
  operational_status: string;
  operational_start_hours: string;
  operational_end_hours: string;
  image?: string;
}

export function RestaurantsSection({ pageType }: OrderSectionProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log("Current Page : ", pageType);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        console.log("Invoking method get_all_restaurants");
        const response = await invoke<{ data: Restaurant[] }>(
          "view_all_restaurants"
        );

        if (response && response.data) {
          console.log(
            "Restaurant image preview:",
            response.data[0].image?.slice(0, 100)
          ); // ✅ Tambahin ini
          setRestaurants(response.data);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  const cuisines = Array.from(new Set(restaurants.map((r) => r.cuisine_type)));

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine =
      cuisineFilter === "all" || restaurant.cuisine_type === cuisineFilter;

    return matchesSearch && matchesCuisine;
  });

  return (
    <section id="restaurants" className="scroll-mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Restaurants</h2>
          <p className="text-muted-foreground mt-2">
            Discover delicious dining options throughout VorteKia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search restaurants..."
              className="pl-8 w-full sm:w-[200px] md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>

          <Select
            value={cuisineFilter}
            onValueChange={setCuisineFilter}
            disabled={loading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cuisines</SelectItem>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.restaurant_id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={
                      restaurant.image && restaurant.image.trim() !== ""
                        ? `data:image/png;base64,${restaurant.image}`
                        : "/placeholder.svg?height=200&width=400"
                    }
                    alt={restaurant.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{restaurant.name}</CardTitle>
                    <Badge variant="outline">
                      {restaurant.operational_status}
                    </Badge>
                  </div>
                  <CardDescription>{restaurant.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {restaurant.cuisine_type}
                      </span>{" "}
                      • {restaurant.location}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {restaurant.operational_start_hours} -{" "}
                      {restaurant.operational_end_hours}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate(`/${pageType}/${restaurant.restaurant_id}`)
                    }
                  >
                    View Menu
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredRestaurants.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No restaurants found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
