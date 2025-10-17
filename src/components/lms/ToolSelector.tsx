import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, ExternalLink } from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tool_type: string;
  external_url: string | null;
}

interface ToolSelectorProps {
  selectedTools: string[];
  onChange: (toolIds: string[]) => void;
  filterByPhase?: number;
}

const categoryColors: Record<string, string> = {
  understand: "bg-blue-100 text-blue-800",
  ideate: "bg-purple-100 text-purple-800",
  decide: "bg-orange-100 text-orange-800",
  prototype: "bg-green-100 text-green-800",
  validate: "bg-red-100 text-red-800",
  retrospect: "bg-gray-100 text-gray-800",
};

export function ToolSelector({ selectedTools, onChange, filterByPhase }: ToolSelectorProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTools = async () => {
      let query = supabase
        .from("lms_tools")
        .select("id, title, description, category, tool_type, external_url")
        .eq("is_active", true)
        .order("title");

      if (filterByPhase) {
        query = query.eq("phase_number", filterByPhase);
      }

      const { data } = await query;
      setTools(data || []);
      setLoading(false);
    };

    loadTools();
  }, [filterByPhase]);

  const handleToggle = (toolId: string) => {
    const newSelection = selectedTools.includes(toolId)
      ? selectedTools.filter((id) => id !== toolId)
      : [...selectedTools, toolId];
    onChange(newSelection);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Tools werden geladen...</div>;
  }

  return (
    <div className="space-y-4">
      <Label>Tools aus der Toolbox auswählen</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-colors ${
              selectedTools.includes(tool.id) ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => handleToggle(tool.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={() => handleToggle(tool.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Wrench className="h-3 w-3" />
                      {tool.title}
                    </CardTitle>
                  </div>
                </div>
                {tool.external_url && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className={categoryColors[tool.category]}>
                  {tool.category}
                </Badge>
                <Badge variant="outline">{tool.tool_type}</Badge>
              </div>
            </CardHeader>
            {tool.description && (
              <CardContent className="pt-0">
                <CardDescription className="text-xs line-clamp-2">
                  {tool.description}
                </CardDescription>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedTools.length} Tool(s) ausgewählt
      </p>
    </div>
  );
}
