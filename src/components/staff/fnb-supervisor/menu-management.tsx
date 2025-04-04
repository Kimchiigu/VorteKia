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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface Menu {
  menu_id: string;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  image?: string;
  restaurant_id: string;
}

interface Restaurant {
  restaurant_id: string;
  name: string;
  description: string;
  cuisine_type: string;
  image: string;
  location: string;
  operational_status: string;
  operational_start_hours: string;
  operational_end_hours: string;
}

interface MenuManagementProps {
  restaurants: Restaurant[];
  menus: Menu[];
}

export function MenuManagement({ menus, restaurants }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<Menu[]>(menus);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Omit<Menu, "menu_id">>({
    name: "",
    price: 0,
    description: "",
    image: "",
    restaurant_id: "",
    available_quantity: 0,
  });

  const [editItem, setEditItem] = useState<Menu | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all");

  const generateMenuId = () => {
    return `MENU_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.restaurant_id || newItem.price <= 0) return;

    setIsLoading(true);
    try {
      const base64 = (newItem.image ?? "").split(",")[1] || "";
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      await invoke("create_menu", {
        payload: {
          menu_id: generateMenuId(),
          restaurant_id: newItem.restaurant_id,
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          available_quantity: newItem.available_quantity,
          image: Array.from(byteArray),
        },
      });

      await fetchMenuItems();

      setNewItem({
        name: "",
        price: 0,
        description: "",
        image: "",
        restaurant_id: "",
        available_quantity: 0,
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editItem) return;

    setIsLoading(true);
    try {
      const base64 = (editItem.image ?? "").split(",")[1] || "";
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      await invoke("update_menu", {
        payload: {
          menu_id: editItem.menu_id,
          restaurant_id: editItem.restaurant_id,
          name: editItem.name,
          description: editItem.description,
          price: editItem.price,
          available_quantity: editItem.available_quantity,
          image: Array.from(byteArray),
        },
      });

      await fetchMenuItems();

      setEditItem(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (menu_id: string) => {
    setIsLoading(true);
    try {
      await invoke("delete_menu", {
        payload: {
          menu_id: menu_id,
        },
      });

      await fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await invoke("view_all_menus");
      // @ts-ignore
      if (response.data) {
        // @ts-ignore
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setNewItem((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredItems =
    selectedRestaurant === "all"
      ? menuItems
      : menuItems.filter((item) => item.restaurant_id === selectedRestaurant);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menu Management</CardTitle>
          <CardDescription>
            Add, update, or remove menu items for restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList className="mb-4">
              <TabsTrigger value="view">View Menu Items</TabsTrigger>
              <TabsTrigger value="add">Add New Item</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              <div className="mb-4">
                <Label htmlFor="filter-restaurant">Filter by Restaurant</Label>
                <Select
                  value={selectedRestaurant}
                  onValueChange={setSelectedRestaurant}
                >
                  <SelectTrigger id="filter-restaurant">
                    <SelectValue placeholder="All Restaurants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>{" "}
                    {restaurants.map((restaurant) => (
                      <SelectItem
                        key={restaurant.restaurant_id}
                        value={restaurant.restaurant_id}
                      >
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.length > 0 ? (
                      filteredItems.map((menu) => (
                        <TableRow key={menu.menu_id}>
                          <TableCell>
                            <div className="relative h-10 w-10 rounded-md overflow-hidden">
                              <img
                                src={
                                  menu.image
                                    ? `data:image/png;base64,${menu.image}`
                                    : "/placeholder.svg?height=100&width=100"
                                }
                                alt={menu.name}
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>{menu.name}</TableCell>
                          <TableCell>${menu.price.toFixed(2)}</TableCell>
                          <TableCell>{menu.available_quantity}</TableCell>
                          <TableCell>
                            {
                              restaurants.find(
                                (r) => r.restaurant_id === menu.restaurant_id
                              )?.name
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setEditItem(menu)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Menu Item</DialogTitle>
                                    <DialogDescription>
                                      Update the details of this menu item
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editItem && (
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input
                                          id="edit-name"
                                          value={editItem.name}
                                          onChange={(e) =>
                                            setEditItem({
                                              ...editItem,
                                              name: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit-price">
                                          Price ($)
                                        </Label>
                                        <Input
                                          id="edit-price"
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={editItem.price}
                                          onChange={(e) =>
                                            setEditItem({
                                              ...editItem,
                                              price: Number.parseFloat(
                                                e.target.value
                                              ),
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
                                          value={editItem.description}
                                          onChange={(e) =>
                                            setEditItem({
                                              ...editItem,
                                              description: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit-quantity">
                                          Available Quantity
                                        </Label>
                                        <Input
                                          id="edit-quantity"
                                          type="number"
                                          min="0"
                                          value={editItem.available_quantity}
                                          onChange={(e) =>
                                            setEditItem({
                                              ...editItem,
                                              available_quantity: parseInt(
                                                e.target.value
                                              ),
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit-restaurant">
                                          Restaurant
                                        </Label>
                                        <Select
                                          value={editItem.restaurant_id}
                                          onValueChange={(value) =>
                                            setEditItem({
                                              ...editItem,
                                              restaurant_id: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger id="edit-restaurant">
                                            <SelectValue placeholder="Select restaurant" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {restaurants.map((restaurant) => (
                                              <SelectItem
                                                key={restaurant.restaurant_id}
                                                value={restaurant.restaurant_id}
                                              >
                                                {restaurant.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label>Image Preview</Label>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-image">
                                            Menu Image
                                          </Label>
                                          <div className="flex items-center gap-4">
                                            <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                                              {editItem.image ? (
                                                <img
                                                  src={
                                                    editItem.image ||
                                                    "/placeholder.svg"
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
                                                id="edit-image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) {
                                                    const reader =
                                                      new FileReader();
                                                    reader.onloadend = () => {
                                                      const imageUrl =
                                                        reader.result as string;
                                                      setEditItem((prev) => ({
                                                        ...prev!,
                                                        image: imageUrl,
                                                      }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                  }
                                                }}
                                                className="hidden"
                                              />
                                              <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                  document
                                                    .getElementById(
                                                      "edit-image"
                                                    )
                                                    ?.click()
                                                }
                                                className="w-full"
                                              >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Image
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditItem(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleUpdateItem}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteItem(menu.menu_id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No menu items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Menu Item</CardTitle>
                  <CardDescription>
                    Fill in the details to add a new menu item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="item-name">Name</Label>
                        <Input
                          id="item-name"
                          value={newItem.name}
                          onChange={(e) =>
                            setNewItem({ ...newItem, name: e.target.value })
                          }
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="item-price">Price ($)</Label>
                        <Input
                          id="item-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.price || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              price: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="item-description">Description</Label>
                      <Input
                        id="item-description"
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter item description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="item-quantity">
                          Available Quantity
                        </Label>
                        <Input
                          id="item-quantity"
                          type="number"
                          min="0"
                          value={newItem.available_quantity || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              available_quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="item-restaurant">Restaurant</Label>
                        <Select
                          value={newItem.restaurant_id}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, restaurant_id: value })
                          }
                        >
                          <SelectTrigger id="item-restaurant">
                            <SelectValue placeholder="Select restaurant" />
                          </SelectTrigger>
                          <SelectContent>
                            {restaurants.map((restaurant) => (
                              <SelectItem
                                key={restaurant.restaurant_id}
                                value={restaurant.restaurant_id}
                              >
                                {restaurant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Image Preview</Label>
                      <div className="space-y-2">
                        <Label htmlFor="image">Menu Image</Label>
                        <div className="flex items-center gap-4">
                          <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <img
                                src={imagePreview || "/placeholder.svg"}
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
                                document.getElementById("image")?.click()
                              }
                              className="w-full"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Image
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleAddItem}
                      disabled={
                        !newItem.name ||
                        !newItem.restaurant_id ||
                        newItem.price <= 0 ||
                        isLoading
                      }
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isLoading ? "Adding..." : "Add Menu Item"}
                    </Button>
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
