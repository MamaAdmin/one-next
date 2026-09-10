import whiteboard from "@/assets/styles/whiteboard.jpg";
import flat2d from "@/assets/styles/flat_2d.jpg";
import character2d from "@/assets/styles/character_2d.jpg";
import motionGraphics from "@/assets/styles/motion_graphics.jpg";
import infografik from "@/assets/styles/infografik.jpg";
import screencast from "@/assets/styles/screencast.jpg";
import screencastPlus from "@/assets/styles/screencast_plus.jpg";
import isometric3d from "@/assets/styles/isometric_3d.jpg";
import kineticTypo from "@/assets/styles/kinetic_typo.jpg";
import avatar from "@/assets/styles/avatar.jpg";
import mixedMedia from "@/assets/styles/mixed_media.jpg";
import liveAction from "@/assets/styles/live_action.jpg";

export const STYLE_THUMBS: Record<string, string> = {
  whiteboard,
  flat_2d: flat2d,
  character_2d: character2d,
  motion_graphics: motionGraphics,
  infografik,
  screencast,
  screencast_plus: screencastPlus,
  isometric_3d: isometric3d,
  kinetic_typo: kineticTypo,
  avatar,
  mixed_media: mixedMedia,
  live_action: liveAction,
};

export const thumbFor = (value: string): string => STYLE_THUMBS[value] ?? whiteboard;

/** Extrahiert die YouTube-Video-ID aus einer URL, sonst null. */
export const youtubeId = (url: string): string | null => {
  const match =
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/\/embed\/([\w-]{11})/);
  return match ? match[1] : null;
};
