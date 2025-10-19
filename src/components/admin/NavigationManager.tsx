import { useState } from "react";
import { useNavigation, NavigationItem } from "@/hooks/useNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Plus, Edit2, Save, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { URLEditDialog } from "./URLEditDialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MAX_NAVIGATION_DEPTH = 2;

interface SortableItemProps {
  item: NavigationItem;
  depth?: number;
  onUpdate: (id: string, updates: Partial<NavigationItem>) => void;
  onDelete: (id: string) => void;
  onEditUrl: (item: NavigationItem) => void;
  onAddSubItem: (parentId: string) => void;
  editedItems: Record<string, Partial<NavigationItem>>;
}
const SortableItem = ({
  item,
  depth = 0,
  onUpdate,
  onDelete,
  onEditUrl,
  onAddSubItem,
  editedItems
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: item.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 24}px`
  };

  // Get item with local edits applied
  const displayItem = {
    ...item,
    ...(editedItems[item.id] || {})
  };
  const hasEdits = editedItems[item.id] !== undefined;

  // Render icon helper
  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };
  return <>
      <div ref={setNodeRef} style={style} className={cn("flex items-center gap-2 mb-2", depth > 0 && "ml-6 border-l-2 border-muted pl-4")}>
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex-1 grid grid-cols-4 gap-3 items-center">
          <Input value={displayItem.label} onChange={e => onUpdate(item.id, {
          label: e.target.value
        })} placeholder="Label" className={cn(hasEdits && editedItems[item.id]?.label !== undefined && "border-yellow-400 bg-yellow-50")} />
          <div className="relative">
            <Input value={displayItem.url || ""} readOnly placeholder="URL (keine)" className="pr-8" />
            {displayItem.url && <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-8" onClick={() => onEditUrl(item)}>
                <Edit2 className="h-4 w-4" />
              </Button>}
          </div>
          <div className="flex items-center justify-center">
            
          </div>
          <div className="flex items-center justify-end gap-2">
            {item.children && item.children.length > 0 && <Badge variant="secondary" className="text-xs">
                {item.children.length} Sub
              </Badge>}
            {depth < MAX_NAVIGATION_DEPTH && (
              <Button variant="ghost" size="sm" onClick={() => onAddSubItem(item.id)} title="Untermenü hinzufügen">
                <Plus className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Recursively render children */}
      {item.children && item.children.length > 0 && <div>
          {item.children.map(child => <SortableItem key={child.id} item={child} depth={depth + 1} onUpdate={onUpdate} onDelete={onDelete} onEditUrl={onEditUrl} onAddSubItem={onAddSubItem} editedItems={editedItems} />)}
        </div>}
    </>;
};
const NavigationManager = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("header");
  const {
    menus,
    items,
    loading,
    updateItem,
    reorderItems,
    deleteItem,
    createItem,
    updateUrlWithRedirect
  } = useNavigation(selectedMenu);
  const [editingUrl, setEditingUrl] = useState<{
    itemId: string;
    currentUrl: string;
  } | null>(null);

  // Local edit state
  const [editedItems, setEditedItems] = useState<Record<string, Partial<NavigationItem>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
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
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      const menuId = menus.find(m => m.name === selectedMenu)?.id;
      if (menuId) {
        const updates = reordered.map((item, index) => ({
          id: item.id,
          sort_order: index
        }));
        reorderItems(menuId, updates);
      }
    }
  };
  const handleAddItem = async () => {
    const menuId = menus.find(m => m.name === selectedMenu)?.id;
    if (!menuId) return;
    const newItem: Partial<NavigationItem> = {
      label: "Neues Element",
      url: "/",
      sort_order: items.length,
      is_active: true,
      target: "_self",
      icon: null,
      parent_id: null
    };
    await createItem(menuId, newItem);
  };
  const handleAddSubItem = async (parentId: string) => {
    const menuId = menus.find(m => m.name === selectedMenu)?.id;
    if (!menuId) return;
    const parentItem = findItemById(items, parentId);
    const maxSortOrder = Math.max(...(parentItem?.children?.map(c => c.sort_order) || [0]), 0);
    const newItem: Partial<NavigationItem> = {
      label: "Neues Untermenü",
      url: "/",
      sort_order: maxSortOrder + 1,
      is_active: true,
      target: "_self",
      icon: null,
      parent_id: parentId
    };
    await createItem(menuId, newItem);
  };

  // Local update handler (doesn't save to DB)
  const handleLocalUpdate = (id: string, updates: Partial<NavigationItem>) => {
    setEditedItems(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...updates
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save all changes to database
  const handleSaveChanges = async () => {
    const savePromises = Object.entries(editedItems).map(([id, updates]) => updateItem(id, updates));
    await Promise.all(savePromises);
    const count = Object.keys(editedItems).length;
    setEditedItems({});
    setHasUnsavedChanges(false);
    toast({
      title: "Änderungen gespeichert",
      description: `${count} ${count === 1 ? 'Element' : 'Elemente'} wurden aktualisiert.`
    });
  };

  // Discard all local changes
  const handleDiscardChanges = () => {
    setEditedItems({});
    setHasUnsavedChanges(false);
    toast({
      title: "Änderungen verworfen",
      description: "Alle ungespeicherten Änderungen wurden zurückgesetzt.",
      variant: "destructive"
    });
  };

  // Handle menu change with unsaved warning
  const handleMenuChange = (newMenu: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("Sie haben ungespeicherte Änderungen. Möchten Sie wirklich fortfahren?");
      if (!confirmed) return;
      setEditedItems({});
      setHasUnsavedChanges(false);
    }
    setSelectedMenu(newMenu);
  };
  const handleEditUrl = (item: NavigationItem) => {
    if (item.url) {
      setEditingUrl({
        itemId: item.id,
        currentUrl: item.url
      });
    }
  };
  const handleSaveUrl = async (newUrl: string, options: {
    createRedirect: boolean;
    updateAllItems: boolean;
  }) => {
    if (!editingUrl) return;
    await updateUrlWithRedirect(editingUrl.itemId, editingUrl.currentUrl, newUrl, options);
    setEditingUrl(null);
  };
  return <>
      <Card>
        <CardHeader>
          <CardTitle>Navigation Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMenu} onValueChange={handleMenuChange}>
            <TabsList>
              {menus.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(menu => <TabsTrigger key={menu.id} value={menu.name}>
                    {menu.label}
                  </TabsTrigger>)}
            </TabsList>

            {menus.map(menu => <TabsContent key={menu.id} value={menu.name} className="space-y-4">
                {hasUnsavedChanges && <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <span className="text-sm text-yellow-800 flex-1">
                      ⚠️ Sie haben ungespeicherte Änderungen
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
                        <X className="h-4 w-4 mr-1" />
                        Verwerfen
                      </Button>
                      <Button variant="default" size="sm" onClick={handleSaveChanges}>
                        <Save className="h-4 w-4 mr-1" />
                        Speichern
                      </Button>
                    </div>
                  </div>}
                
                <div className="flex justify-between items-center mb-4">
                  <Label>Menü-Elemente</Label>
                  <Button onClick={handleAddItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Element hinzufügen
                  </Button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={getAllItemIds(items)} strategy={verticalListSortingStrategy}>
                    {items.map(item => <SortableItem key={item.id} item={item} onUpdate={handleLocalUpdate} onDelete={deleteItem} onEditUrl={handleEditUrl} onAddSubItem={handleAddSubItem} editedItems={editedItems} />)}
                  </SortableContext>
                </DndContext>

                {items.length === 0 && <div className="text-center text-muted-foreground py-8">
                    Noch keine Menü-Elemente vorhanden
                  </div>}
              </TabsContent>)}
          </Tabs>
        </CardContent>
      </Card>

      {editingUrl && <URLEditDialog currentUrl={editingUrl.currentUrl} itemId={editingUrl.itemId} open={!!editingUrl} onOpenChange={open => !open && setEditingUrl(null)} onSave={handleSaveUrl} />}
    </>;
};
export default NavigationManager;