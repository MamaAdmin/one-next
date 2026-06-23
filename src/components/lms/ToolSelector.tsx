import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

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
  filterByCourseId?: string;
}

const categoryColors: Record<string, string> = {
  understand: "bg-blue-100 text-blue-800",
  ideate: "bg-purple-100 text-purple-800",
  decide: "bg-orange-100 text-orange-800",
  prototype: "bg-green-100 text-green-800",
  validate: "bg-red-100 text-red-800",
  retrospect: "bg-gray-100 text-gray-800",
};

const categoryLabels: Record<string, string> = {
  understand: "Verstehen",
  ideate: "Ideen entwickeln",
  decide: "Entscheiden",
  prototype: "Prototyp",
  validate: "Validieren",
  retrospect: "Retrospektive",
};

export function ToolSelector({ selectedTools, onChange, filterByCourseId: _filterByCourseId }: ToolSelectorProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("title");

  useEffect(() => {
    const loadTools = async () => {
      const { data } = await supabase
        .from("lms_tools")
        .select("id, title, description, category, tool_type, external_url")
        .eq("is_active", true)
        .order("title");

      setTools(data || []);
      setLoading(false);
    };

    loadTools();
  }, []);

  const handleToggle = (toolId: string) => {
    const newSelection = selectedTools.includes(toolId)
      ? selectedTools.filter((id) => id !== toolId)
      : [...selectedTools, toolId];
    onChange(newSelection);
  };

  const filteredTools = tools
    .filter((tool) => {
      if (categoryFilter !== "all" && tool.category !== categoryFilter) return false;
      if (searchQuery && !tool.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  if (loading) {
    return <div className="text-sm text-muted-foreground">Tools werden geladen...</div>;
  }

  return (
    <div className="space-y-4">
      <Label>Tools aus der Toolbox auswählen</Label>
      
      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tool suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sortierung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Alphabetisch</SelectItem>
            <SelectItem value="category">Nach Kategorie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compact Tool List */}
      <div className="border rounded-lg divide-y">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`p-4 flex items-center gap-3 hover:bg-accent cursor-pointer transition-colors ${
              selectedTools.includes(tool.id) ? "bg-primary/5 border-l-4 border-l-primary" : ""
            }`}
            onClick={() => handleToggle(tool.id)}
          >
            <Checkbox
              checked={selectedTools.includes(tool.id)}
              onCheckedChange={() => handleToggle(tool.id)}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{tool.title}</span>
                {tool.external_url && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              {tool.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {tool.description}
                </p>
              )}
            </div>
            
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant="secondary" className={`text-xs ${categoryColors[tool.category]}`}>
              {categoryLabels[tool.category] || tool.category}
            </Badge>
            <Badge variant="outline" className="text-xs">{tool.tool_type}</Badge>
          </div>
          </div>
        ))}
        
        {filteredTools.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Keine Tools gefunden
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {selectedTools.length} von {filteredTools.length} Tool(s) ausgewählt
      </p>
    </div>
  );
}
