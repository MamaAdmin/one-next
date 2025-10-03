import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Sketch {
  id: string;
  title: string;
  description: string;
  votes: number;
}

interface HeatmapVotingProps {
  sketches: Sketch[];
  userVotes: number;
  maxVotes: number;
  onVote: (sketchId: string) => void;
}

export const HeatmapVoting = ({
  sketches,
  userVotes,
  maxVotes,
  onVote,
}: HeatmapVotingProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const votesRemaining = maxVotes - userVotes;
  const topSketch = sketches.reduce((prev, current) =>
    current.votes > prev.votes ? current : prev
  );

  return (
    <div className="space-y-6">
      {/* Voting Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Heatmap Voting</h3>
              <p className="text-sm text-muted-foreground">
                Vergib deine {maxVotes} Stimmen auf die besten Ideen
              </p>
            </div>
          </div>
          <Badge
            variant={votesRemaining > 0 ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {votesRemaining} Stimmen übrig
          </Badge>
        </div>
      </Card>

      {/* Sketches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sketches.map((sketch) => {
          const isTopVoted = sketch.id === topSketch.id && topSketch.votes > 0;
          const votePercentage =
            topSketch.votes > 0 ? (sketch.votes / topSketch.votes) * 100 : 0;

          return (
            <Card
              key={sketch.id}
              className={`p-6 transition-all cursor-pointer relative overflow-hidden ${
                hoveredId === sketch.id ? "ring-2 ring-primary shadow-lg" : ""
              } ${isTopVoted ? "ring-2 ring-amber-500" : ""}`}
              onMouseEnter={() => setHoveredId(sketch.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Vote Heatmap Background */}
              {sketch.votes > 0 && (
                <div
                  className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"
                  style={{
                    opacity: votePercentage / 100,
                  }}
                />
              )}

              <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold flex-1">{sketch.title}</h4>
                  {isTopVoted && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                      Top
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sketch.description}
                </p>

                {/* Voting Area */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: sketch.votes }).map((_, i) => (
                        <Heart
                          key={i}
                          className="h-4 w-4 text-primary fill-primary"
                        />
                      ))}
                      {sketch.votes === 0 && (
                        <span className="text-sm text-muted-foreground">
                          Keine Stimmen
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onVote(sketch.id)}
                      disabled={votesRemaining === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Vote
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Results Summary */}
      {userVotes === maxVotes && (
        <Card className="p-4 bg-primary/5">
          <div className="text-center">
            <p className="font-semibold">Alle Stimmen vergeben! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">
              Top-Idee: <span className="font-medium">{topSketch.title}</span> mit{" "}
              {topSketch.votes} Stimmen
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
