import { useState } from "react";
import { useNavigation, NavigationItem } from "@/hooks/useNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({
  item,
  onUpdate,
  onDelete,
}: {
  item: NavigationItem;
  onUpdate: (id: string, updates: Partial<NavigationItem>) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 mb-2">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex-1 grid grid-cols-4 gap-2">
        <Input
          value={item.label}
          onChange={(e) => onUpdate(item.id, { label: e.target.value })}
          placeholder="Label"
        />
        <Input
          value={item.url || ""}
          onChange={(e) => onUpdate(item.id, { url: e.target.value })}
          placeholder="URL"
        />
        <Input
          value={item.icon || ""}
          onChange={(e) => onUpdate(item.id, { icon: e.target.value })}
          placeholder="Icon (z.B. Home)"
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={item.is_active}
            onCheckedChange={(checked) => onUpdate(item.id, { is_active: checked })}
          />
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
  );
};

export const NavigationManager = () => {
  const [activeMenu, setActiveMenu] = useState("header");
  const { menus, items, updateItem, reorderItems, deleteItem, createItem } = useNavigation(activeMenu);
  const [localItems, setLocalItems] = useState<NavigationItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentMenu = menus.find((m) => m.name === activeMenu);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);
      const updates = reordered.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      if (currentMenu) {
        reorderItems(currentMenu.id, updates);
      }
    }
  };

  const handleAddItem = () => {
    if (currentMenu) {
      createItem(currentMenu.id, {
        label: "Neues Element",
        url: "/",
        sort_order: items.length,
        is_active: true,
        target: "_self",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeMenu} onValueChange={setActiveMenu}>
          <TabsList>
            {menus.map((menu) => (
              <TabsTrigger key={menu.id} value={menu.name}>
                {menu.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {menus.map((menu) => (
            <TabsContent key={menu.id} value={menu.name} className="space-y-4">
              <div className="flex justify-between items-center">
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
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
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
  );
};
