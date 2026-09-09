-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text NOT NULL DEFAULT '',
  is_private boolean NOT NULL DEFAULT false,
  hide_counts boolean NOT NULL DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are readable by everyone"
  ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users delete own profile"
  ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- POSTS: link to real users
ALTER TABLE public.posts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX posts_user_id_idx ON public.posts (user_id);
CREATE INDEX posts_created_at_idx ON public.posts (created_at DESC);

DROP POLICY IF EXISTS "Anyone can create posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
REVOKE INSERT ON public.posts FROM anon;

CREATE POLICY "Public posts readable by everyone"
  ON public.posts FOR SELECT TO anon, authenticated
  USING (audience = 'everyone');
CREATE POLICY "Signed in users read shared posts"
  ON public.posts FOR SELECT TO authenticated
  USING (audience IN ('everyone', 'followers', 'close_friends', 'custom'));
CREATE POLICY "Owners read own posts"
  ON public.posts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own posts"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts"
  ON public.posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own posts"
  ON public.posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- STORIES
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_username text NOT NULL DEFAULT '',
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text NOT NULL DEFAULT '',
  filter text NOT NULL DEFAULT 'Normal',
  music text,
  audience text NOT NULL DEFAULT 'everyone',
  custom_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  hide_counts boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours'
);

GRANT SELECT ON public.stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public stories readable by everyone"
  ON public.stories FOR SELECT TO anon, authenticated
  USING (audience = 'everyone' AND expires_at > now());
CREATE POLICY "Signed in users read active stories"
  ON public.stories FOR SELECT TO authenticated
  USING (expires_at > now());
CREATE POLICY "Owners read own stories"
  ON public.stories FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own stories"
  ON public.stories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stories"
  ON public.stories FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own stories"
  ON public.stories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
