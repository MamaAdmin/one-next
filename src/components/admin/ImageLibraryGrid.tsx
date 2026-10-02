import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listLibraryImages, type LibraryImage } from "@/services/ImageLibrary";

const ALL = "__all__";

interface Props {
  onSelect: (image: LibraryImage) => void;
  /** Optional action rendered under each image. */
  renderActions?: (image: LibraryImage) => React.ReactNode;
}

/** Searchable gallery of all generated and uploaded images. */
export function ImageLibraryGrid({ onSelect, renderActions }: Props) {
  const { data = [], isLoading } = useQuery({ queryKey: ["image-library"], queryFn: listLibraryImages });
  const [q, setQ] = useState("");
  const [video, setVideo] = useState(ALL);
  const [style, setStyle] = useState(ALL);

  const videos = useMemo(
    () => [...new Map(data.filter((i) => i.video_id).map((i) => [i.video_id!, i.video_title ?? "Ohne Titel"])).entries()],
    [data],
  );
  const styles = useMemo(() => [...new Set(data.map((i) => i.style).filter(Boolean) as string[])], [data]);

  const filtered = data.filter(
    (i) =>
      (video === ALL || i.video_id === video) &&
      (style === ALL || i.style === style) &&
      (!q.trim() || `${i.prompt ?? ""} ${i.video_title ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Bildbeschreibung oder Video suchen …" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={video} onValueChange={setVideo}>
          <SelectTrigger className="sm:w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alle Videos</SelectItem>
            {videos.map(([id, t]) => <SelectItem key={id} value={id}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alle Stile</SelectItem>
            {styles.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Wird geladen …" : `${filtered.length} von ${data.length} Bildern`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border bg-card">
            <button type="button" className="block w-full" onClick={() => onSelect(img)}>
              <img src={img.url} alt={img.prompt ?? "Bild"} loading="lazy" className="aspect-video w-full object-cover" />
            </button>
            <div className="space-y-1 p-3 text-sm">
              <p className="line-clamp-2">{img.prompt || "Ohne Bildbeschreibung"}</p>
              <p className="text-xs text-muted-foreground">
                {img.source === "upload" ? "Hochgeladen" : img.video_title ?? "Video"}
                {img.scene_index != null ? ` · Szene ${img.scene_index + 1}` : ""} ·{" "}
                {new Date(img.created_at).toLocaleDateString("de-CH")}
              </p>
              {renderActions?.(img)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
