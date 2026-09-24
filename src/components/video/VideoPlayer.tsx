import { useRef } from "react";
import { Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { isDirectVideoUrl, toEmbedUrl } from "@/features/video/slots";

interface VideoPlayerProps {
  url?: string | null;
  title?: string;
  /** Text shown when no valid video is available */
  placeholder?: string;
}

/** Renders a 16:9 player for YouTube/Vimeo embeds or direct video files. */
export function VideoPlayer({
  url,
  title = "Video",
  placeholder = "Video folgt in Kürze",
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const raw = (url ?? "").trim();
  const embed = toEmbedUrl(raw);
  const direct = !embed && isDirectVideoUrl(raw);

  const disableYouTubeCaptions = () => {
    if (!embed?.includes("youtube-nocookie.com")) return;

    const turnOff = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "setOption",
          args: ["captions", "track", {}],
        }),
        "https://www.youtube-nocookie.com",
      );
    };

    turnOff();
    window.setTimeout(turnOff, 500);
    window.setTimeout(turnOff, 1500);
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <AspectRatio ratio={16 / 9}>
        {embed ? (
          <iframe
            ref={iframeRef}
            src={embed}
            title={title}
            loading="lazy"
            onLoad={disableYouTubeCaptions}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        ) : direct ? (
          <video src={raw} controls preload="metadata" className="h-full w-full bg-black">
            <track kind="captions" />
          </video>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border">
              <Play className="w-5 h-5" />
            </div>
            <span className="text-sm">{placeholder}</span>
          </div>
        )}
      </AspectRatio>
    </div>
  );
}

export default VideoPlayer;
