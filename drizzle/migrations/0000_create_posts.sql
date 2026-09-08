CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_username text NOT NULL DEFAULT 'kurbati.creator',
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  post_kind text NOT NULL DEFAULT 'post',
  filter text NOT NULL DEFAULT 'Normal',
  music text,
  caption text NOT NULL DEFAULT '',
  poll_question text,
  poll_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  location text,
  tagged_people jsonb NOT NULL DEFAULT '[]'::jsonb,
  audience text NOT NULL DEFAULT 'everyone',
  custom_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  hide_counts boolean NOT NULL DEFAULT false,
  comments_off boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create posts"
  ON public.posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
