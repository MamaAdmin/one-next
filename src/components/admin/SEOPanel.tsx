import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText, Hash } from "lucide-react";

interface SEOPanelProps {
  data: {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string[];
    og_image?: string;
    canonical_url?: string;
    robots_meta?: string;
  };
  onChange: (field: string, value: any) => void;
}

export const SEOPanel = ({ data, onChange }: SEOPanelProps) => {
  const [keywords, setKeywords] = useState<string[]>(data.seo_keywords || []);
  const [keywordInput, setKeywordInput] = useState("");

  const titleLength = data.seo_title?.length || 0;
  const descLength = data.seo_description?.length || 0;

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      onChange("seo_keywords", newKeywords);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    onChange("seo_keywords", newKeywords);
  };

  useEffect(() => {
    setKeywords(data.seo_keywords || []);
  }, [data.seo_keywords]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          SEO Optimierung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="seo_title">SEO Titel</Label>
          <Input
            id="seo_title"
            value={data.seo_title || ""}
            onChange={(e) => onChange("seo_title", e.target.value)}
            placeholder="Optimierter Titel für Suchmaschinen"
            maxLength={60}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              Optimal: 50-60 Zeichen
            </span>
            <span className={titleLength > 60 ? "text-destructive" : "text-muted-foreground"}>
              {titleLength}/60
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="seo_description">Meta Beschreibung</Label>
          <Textarea
            id="seo_description"
            value={data.seo_description || ""}
            onChange={(e) => onChange("seo_description", e.target.value)}
            placeholder="Kurze Beschreibung für Suchergebnisse"
            rows={3}
            maxLength={160}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              Optimal: 150-160 Zeichen
            </span>
            <span className={descLength > 160 ? "text-destructive" : "text-muted-foreground"}>
              {descLength}/160
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
            placeholder="Keyword eingeben und Enter drücken"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeKeyword(index)}
              >
                <Hash className="h-3 w-3 mr-1" />
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="og_image">Open Graph Bild URL</Label>
          <Input
            id="og_image"
            value={data.og_image || ""}
            onChange={(e) => onChange("og_image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Optimal: 1200x630 Pixel
          </div>
        </div>

        <div>
          <Label htmlFor="canonical_url">Canonical URL</Label>
          <Input
            id="canonical_url"
            value={data.canonical_url || ""}
            onChange={(e) => onChange("canonical_url", e.target.value)}
            placeholder="https://example.com/page"
          />
        </div>

        <div>
          <Label htmlFor="robots_meta">Robots Meta Tag</Label>
          <Input
            id="robots_meta"
            value={data.robots_meta || "index, follow"}
            onChange={(e) => onChange("robots_meta", e.target.value)}
            placeholder="index, follow"
          />
        </div>

        {data.seo_title && (
          <div className="border-t pt-4">
            <Label className="mb-2 block">Google SERP Vorschau</Label>
            <div className="border rounded p-3 bg-background">
              <div className="text-blue-600 text-lg mb-1 line-clamp-1">
                {data.seo_title}
              </div>
              <div className="text-green-700 text-sm mb-1">
                {data.canonical_url || "https://example.com"}
              </div>
              <div className="text-gray-600 text-sm line-clamp-2">
                {data.seo_description || "Keine Beschreibung vorhanden"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
