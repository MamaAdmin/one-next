import { useState } from "react";
import { useNavigation, NavigationItem } from "@/hooks/useNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Plus, Edit2 } from "lucide-react";
import { URLEditDialog } from "./URLEditDialog";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  item: NavigationItem;
  depth?: number;
  onUpdate: (id: string, updates: Partial<NavigationItem>) => void;
  onDelete: (id: string) => void;
  onEditUrl: (item: NavigationItem) => void;
  onAddSubItem: (parentId: string) => void;
}

const SortableItem = ({ 
  item, 
  depth = 0, 
  onUpdate, 
  onDelete, 
  onEditUrl,
  onAddSubItem 
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 24}px`,
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "flex items-center gap-2 mb-2",
          depth > 0 && "ml-6 border-l-2 border-muted pl-4"
        )}
      >
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex-1 grid grid-cols-5 gap-2 items-center">
          <Input
            value={item.label}
            onChange={(e) => onUpdate(item.id, { label: e.target.value })}
            placeholder="Label"
          />
          <div className="relative">
            <Input
              value={item.url || ""}
              readOnly
              placeholder="URL (keine)"
              className="pr-8"
            />
            {item.url && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-8"
                onClick={() => onEditUrl(item)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Input
            value={item.icon || ""}
            onChange={(e) => onUpdate(item.id, { icon: e.target.value })}
            placeholder="Icon"
          />
          <div className="flex items-center gap-2">
            <Switch
              checked={item.is_active}
              onCheckedChange={(checked) => onUpdate(item.id, { is_active: checked })}
            />
            <span className="text-xs text-muted-foreground">Aktiv</span>
          </div>
          <div className="flex items-center gap-2">
            {item.children && item.children.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {item.children.length} Sub
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSubItem(item.id)}
              title="Untermenü hinzufügen"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Recursively render children */}
      {item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child) => (
            <SortableItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEditUrl={onEditUrl}
              onAddSubItem={onAddSubItem}
            />
          ))}
        </div>
      )}
    </>
  );
};

const NavigationManager = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("header");
  const { menus, items, loading, updateItem, reorderItems, deleteItem, createItem, updateUrlWithRedirect } = useNavigation(selectedMenu);
  const [editingUrl, setEditingUrl] = useState<{
    itemId: string;
    currentUrl: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findItemById = (items: NavigationItem[], id: string): NavigationItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllItemIds = (items: NavigationItem[]): string[] => {
    const ids: string[] = [];
    items.forEach(item => {
      ids.push(item.id);
      if (item.children) {
        ids.push(...getAllItemIds(item.children));
      }
    });
    return ids;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);
      const menuId = menus.find((m) => m.name === selectedMenu)?.id;

      if (menuId) {
        const updates = reordered.map((item, index) => ({
          id: item.id,
          sort_order: index,
        }));
        reorderItems(menuId, updates);
      }
    }
  };

  const handleAddItem = async () => {
    const menuId = menus.find((m) => m.name === selectedMenu)?.id;
    if (!menuId) return;

    const newItem: Partial<NavigationItem> = {
      label: "Neues Element",
      url: "/",
      sort_order: items.length,
      is_active: true,
      target: "_self",
      icon: null,
      parent_id: null,
    };

    await createItem(menuId, newItem);
  };

  const handleAddSubItem = async (parentId: string) => {
    const menuId = menus.find((m) => m.name === selectedMenu)?.id;
    if (!menuId) return;

    const parentItem = findItemById(items, parentId);
    const maxSortOrder = Math.max(
      ...(parentItem?.children?.map(c => c.sort_order) || [0]),
      0
    );

    const newItem: Partial<NavigationItem> = {
      label: "Neues Untermenü",
      url: "/",
      sort_order: maxSortOrder + 1,
      is_active: true,
      target: "_self",
      icon: null,
      parent_id: parentId,
    };

    await createItem(menuId, newItem);
  };

  const handleEditUrl = (item: NavigationItem) => {
    if (item.url) {
      setEditingUrl({
        itemId: item.id,
        currentUrl: item.url,
      });
    }
  };

  const handleSaveUrl = async (
    newUrl: string,
    options: { createRedirect: boolean; updateAllItems: boolean }
  ) => {
    if (!editingUrl) return;
    
    await updateUrlWithRedirect(
      editingUrl.itemId,
      editingUrl.currentUrl,
      newUrl,
      options
    );
    setEditingUrl(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Navigation Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMenu} onValueChange={setSelectedMenu}>
            <TabsList>
              {menus
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((menu) => (
                  <TabsTrigger key={menu.id} value={menu.name}>
                    {menu.label}
                  </TabsTrigger>
                ))}
            </TabsList>

            {menus.map((menu) => (
              <TabsContent key={menu.id} value={menu.name} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Label>Menü-Elemente</Label>
                  <Button onClick={handleAddItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Element hinzufügen
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={getAllItemIds(items)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                        onEditUrl={handleEditUrl}
                        onAddSubItem={handleAddSubItem}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {items.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Noch keine Menü-Elemente vorhanden
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {editingUrl && (
        <URLEditDialog
          currentUrl={editingUrl.currentUrl}
          itemId={editingUrl.itemId}
          open={!!editingUrl}
          onOpenChange={(open) => !open && setEditingUrl(null)}
          onSave={handleSaveUrl}
        />
      )}
    </>
  );
};

export default NavigationManager;
