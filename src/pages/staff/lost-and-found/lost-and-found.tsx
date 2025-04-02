import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LostAndFoundItemFormSection,
  type LostAndFoundItem,
} from "@/components/staff/lost-and-found/lost-and-found-item-form-section";
import { LostAndFoundItemTableSection } from "@/components/staff/lost-and-found/lost-and-found-item-table-section";
import { v4 as uuidv4 } from "uuid";

export default function LostAndFound() {
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const [activeTab, setActiveTab] = useState("view");
  const [editingItem, setEditingItem] = useState<LostAndFoundItem | undefined>(
    undefined
  );

  const fetchItems = async () => {
    try {
      const res: any = await invoke("view_lost_and_found_items");
      const data = res.data as any[];
      const mapped = data.map((item) => ({
        id: item.item_id,
        name: item.name,
        type: item.type,
        color: item.color,
        lastSeenLocation: item.location,
        finder: item.finder_id || "",
        owner: item.owner_id || "",
        status: item.status,
        image: `data:image/png;base64,${item.image}`,
      }));
      setItems(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (newItem: LostAndFoundItem) => {
    const base64 = newItem.image?.split(",")[1];
    await invoke("create_lost_item", {
      payload: {
        item_id: uuidv4(),
        name: newItem.name,
        type: newItem.type,
        color: newItem.color,
        location: newItem.lastSeenLocation,
        status: newItem.status,
        finder_id: newItem.finder || null,
        owner_id: newItem.owner || null,
        image: base64
          ? Array.from(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
          : [],
      },
    });

    await fetchItems();
    setActiveTab("view");
  };

  const handleUpdateItem = async (updatedItem: LostAndFoundItem) => {
    const base64 = updatedItem.image?.split(",")[1];
    await invoke("update_lost_item", {
      payload: {
        item_id: updatedItem.id,
        name: updatedItem.name,
        type: updatedItem.type,
        color: updatedItem.color,
        location: updatedItem.lastSeenLocation,
        status: updatedItem.status,
        finder_id: updatedItem.finder || null,
        owner_id: updatedItem.owner || null,
        image: base64
          ? Array.from(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
          : [],
      },
    });

    await fetchItems();
    setActiveTab("view");
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mt-12 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view">View Items</TabsTrigger>
            <TabsTrigger value="add">Add New Item</TabsTrigger>
            <TabsTrigger value="edit" disabled={!editingItem}>
              Edit Item
            </TabsTrigger>
          </TabsList>
          <TabsContent value="view" className="mt-6">
            <LostAndFoundItemTableSection
              items={items}
              onEdit={setEditingItem}
              onStartEdit={() => setActiveTab("edit")}
            />
          </TabsContent>
          <TabsContent value="add" className="mt-6">
            <LostAndFoundItemFormSection
              mode="insert"
              onSubmit={handleAddItem}
              onCancel={() => setActiveTab("view")}
            />
          </TabsContent>
          <TabsContent value="edit" className="mt-6">
            {editingItem && (
              <LostAndFoundItemFormSection
                mode="update"
                initialData={editingItem}
                onSubmit={handleUpdateItem}
                onCancel={() => {
                  setEditingItem(undefined);
                  setActiveTab("view");
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
