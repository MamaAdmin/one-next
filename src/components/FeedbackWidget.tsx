import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Bug, Lightbulb, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const CATEGORIES = [
  { value: "bug", label: "Bug melden", icon: Bug, color: "text-red-500" },
  { value: "idea", label: "Idee", icon: Lightbulb, color: "text-yellow-500" },
  { value: "other", label: "Sonstiges", icon: HelpCircle, color: "text-muted-foreground" },
];

const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from("app_feedback" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setFeedbackCount(count || 0);
    })();
  }, [user, open]);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { error } = await (supabase.from("app_feedback" as any) as any).insert({
        user_id: user.id,
        page_url: location.pathname,
        category,
        message: message.trim(),
      });
      if (error) throw error;
      setFeedbackCount((c) => c + 1);
      toast({ title: "Danke!", description: "Dein Feedback wurde gesendet." });
      setMessage("");
      setCategory("bug");
    } catch (err) {
      toast({ title: "Fehler", description: "Feedback konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const THRESHOLD = 10;
  const untilCoupon = THRESHOLD - (feedbackCount % THRESHOLD);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Feedback geben"
      >
        {open ? <X className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="bg-foreground text-background px-5 py-4">
            <h3 className="font-semibold text-base">Hilf uns, besser zu werden!</h3>
            <p className="text-xs opacity-70 mt-0.5">
              Melde Bugs oder teile Ideen – bei {THRESHOLD} hochwertigen Feedbacks erhältst du einen Gutschein.
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all ${
                    category === cat.value
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal truncate max-w-full">
                Seite: {location.pathname}
              </Badge>
            </div>

            <Textarea
              placeholder="Beschreibe was nicht funktioniert oder was du dir wünschst..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {feedbackCount} Feedback{feedbackCount !== 1 ? "s" : ""} gegeben
                {feedbackCount > 0 && feedbackCount % THRESHOLD !== 0 && (
                  <> · noch {untilCoupon} bis Gutschein</>
                )}
              </span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!message.trim() || sending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {sending ? "..." : (<><Send className="h-3.5 w-3.5 mr-1" /> Senden</>)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
