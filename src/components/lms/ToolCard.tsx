import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Code, FileText } from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tool_type: 'external' | 'embedded' | 'template';
  external_url: string | null;
  embed_code: string | null;
  template_data: any;
  thumbnail_url: string | null;
}

interface ToolCardProps {
  tool: Tool;
}

const categoryColors: Record<string, string> = {
  understand: "bg-blue-100 text-blue-800",
  ideate: "bg-purple-100 text-purple-800",
  decide: "bg-orange-100 text-orange-800",
  prototype: "bg-green-100 text-green-800",
  validate: "bg-red-100 text-red-800",
  retrospect: "bg-gray-100 text-gray-800",
};

const toolTypeIcons: Record<string, any> = {
  external: ExternalLink,
  embedded: Code,
  template: FileText,
};

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = toolTypeIcons[tool.tool_type] || FileText;

  const handleOpenTool = () => {
    if (tool.tool_type === 'external' && tool.external_url) {
      window.open(tool.external_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="overflow-hidden">
      {tool.thumbnail_url && (
        <div className="aspect-video bg-muted">
          <img
            src={tool.thumbnail_url}
            alt={tool.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {tool.title}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className={categoryColors[tool.category]}>
                {tool.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tool.description && (
          <CardDescription>{tool.description}</CardDescription>
        )}
        
        {tool.tool_type === 'external' && tool.external_url && (
          <Button onClick={handleOpenTool} className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Tool öffnen
          </Button>
        )}
        
        {tool.tool_type === 'embedded' && tool.embed_code && (
          <div 
            className="border rounded-lg p-4 bg-muted"
            dangerouslySetInnerHTML={{ __html: tool.embed_code }}
          />
        )}
        
        {tool.tool_type === 'template' && tool.template_data && (
          <div className="border rounded-lg p-4 bg-muted">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(tool.template_data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
