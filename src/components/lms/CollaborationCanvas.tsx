import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";

interface StickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  author: string;
}

interface CollaborationCanvasProps {
  sessionId: string;
  moduleId: string;
  onUpdate?: (data: any) => void;
}

export const CollaborationCanvas = ({
  sessionId,
  moduleId: _moduleId,
  onUpdate,
}: CollaborationCanvasProps) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();

    const channel = supabase
      .channel(`collaboration-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lms_collaboration_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).session_data) {
            setNotes((payload.new as any).session_data.notes || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadSession = async () => {
    const { data } = await (supabase as any)
      .from("lms_collaboration_sessions")
      .select("session_data")
      .eq("id", sessionId)
      .maybeSingle();

    if (data?.session_data?.notes) {
      setNotes(data.session_data.notes);
    }
  };

  const addNote = async () => {
    if (!newNoteText.trim()) return;

    const newNote: StickyNote = {
      id: crypto.randomUUID(),
      content: newNoteText,
      x: 50,
      y: 50,
      color: "#fef08a",
      author: "User",
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setNewNoteText("");

    await updateSession(updatedNotes);
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    await updateSession(updatedNotes);
  };

  const handleDragStart = (id: string) => {
    setDraggedNote(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNote || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedNotes = notes.map((note) =>
      note.id === draggedNote ? { ...note, x, y } : note
    );

    setNotes(updatedNotes);
    setDraggedNote(null);
    await updateSession(updatedNotes);
  };

  const updateSession = async (updatedNotes: StickyNote[]) => {
    await (supabase as any)
      .from("lms_collaboration_sessions")
      .update({ session_data: { notes: updatedNotes } })
      .eq("id", sessionId);

    onUpdate?.({ notes: updatedNotes });
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Neue Notiz hinzufügen..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addNote()}
        />
        <Button onClick={addNote}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="relative w-full h-[600px] bg-muted rounded-lg border-2 border-dashed"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            draggable
            onDragStart={() => handleDragStart(note.id)}
            className="absolute w-48 p-3 shadow-lg rounded cursor-move"
            style={{
              backgroundColor: note.color,
              left: `${note.x}px`,
              top: `${note.y}px`,
            }}
          >
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-1 right-1 text-destructive hover:bg-destructive/10 rounded p-1"
            >
              <Trash2 className="h-3 w-3" />
            </button>
            <p className="text-sm mt-4 break-words">{note.content}</p>
            <p className="text-xs text-muted-foreground mt-2">{note.author}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
