
- Custom video placements live in `video_placements` and render via `PagePlacements` inside Navigation (top) and Footer (bottom); built-in slots stay in `features/video/slots.ts` — why: admins add placements on any page without code changes.
- Every generated or uploaded whiteboard image is recorded in `image_library` (client upsert by url) — why: reusable reference image library.
