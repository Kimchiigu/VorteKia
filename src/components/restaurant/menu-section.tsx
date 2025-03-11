import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SkeletonLoading from "../loader/skeleton";
import BackHeader from "../util/back-header";

export function MenuSection() {
  const navigate = useNavigate();
  const { restaurant_id } = useParams<{ restaurant_id: string }>();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenus() {
      try {
        setLoading(true);
        console.log(`Fetching menus for restaurant ${restaurant_id}`);
        const response = await invoke<{ data: Menu[] }>("view_all_menus");

        if (response && response.data) {
          setMenus(
            response.data.filter(
              (menu) => menu.restaurant_id.toString() === restaurant_id
            )
          );
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      } finally {
        setLoading(false);
      }
    }

    if (restaurant_id) {
      fetchMenus();
    }
  }, [restaurant_id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <BackHeader pageType="restaurant" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <SkeletonLoading key={index} />
              ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border rounded-lg bg-muted/10">
            <h3 className="text-xl font-semibold mb-2">
              No menu items available
            </h3>
            <p className="text-muted-foreground mb-4">
              This restaurant hasn't added any items to their menu yet.
            </p>
            <Button variant="outline" onClick={() => navigate("/customer")}>
              Browse Other Restaurants
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menus.map((menu) => (
              <Card
                key={menu.menu_id}
                className="flex flex-col h-full transition-all hover:shadow-md"
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={
                      menu.image
                        ? `data:image/png;base64,${menu.image}`
                        : "/placeholder.svg?height=200&width=400"
                    }
                    alt={menu.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <Badge variant="secondary" className="font-medium">
                      ${menu.price.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <CardDescription className="line-clamp-2 mb-2">
                    {menu.description}
                  </CardDescription>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={
                        menu.available_quantity > 0 ? "outline" : "destructive"
                      }
                      className="text-xs"
                    >
                      {menu.available_quantity > 0
                        ? `${menu.available_quantity} available`
                        : "Out of stock"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  {/* <Button
                    className="w-full"
                    size="sm"
                    disabled={menu.available_quantity <= 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Order
                  </Button> */}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
