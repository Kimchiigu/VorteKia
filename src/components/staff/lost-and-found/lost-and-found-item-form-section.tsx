import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface LostAndFoundItemFormSectionProps {
  mode: "insert" | "update";
  initialData?: LostAndFoundItem;
  onSubmit: (data: LostAndFoundItem) => void;
  onCancel?: () => void;
}

export interface LostAndFoundItem {
  id?: string;
  image?: string;
  name: string;
  type: string;
  color: string;
  lastSeenLocation: string;
  finder: string;
  owner: string;
  status: "Returned to Owner" | "Found" | "Missing";
}

export function LostAndFoundItemFormSection({
  mode = "insert",
  initialData,
  onSubmit,
  onCancel,
}: LostAndFoundItemFormSectionProps) {
  const [formData, setFormData] = useState<LostAndFoundItem>({
    name: "",
    type: "",
    color: "",
    lastSeenLocation: "",
    finder: "",
    owner: "",
    status: "Missing",
    ...initialData,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.image || null);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (formData.status === "Found" ||
        formData.status === "Returned to Owner") &&
      formData.owner
    ) {
      try {
        await invoke("send_notification", {
          recipientId: formData.owner,
          title:
            formData.status === "Found"
              ? "Your item has been found!"
              : "Your item has been returned!",
          message:
            formData.status === "Found"
              ? `The item "${formData.name}" has been located by our staff. Please claim it soon.`
              : `The item "${formData.name}" has been successfully returned to you. Thank you!`,
          notifType: "Lost And Found",
        });
      } catch (err) {
        console.error("Failed to send notification:", err);
      }
    }

    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {mode === "insert" ? "Add New Lost & Found Item" : "Update Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Item Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-32 rounded-md border border-input bg-muted flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Item preview"
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
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Item Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleSelectChange(
                      "status",
                      value as "Returned to Owner" | "Found" | "Missing"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Returned to Owner">
                      Returned to Owner
                    </SelectItem>
                    <SelectItem value="Found">Found</SelectItem>
                    <SelectItem value="Missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-2">
              <Label htmlFor="lastSeenLocation">Last Seen Location</Label>
              <Textarea
                id="lastSeenLocation"
                name="lastSeenLocation"
                value={formData.lastSeenLocation}
                onChange={handleChange}
                required={formData.status === "Missing"}
              />
            </div>

            {/* Conditional Fields based on Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="finder">Finder Information</Label>
                <Input
                  id="finder"
                  name="finder"
                  value={formData.finder}
                  onChange={handleChange}
                  required={formData.status === "Found"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Owner Information</Label>
                <Input
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  required={
                    formData.status === "Missing" ||
                    formData.status === "Returned to Owner"
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {mode === "insert" ? "Add Item" : "Update Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
