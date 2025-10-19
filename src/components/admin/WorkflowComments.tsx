import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
}

interface WorkflowCommentsProps {
  contentType: string;
  contentId: string;
}

export const WorkflowComments = ({
  contentType,
  contentId,
}: WorkflowCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("workflow_comments")
        .select("*")
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("workflow_comments")
        .insert({
          content_type: contentType,
          content_id: contentId,
          user_id: user?.id,
          comment: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
      
      toast({
        title: "Erfolg",
        description: "Kommentar hinzugefügt",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contentType, contentId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        Kommentare ({comments.length})
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Kommentar hinzufügen..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button
          onClick={addComment}
          disabled={loading || !newComment.trim()}
          size="sm"
        >
          Kommentar hinzufügen
        </Button>
      </div>

      {comments.length > 0 && (
        <ScrollArea className="h-[200px] border rounded-md p-2">
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <div className="font-medium">
                  {format(new Date(comment.created_at), "PPp", { locale: de })}
                </div>
                <div className="text-muted-foreground mt-1">{comment.comment}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
