import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoting } from "@/hooks/useVoting";
import { Circle, CheckCircle } from "lucide-react";

interface VotingBoardProps {
  sessionId: string;
  participantId: string;
  items: Array<{ id: string; title: string; description?: string }>;
  maxVotes?: number;
}

export const VotingBoard = ({
  sessionId,
  participantId,
  items,
  maxVotes = 3,
}: VotingBoardProps) => {
  const { castVote, getVoteCount, getMyVotes, loading } = useVoting(
    sessionId,
    participantId
  );

  const myVotes = getMyVotes();
  const remainingVotes = maxVotes - myVotes.length;

  const handleVote = async (itemId: string) => {
    if (remainingVotes <= 0) return;
    try {
      await castVote(itemId, "dot");
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  const hasVotedFor = (itemId: string) => {
    return myVotes.some((v) => (v as any).target_id === itemId);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Lade Voting-Session...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dot Voting</h3>
        <Badge variant={remainingVotes > 0 ? "default" : "secondary"}>
          {remainingVotes} von {maxVotes} Votes übrig
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const voteCount = getVoteCount(item.id);
          const voted = hasVotedFor(item.id);

          return (
            <Card
              key={item.id}
              className={`p-4 transition-all ${
                voted ? "border-primary border-2" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{item.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{voteCount} Votes</Badge>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {item.description}
                </p>
              )}

              <Button
                variant={voted ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(item.id)}
                disabled={remainingVotes <= 0 && !voted}
                className="w-full"
              >
                {voted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Voted
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    Vote
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};
