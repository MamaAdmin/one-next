import { useState } from "react";
import { Plus, MapPin, Smile, Meh, Frown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Touchpoint {
  id: string;
  label: string;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface JourneyMapProps {
  touchpoints: Touchpoint[];
  onChange: (touchpoints: Touchpoint[]) => void;
}

export const JourneyMap = ({ touchpoints, onChange }: JourneyMapProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addTouchpoint = () => {
    const newTouchpoint: Touchpoint = {
      id: Date.now().toString(),
      label: `Touchpoint ${touchpoints.length + 1}`,
      description: "",
      sentiment: "neutral",
    };
    onChange([...touchpoints, newTouchpoint]);
    setEditingId(newTouchpoint.id);
  };

  const updateTouchpoint = (id: string, updates: Partial<Touchpoint>) => {
    onChange(
      touchpoints.map((tp) => (tp.id === id ? { ...tp, ...updates } : tp))
    );
  };

  const removeTouchpoint = (id: string) => {
    onChange(touchpoints.filter((tp) => tp.id !== id));
  };

  const sentimentIcons = {
    positive: { icon: Smile, color: "text-green-500", bg: "bg-green-500/10" },
    neutral: { icon: Meh, color: "text-amber-500", bg: "bg-amber-500/10" },
    negative: { icon: Frown, color: "text-red-500", bg: "bg-red-500/10" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Customer Journey Map</h3>
              <p className="text-sm text-muted-foreground">
                Dokumentiere die wichtigsten Berührungspunkte
              </p>
            </div>
          </div>
          <Button onClick={addTouchpoint} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Touchpoint
          </Button>
        </div>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {touchpoints.length > 0 && (
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        )}

        <div className="space-y-6">
          {touchpoints.map((touchpoint, index) => {
            const sentiment = sentimentIcons[touchpoint.sentiment];
            const SentimentIcon = sentiment.icon;
            const isEditing = editingId === touchpoint.id;

            return (
              <div key={touchpoint.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-6 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background ${
                    sentiment.bg
                  } ${sentiment.color}`}
                />

                {/* Touchpoint Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${sentiment.bg}`}>
                          <SentimentIcon className={`h-5 w-5 ${sentiment.color}`} />
                        </div>
                        {isEditing ? (
                          <Input
                            value={touchpoint.label}
                            onChange={(e) =>
                              updateTouchpoint(touchpoint.id, { label: e.target.value })
                            }
                            className="font-semibold"
                          />
                        ) : (
                          <h4 className="font-semibold">{touchpoint.label}</h4>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {isEditing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Fertig
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(touchpoint.id)}
                          >
                            Bearbeiten
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Beschreibung</Label>
                          <Textarea
                            value={touchpoint.description}
                            onChange={(e) =>
                              updateTouchpoint(touchpoint.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Was passiert an diesem Touchpoint?"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>User Sentiment</Label>
                          <div className="flex gap-2 mt-2">
                            {(["positive", "neutral", "negative"] as const).map((sent) => {
                              const Icon = sentimentIcons[sent].icon;
                              return (
                                <Button
                                  key={sent}
                                  variant={
                                    touchpoint.sentiment === sent ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    updateTouchpoint(touchpoint.id, { sentiment: sent })
                                  }
                                >
                                  <Icon className="h-4 w-4" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTouchpoint(touchpoint.id)}
                        >
                          Löschen
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {touchpoint.description || "Noch keine Beschreibung"}
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {touchpoints.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Noch keine Touchpoints erfasst
          </p>
          <Button onClick={addTouchpoint} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ersten Touchpoint hinzufügen
          </Button>
        </Card>
      )}
    </div>
  );
};
