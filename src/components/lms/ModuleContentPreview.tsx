import DOMPurify from "dompurify";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Resource {
  title: string;
  url: string;
}

interface Tool {
  id: string;
  title: string;
  description: string | null;
  tool_type: string;
  external_url: string | null;
}

interface ModuleContentPreviewProps {
  contentText?: string;
  contentVideoUrl?: string;
  toolRecommendation?: string;
  resources?: Resource[];
  tools?: Tool[];
  tags?: string[];
  author?: string;
  prerequisites?: string[];
}

export const ModuleContentPreview = ({
  contentText,
  contentVideoUrl,
  toolRecommendation,
  resources = [],
  tools = [],
  tags = [],
  author,
  prerequisites = []
}: ModuleContentPreviewProps) => {
  const renderVideo = () => {
    if (!contentVideoUrl) return null;

    // YouTube embed
    if (contentVideoUrl.includes("youtube.com") || contentVideoUrl.includes("youtu.be")) {
      let videoId = "";
      if (contentVideoUrl.includes("youtu.be/")) {
        videoId = contentVideoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (contentVideoUrl.includes("watch?v=")) {
        videoId = contentVideoUrl.split("watch?v=")[1]?.split("&")[0] || "";
      }
      
      if (videoId) {
        return (
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Vimeo embed
    if (contentVideoUrl.includes("vimeo.com")) {
      const videoId = contentVideoUrl.split("vimeo.com/")[1]?.split("?")[0];
      if (videoId) {
        return (
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://player.vimeo.com/video/${videoId}`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Generic video link
    return (
      <a
        href={contentVideoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Video ansehen
      </a>
    );
  };

  return (
    <div className="space-y-6">
      {/* Video */}
      {contentVideoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Video</CardTitle>
          </CardHeader>
          <CardContent>
            {renderVideo()}
          </CardContent>
        </Card>
      )}

      {/* Text Content */}
      {contentText && (
        <Card>
          <CardHeader>
            <CardTitle>Inhalt</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(contentText)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tool Recommendation */}
      {toolRecommendation && (
        <Card className="bg-accent/50">
          <CardHeader>
            <CardTitle>Tool-Empfehlung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{toolRecommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verfügbare Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{tool.title}</h4>
                    {tool.description && (
                      <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                    )}
                    <Badge variant="outline" className="mt-2">{tool.tool_type}</Badge>
                  </div>
                  {tool.external_url && (
                    <a
                      href={tool.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Ressourcen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {resource.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {(tags.length > 0 || author || prerequisites.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Weitere Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {author && (
              <div>
                <h4 className="text-sm font-medium mb-2">Autor</h4>
                <p className="text-sm text-muted-foreground">{author}</p>
              </div>
            )}
            
            {prerequisites.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Voraussetzungen</h4>
                <ul className="list-disc list-inside space-y-1">
                  {prerequisites.map((prereq, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
