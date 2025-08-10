-- Create helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- historical_elements table
CREATE TABLE IF NOT EXISTS public.historical_elements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT historical_elements_type_check CHECK (type IN ('person','event','document','concept','term'))
);

CREATE TRIGGER trg_historical_elements_updated_at
BEFORE UPDATE ON public.historical_elements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- relationships table
CREATE TABLE IF NOT EXISTS public.relationships (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT relationships_type_check CHECK (type IN ('influenced','created','participated','documented','custom')),
  CONSTRAINT fk_relationships_source
    FOREIGN KEY (source_id) REFERENCES public.historical_elements(id) ON DELETE CASCADE,
  CONSTRAINT fk_relationships_target
    FOREIGN KEY (target_id) REFERENCES public.historical_elements(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_relationships_updated_at
BEFORE UPDATE ON public.relationships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- maps table
CREATE TABLE IF NOT EXISTS public.maps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT,
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_maps_updated_at
BEFORE UPDATE ON public.maps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- map_nodes table
CREATE TABLE IF NOT EXISTS public.map_nodes (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL,
  element_id TEXT,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  layer INTEGER NOT NULL DEFAULT 0,
  opacity DOUBLE PRECISION NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_map_nodes_map
    FOREIGN KEY (map_id) REFERENCES public.maps(id) ON DELETE CASCADE
  -- Note: element_id intentionally left without FK to allow generated nodes not tied to historical_elements
);

CREATE INDEX IF NOT EXISTS idx_map_nodes_map_id ON public.map_nodes(map_id);

CREATE TRIGGER trg_map_nodes_updated_at
BEFORE UPDATE ON public.map_nodes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- map_links table
CREATE TABLE IF NOT EXISTS public.map_links (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL,
  relationship_id TEXT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  layer INTEGER NOT NULL DEFAULT 0,
  opacity DOUBLE PRECISION NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_map_links_map
    FOREIGN KEY (map_id) REFERENCES public.maps(id) ON DELETE CASCADE,
  CONSTRAINT fk_map_links_relationship
    FOREIGN KEY (relationship_id) REFERENCES public.relationships(id) ON DELETE SET NULL,
  CONSTRAINT fk_map_links_source
    FOREIGN KEY (source_id) REFERENCES public.map_nodes(id) ON DELETE CASCADE,
  CONSTRAINT fk_map_links_target
    FOREIGN KEY (target_id) REFERENCES public.map_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_map_links_map_id ON public.map_links(map_id);

CREATE TRIGGER trg_map_links_updated_at
BEFORE UPDATE ON public.map_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- profiles table (used by AuthContext; public for now)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.historical_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Open policies for public prototype (allow anon access)
DO $$ BEGIN
  -- historical_elements policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'historical_elements' AND policyname = 'Allow read to all'
  ) THEN
    CREATE POLICY "Allow read to all"
      ON public.historical_elements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'historical_elements' AND policyname = 'Allow insert to all'
  ) THEN
    CREATE POLICY "Allow insert to all"
      ON public.historical_elements FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'historical_elements' AND policyname = 'Allow update to all'
  ) THEN
    CREATE POLICY "Allow update to all"
      ON public.historical_elements FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'historical_elements' AND policyname = 'Allow delete to all'
  ) THEN
    CREATE POLICY "Allow delete to all"
      ON public.historical_elements FOR DELETE USING (true);
  END IF;

  -- relationships policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'relationships' AND policyname = 'Allow read to all'
  ) THEN
    CREATE POLICY "Allow read to all"
      ON public.relationships FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'relationships' AND policyname = 'Allow insert to all'
  ) THEN
    CREATE POLICY "Allow insert to all"
      ON public.relationships FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'relationships' AND policyname = 'Allow update to all'
  ) THEN
    CREATE POLICY "Allow update to all"
      ON public.relationships FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'relationships' AND policyname = 'Allow delete to all'
  ) THEN
    CREATE POLICY "Allow delete to all"
      ON public.relationships FOR DELETE USING (true);
  END IF;

  -- maps policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maps' AND policyname = 'Allow read to all'
  ) THEN
    CREATE POLICY "Allow read to all"
      ON public.maps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maps' AND policyname = 'Allow insert to all'
  ) THEN
    CREATE POLICY "Allow insert to all"
      ON public.maps FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maps' AND policyname = 'Allow update to all'
  ) THEN
    CREATE POLICY "Allow update to all"
      ON public.maps FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'maps' AND policyname = 'Allow delete to all'
  ) THEN
    CREATE POLICY "Allow delete to all"
      ON public.maps FOR DELETE USING (true);
  END IF;

  -- map_nodes policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_nodes' AND policyname = 'Allow read to all'
  ) THEN
    CREATE POLICY "Allow read to all"
      ON public.map_nodes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_nodes' AND policyname = 'Allow insert to all'
  ) THEN
    CREATE POLICY "Allow insert to all"
      ON public.map_nodes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_nodes' AND policyname = 'Allow update to all'
  ) THEN
    CREATE POLICY "Allow update to all"
      ON public.map_nodes FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_nodes' AND policyname = 'Allow delete to all'
  ) THEN
    CREATE POLICY "Allow delete to all"
      ON public.map_nodes FOR DELETE USING (true);
  END IF;

  -- map_links policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_links' AND policyname = 'Allow read to all'
  ) THEN
    CREATE POLICY "Allow read to all"
      ON public.map_links FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_links' AND policyname = 'Allow insert to all'
  ) THEN
    CREATE POLICY "Allow insert to all"
      ON public.map_links FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_links' AND policyname = 'Allow update to all'
  ) THEN
    CREATE POLICY "Allow update to all"
      ON public.map_links FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'map_links' AND policyname = 'Allow delete to all'
  ) THEN
    CREATE POLICY "Allow delete to all"
      ON public.map_links FOR DELETE USING (true);
  END IF;

  -- profiles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow read to all'
  ) THEN
    CREATE POLICY "Allow read to all"
      ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow insert to all'
  ) THEN
    CREATE POLICY "Allow insert to all"
      ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow update to all'
  ) THEN
    CREATE POLICY "Allow update to all"
      ON public.profiles FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow delete to all'
  ) THEN
    CREATE POLICY "Allow delete to all"
      ON public.profiles FOR DELETE USING (true);
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_relationships_source ON public.relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON public.relationships(target_id);
