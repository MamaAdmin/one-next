import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Tool {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: 'understand' | 'ideate' | 'decide' | 'prototype' | 'validate' | 'retrospect';
  phase_number: number | null;
  tool_type: 'external' | 'embedded' | 'template';
  external_url: string | null;
  embed_code: string | null;
  template_data: any;
  thumbnail_url: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolFilters {
  category?: string;
  phase?: number;
  search?: string;
}

export interface ToolInsert {
  title: string;
  slug: string;
  description?: string;
  category: string;
  phase_number?: number;
  tool_type: string;
  external_url?: string;
  embed_code?: string;
  template_data?: any;
  thumbnail_url?: string;
  tags?: string[];
  is_active?: boolean;
}

export const useToolbox = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTools = async (filters?: ToolFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from("lms_tools")
        .select("*")
        .order("title");

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.phase) {
        query = query.eq("phase_number", filters.phase);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTools((data || []) as Tool[]);
    } catch (error) {
      console.error("Error loading tools:", error);
      toast({
        title: "Fehler",
        description: "Tools konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTool = async (toolData: ToolInsert) => {
    try {
      const { data, error } = await supabase
        .from("lms_tools")
        .insert(toolData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Tool wurde erstellt",
      });

      return data;
    } catch (error) {
      console.error("Error creating tool:", error);
      toast({
        title: "Fehler",
        description: "Tool konnte nicht erstellt werden",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTool = async (id: string, updates: Partial<ToolInsert>) => {
    try {
      const { data, error } = await supabase
        .from("lms_tools")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Tool wurde aktualisiert",
      });

      return data;
    } catch (error) {
      console.error("Error updating tool:", error);
      toast({
        title: "Fehler",
        description: "Tool konnte nicht aktualisiert werden",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lms_tools")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Tool wurde gelöscht",
      });

      await loadTools();
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast({
        title: "Fehler",
        description: "Tool konnte nicht gelöscht werden",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  return {
    tools,
    loading,
    loadTools,
    createTool,
    updateTool,
    deleteTool,
  };
};
