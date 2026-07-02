import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToolbox, Tool } from "@/hooks/useToolbox";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Pencil, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const categoryLabels: Record<string, string> = {
  understand: "Verstehen",
  ideate: "Ideen entwickeln",
  decide: "Entscheiden",
  prototype: "Prototyp",
  validate: "Validieren",
  retrospect: "Retrospektive",
};

const categoryColors: Record<string, string> = {
  understand: "bg-primary/10 text-primary",
  ideate: "bg-primary/10 text-primary",
  decide: "bg-orange-100 text-orange-800",
  prototype: "bg-green-100 text-green-800",
  validate: "bg-red-100 text-red-800",
  retrospect: "bg-gray-100 text-gray-800",
};

interface SortableToolRowProps {
  tool: Tool;
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
  navigate: any;
  deleteTool: (id: string) => Promise<void>;
}

const SortableToolRow = ({ tool, categoryLabels, categoryColors, navigate, deleteTool }: SortableToolRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b hover:bg-muted/50">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            {tool.thumbnail_url && tool.tool_type !== 'embedded' && (
              <img src={tool.thumbnail_url} alt={tool.title} className="w-12 h-12 rounded object-cover" />
            )}
            <div>
              <div className="font-medium">{tool.title}</div>
              {tool.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {tool.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <Badge variant="secondary" className={categoryColors[tool.category]}>
          {categoryLabels[tool.category]}
        </Badge>
      </td>
      <td className="p-4">
        <Badge variant="outline" className="capitalize">{tool.tool_type}</Badge>
      </td>
      <td className="p-4">
        <Badge variant={tool.is_active ? "default" : "secondary"}>
          {tool.is_active ? 'Aktiv' : 'Inaktiv'}
        </Badge>
      </td>
      <td className="p-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {tool.slug === 'hmw-fragen' ? (
              <DropdownMenuItem onClick={() => navigate(`/lms/tools/hmw-generator`)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Generator öffnen
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => navigate(`/admin/lms/toolbox/${tool.id}`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </DropdownMenuItem>
                {tool.external_url && (
                  <DropdownMenuItem onClick={() => window.open(tool.external_url!, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Tool öffnen
                  </DropdownMenuItem>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Löschen
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tool löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchten Sie "{tool.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTool(tool.id)}>
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default function LMSToolboxDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { tools, deleteTool, updateToolsOrder } = useToolbox();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("manual");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTools.findIndex((tool) => tool.id === active.id);
      const newIndex = filteredTools.findIndex((tool) => tool.id === over.id);

      const reorderedTools = arrayMove(filteredTools, oldIndex, newIndex);
      
      const toolsWithNewOrder = reorderedTools.map((tool, index) => ({
        id: tool.id,
        sort_order: index,
      }));

      updateToolsOrder(toolsWithNewOrder);
    }
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "LMS", href: "/admin?tab=lms" },
    { label: "Toolbox", active: true },
  ];

  const filteredTools = tools
    .filter((tool) => {
      if (categoryFilter !== "all" && tool.category !== categoryFilter) return false;
      if (searchQuery && !tool.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "manual":
          return a.sort_order - b.sort_order;
        
        case "title":
          return a.title.localeCompare(b.title);
        
        case "category":
          return a.category.localeCompare(b.category);
        
        case "status":
          if (a.is_active && !b.is_active) return -1;
          if (!a.is_active && b.is_active) return 1;
          return 0;
        
        default:
          return 0;
      }
    });


  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <LMSBreadcrumb items={breadcrumbItems} />

        <div className="max-w-7xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">
                    Toolbox-Verwaltung
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Verwalten Sie Design Sprint Tools, Templates und Ressourcen
                  </CardDescription>
                </div>
                <Link to="/admin/lms/toolbox/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Neues Tool
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
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
                    <SelectItem value="manual">Manuell (Drag & Drop)</SelectItem>
                    <SelectItem value="title">Alphabetisch</SelectItem>
                    <SelectItem value="category">Nach Kategorie</SelectItem>
                    <SelectItem value="status">Nach Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Tool</th>
                      <th className="text-left p-4 font-medium">Kategorie</th>
                      <th className="text-left p-4 font-medium">Typ</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SortableContext
                      items={filteredTools.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredTools.map((tool) => (
                        <SortableToolRow
                          key={tool.id}
                          tool={tool}
                          categoryLabels={categoryLabels}
                          categoryColors={categoryColors}
                          navigate={navigate}
                          deleteTool={deleteTool}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
                {filteredTools.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Keine Tools gefunden
                  </div>
                )}
              </DndContext>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="secondary" className={categoryColors[tool.category]}>
                          {categoryLabels[tool.category]}
                        </Badge>
                        <Badge variant={tool.is_active ? "default" : "secondary"}>
                          {tool.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {tool.slug === 'hmw-fragen' ? (
                          <DropdownMenuItem onClick={() => navigate(`/lms/tools/hmw-generator`)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Generator öffnen
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => navigate(`/admin/lms/toolbox/${tool.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Löschen
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tool löschen?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Möchten Sie "{tool.title}" wirklich löschen?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteTool(tool.id)}>
                                    Löschen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
