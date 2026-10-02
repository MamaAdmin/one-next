INSERT INTO public.image_library (url, prompt, source, video_id, video_title, scene_index, style, created_at)
SELECT s.elem->>'imageUrl', NULLIF(COALESCE(s.elem->>'imagePrompt', s.elem->>'heading'), ''), 'whiteboard', v.id, v.title, (s.ord - 1)::int, v.style, v.updated_at
FROM public.whiteboard_videos v
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(v.scenes) = 'array' THEN v.scenes ELSE '[]'::jsonb END) WITH ORDINALITY AS s(elem, ord)
WHERE COALESCE(s.elem->>'imageUrl', '') <> ''
ON CONFLICT (url) DO NOTHING;