-- Bücherschrank am Hirzel: public book list with owner-managed entries

CREATE TABLE public.bookshelf_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  cover_image_url text,
  address text NOT NULL,
  available_from date NOT NULL DEFAULT CURRENT_DATE,
  available_until date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookshelf_books_date_range_check CHECK (
    available_until IS NULL OR available_until >= available_from
  )
);

CREATE INDEX bookshelf_books_user_id_idx ON public.bookshelf_books(user_id);
CREATE INDEX bookshelf_books_available_from_idx ON public.bookshelf_books(available_from);

ALTER TABLE public.bookshelf_books ENABLE ROW LEVEL SECURITY;

-- The library listing is public: anyone can browse the shelf, logged out or in
CREATE POLICY "Anyone can view bookshelf books"
ON public.bookshelf_books FOR SELECT
USING (true);

-- Only logged-in users can place a book in the shelf, and only as themselves
CREATE POLICY "Authenticated users can add own bookshelf books"
ON public.bookshelf_books FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own bookshelf books"
ON public.bookshelf_books FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own bookshelf books"
ON public.bookshelf_books FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_bookshelf_books_updated_at
BEFORE UPDATE ON public.bookshelf_books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for book cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('bookshelf-covers', 'bookshelf-covers', true);

CREATE POLICY "Anyone can view bookshelf covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'bookshelf-covers');

CREATE POLICY "Authenticated users can upload own bookshelf covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bookshelf-covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can update own bookshelf covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bookshelf-covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can delete own bookshelf covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bookshelf-covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
