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
import { Pencil, Plus, Trash2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  restaurantId: string;
  category: string;
}

interface Restaurant {
  id: string;
  name: string;
}

export function MenuManagement() {
  // Mock data - in a real app, this would come from an API
  const [restaurants] = useState<Restaurant[]>([
    { id: "rest1", name: "Parkside Grill" },
    { id: "rest2", name: "Thrill Bites" },
    { id: "rest3", name: "Adventure Café" },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "item1",
      name: "Thrill Burger",
      price: 12.99,
      description: "Juicy beef patty with lettuce, tomato, and special sauce",
      image: "/placeholder.svg?height=100&width=100",
      restaurantId: "rest1",
      category: "Main Course",
    },
    {
      id: "item2",
      name: "Adventure Fries",
      price: 5.99,
      description: "Crispy fries with seasoning",
      image: "/placeholder.svg?height=100&width=100",
      restaurantId: "rest1",
      category: "Side Dish",
    },
    {
      id: "item3",
      name: "Coaster Cola",
      price: 3.99,
      description: "Refreshing cola drink",
      image: "/placeholder.svg?height=100&width=100",
      restaurantId: "rest2",
      category: "Beverage",
    },
    {
      id: "item4",
      name: "Roller Pizza",
      price: 14.99,
      description: "Cheese pizza with tomato sauce",
      image: "/placeholder.svg?height=100&width=100",
      restaurantId: "rest2",
      category: "Main Course",
    },
    {
      id: "item5",
      name: "Park Salad",
      price: 8.99,
      description: "Fresh garden salad with vinaigrette",
      image: "/placeholder.svg?height=100&width=100",
      restaurantId: "rest3",
      category: "Appetizer",
    },
  ]);

  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    price: 0,
    description: "",
    image: "/placeholder.svg?height=100&width=100",
    restaurantId: "",
    category: "",
  });

  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");

  const handleAddItem = () => {
    if (!newItem.name || !newItem.restaurantId || newItem.price <= 0) return;

    const id = `item${menuItems.length + 1}`;
    setMenuItems([...menuItems, { ...newItem, id }]);

    // Reset form
    setNewItem({
      name: "",
      price: 0,
      description: "",
      image: "/placeholder.svg?height=100&width=100",
      restaurantId: "",
      category: "",
    });
  };

  const handleUpdateItem = () => {
    if (!editItem) return;

    const updatedItems = menuItems.map((item) =>
      item.id === editItem.id ? editItem : item
    );

    setMenuItems(updatedItems);
    setEditItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const filteredItems = selectedRestaurant
    ? menuItems.filter((item) => item.restaurantId === selectedRestaurant)
    : menuItems;

  const categories = [
    "Appetizer",
    "Main Course",
    "Side Dish",
    "Dessert",
    "Beverage",
  ];

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
                    <SelectItem value="all">All Restaurants</SelectItem>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
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
                      <TableHead>Category</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="relative h-10 w-10 rounded-md overflow-hidden">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            {
                              restaurants.find(
                                (r) => r.id === item.restaurantId
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
                                    onClick={() => setEditItem(item)}
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
                                        <Label htmlFor="edit-category">
                                          Category
                                        </Label>
                                        <Select
                                          value={editItem.category}
                                          onValueChange={(value) =>
                                            setEditItem({
                                              ...editItem,
                                              category: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger id="edit-category">
                                            <SelectValue placeholder="Select category" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {categories.map((category) => (
                                              <SelectItem
                                                key={category}
                                                value={category}
                                              >
                                                {category}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit-restaurant">
                                          Restaurant
                                        </Label>
                                        <Select
                                          value={editItem.restaurantId}
                                          onValueChange={(value) =>
                                            setEditItem({
                                              ...editItem,
                                              restaurantId: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger id="edit-restaurant">
                                            <SelectValue placeholder="Select restaurant" />
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
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditItem(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateItem}>
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteItem(item.id)}
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
                        <Label htmlFor="item-category">Category</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, category: value })
                          }
                        >
                          <SelectTrigger id="item-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="item-restaurant">Restaurant</Label>
                        <Select
                          value={newItem.restaurantId}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, restaurantId: value })
                          }
                        >
                          <SelectTrigger id="item-restaurant">
                            <SelectValue placeholder="Select restaurant" />
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
                    </div>
                    <div className="grid gap-2">
                      <Label>Image Preview</Label>
                      <div className="relative h-40 w-full rounded-md overflow-hidden border">
                        <img
                          src={newItem.image || "/placeholder.svg"}
                          alt="New Menu Item"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        In a real application, you would be able to upload an
                        image here.
                      </p>
                    </div>
                    <Button
                      onClick={handleAddItem}
                      disabled={
                        !newItem.name ||
                        !newItem.restaurantId ||
                        newItem.price <= 0
                      }
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Menu Item
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
