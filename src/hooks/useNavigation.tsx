import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NavigationItem {
  id: string;
  menu_id: string | null;
  parent_id: string | null;
  label: string;
  url: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean | null;
  target: string | null;
  children?: NavigationItem[];
}

export interface NavigationMenu {
  id: string;
  name: string;
  label: string;
  sort_order?: number | null;
}

interface NavigationItemDB {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string | null;
  icon: string | null;
  target: string | null;
  sort_order: number;
  is_active: boolean;
}

export const useNavigation = (menuName?: string) => {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from("navigation_menus")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name");

      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchItems = async (targetMenuName: string) => {
    setLoading(true);
    try {
      const { data: menuData, error: menuError } = await supabase
        .from("navigation_menus")
        .select("id")
        .eq("name", targetMenuName)
        .single();

      if (menuError) throw menuError;

      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("menu_id", menuData.id)
        .order("sort_order");

      if (error) throw error;

      // Build hierarchy
      const itemMap = new Map<string, NavigationItem>();
      const rootItems: NavigationItem[] = [];

      (data || []).forEach((item) => {
        itemMap.set(item.id, { ...item, children: [] });
      });

      itemMap.forEach((item) => {
        if (item.parent_id) {
          const parent = itemMap.get(item.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });

      setItems(rootItems);
    } catch (error) {
      console.error("Error fetching navigation items:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<NavigationItem>) => {
    try {
      const { error } = await supabase
        .from("navigation_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Navigation aktualisiert",
      });

      if (menuName) await fetchItems(menuName);
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderItems = async (menuId: string, reorderedItems: { id: string; sort_order: number }[]) => {
    try {
      const promises = reorderedItems.map(({ id, sort_order }) =>
        supabase
          .from("navigation_items")
          .update({ sort_order })
          .eq("id", id)
      );

      await Promise.all(promises);

      toast({
        title: "Erfolg",
        description: "Reihenfolge gespeichert",
      });

      if (menuName) await fetchItems(menuName);
      return true;
    } catch (error) {
      console.error("Error reordering items:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Sortieren",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("navigation_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Element gelöscht",
      });

      if (menuName) await fetchItems(menuName);
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen",
        variant: "destructive",
      });
      return false;
    }
  };

  const createItem = async (menuId: string, item: Partial<NavigationItem>) => {
    try {
      const { error } = await supabase
        .from("navigation_items")
        .insert({ ...item, menu_id: menuId } as any);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Element erstellt",
      });

      if (menuName) await fetchItems(menuName);
      return true;
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Realtime subscription for navigation changes
  useEffect(() => {
    if (!menuName) return;

    fetchItems(menuName);

    const channel = supabase
      .channel('navigation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'navigation_items',
        },
        (payload) => {
          console.log('Navigation changed:', payload);
          fetchItems(menuName);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [menuName]);

  const findItemsByUrl = async (url: string) => {
    try {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("id, label, menu_id")
        .eq("url", url);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error finding items by URL:", error);
      return [];
    }
  };

  const updateUrlWithRedirect = async (
    itemId: string,
    oldUrl: string,
    newUrl: string,
    options: {
      createRedirect: boolean;
      updateAllItems: boolean;
    }
  ) => {
    try {
      // 1. Find all affected items
      const affectedItems = await findItemsByUrl(oldUrl);
      
      // 2. Create redirect if requested
      if (options.createRedirect && oldUrl !== newUrl) {
        const { error: redirectError } = await supabase
          .from("seo_redirects")
          .insert({
            from_path: oldUrl,
            to_path: newUrl,
            redirect_type: 301,
            is_active: true,
          });

        if (redirectError) {
          console.error("Error creating redirect:", redirectError);
        }
      }
      
      // 3. Update all items or just the current one
      if (options.updateAllItems && affectedItems.length > 0) {
        const updates = affectedItems.map(item => 
          supabase
            .from("navigation_items")
            .update({ url: newUrl })
            .eq("id", item.id)
        );
        await Promise.all(updates);

        toast({
          title: "Erfolg",
          description: `URL aktualisiert. ${affectedItems.length} Element${affectedItems.length !== 1 ? "e" : ""} aktualisiert${options.createRedirect ? ", Redirect erstellt" : ""}.`,
        });
      } else {
        await supabase
          .from("navigation_items")
          .update({ url: newUrl })
          .eq("id", itemId);

        toast({
          title: "Erfolg",
          description: `URL aktualisiert${options.createRedirect ? ", Redirect erstellt" : ""}.`,
        });
      }

      if (menuName) await fetchItems(menuName);
      return true;
    } catch (error) {
      console.error("Error updating URL with redirect:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der URL",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    menus,
    items,
    loading,
    updateItem,
    reorderItems,
    deleteItem,
    createItem,
    updateUrlWithRedirect,
    findItemsByUrl,
    refetch: () => menuName && fetchItems(menuName),
  };
};
