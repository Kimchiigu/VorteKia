import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import SkeletonLoading from "../loading/skeleton";

export default function SouvenirSection() {
  const { store_id } = useParams<{ store_id: string }>();
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSouvenirs() {
      try {
        setLoading(true);
        const response = await invoke<{ data: Souvenir[] }>(
          "view_all_souvenirs"
        );
        if (response && response.data) {
          setSouvenirs(
            response.data.filter(
              (souvenir) => souvenir.store_id.toString() === store_id
            )
          );
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch souvenirs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSouvenirs();
  }, []);

  return (
    <section id="souvenirs" className="scroll-mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-fit"
          onClick={() => navigate("/store")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Button>

        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight">Souvenirs</h2>
          <p className="text-muted-foreground mt-2">
            Find your favorite souvenirs from our stores
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {souvenirs.map((souvenir) => (
            <Card key={souvenir.souvenir_id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={
                    souvenir.image
                      ? `data:image/png;base64,${souvenir.image}`
                      : "/placeholder.svg?height=200&width=400"
                  }
                  alt={souvenir.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{souvenir.name}</CardTitle>
                  <Badge>${souvenir.price.toFixed(2)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{souvenir.description}</CardDescription>
                <Badge>
                  {souvenir.stock > 0
                    ? `${souvenir.stock} available`
                    : "Out of stock"}
                </Badge>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={souvenir.stock <= 0}
                >
                  Buy Souvenir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
