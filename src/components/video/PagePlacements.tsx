import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVideoPlacements, type PlacementPosition } from "@/hooks/useVideoPlacements";
import { VideoPlayer } from "@/components/video/VideoPlayer";

/** Renders videos assigned to custom placements of the current page. */
export function PagePlacements({ position }: { position: PlacementPosition }) {
  const { pathname } = useLocation();
  const { placements } = useVideoPlacements();
  const keys = placements
    .filter((p) => p.page_path === pathname && p.position === position)
    .map((p) => p.slot_key);

  const { data: videos = [] } = useQuery({
    queryKey: ["video-slot", "page", keys.join(",")],
    enabled: keys.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_library")
        .select("id,title,video_url,slot_key")
        .in("slot_key", keys);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!keys.length || !videos.length) return null;
  const ordered = keys.map((k) => videos.find((v) => v.slot_key === k)).filter(Boolean);

  return (
    <section className={position === "top" ? "bg-background pt-28 pb-8" : "bg-background py-12"}>
      <div className="container mx-auto max-w-4xl space-y-8 px-6">
        {ordered.map((v) => (
          <VideoPlayer key={v!.id} url={v!.video_url} title={v!.title} />
        ))}
      </div>
    </section>
  );
}
