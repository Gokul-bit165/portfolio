-- ====================================================================
-- SUPABASE SCHEMA FOR PORTFOLIO SITE & REFINE ADMIN PANEL
-- ====================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    client TEXT,
    year TEXT,
    category TEXT,
    cover_image TEXT,
    stack_tags TEXT[] DEFAULT '{}',
    stats JSONB DEFAULT '[]'::jsonb,
    github_url TEXT,
    live_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'video_embed')),
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialty TEXT,
    bio TEXT,
    avatar_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    recent_commits JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Automatically Update updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- PROJECTS
-- Public anon: SELECT published projects only
CREATE POLICY "Public anon read published projects"
    ON public.projects FOR SELECT
    TO anon
    USING (is_published = true);

-- Authenticated admin: Full access (SELECT all, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin full access projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- PROJECT MEDIA
-- Public anon: SELECT media for published projects
CREATE POLICY "Public anon read published project media"
    ON public.project_media FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_media.project_id
            AND projects.is_published = true
        )
    );

-- Authenticated admin: Full access
CREATE POLICY "Admin full access project_media"
    ON public.project_media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- TEAM MEMBERS
-- Public anon: SELECT published team members only
CREATE POLICY "Public anon read published team members"
    ON public.team_members FOR SELECT
    TO anon
    USING (is_published = true);

-- Authenticated admin: Full access
CREATE POLICY "Admin full access team_members"
    ON public.team_members FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- SITE SETTINGS
-- Public anon: SELECT all settings
CREATE POLICY "Public anon read site settings"
    ON public.site_settings FOR SELECT
    TO anon
    USING (true);

-- Authenticated admin: Full access
CREATE POLICY "Admin full access site_settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Storage Bucket & Policies Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public access to download/view files in portfolio-assets
CREATE POLICY "Public read storage portfolio-assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'portfolio-assets');

-- Admin full access to upload/update/delete in portfolio-assets
CREATE POLICY "Admin write storage portfolio-assets"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'portfolio-assets')
    WITH CHECK (bucket_id = 'portfolio-assets');

-- 6. Initial Seed Data
INSERT INTO public.site_settings (key, value) VALUES
('hero_headline', '"We Ship Software, Not Decks"'::jsonb),
('hero_subhead', '"5 friends, no suits. Five friends coding, building, and launching products under pressure."'::jsonb),
('availability_status', '"Available for Q3/Q4 builds"'::jsonb),
('contact_email', '"hello@agency.dev"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Sample Project
INSERT INTO public.projects (
    id, title, slug, tagline, description, client, year, category, cover_image, stack_tags, stats, github_url, live_url, is_published, sort_order
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'AeroTwin',
    'aerotwin',
    'Autonomous Drone Fleet Digital Twin Platform',
    'Real-time telemetry processing, 3D spatial simulation, and edge ML inference for autonomous UAV monitoring.',
    'SkyBound Aero',
    '2026',
    'AI & Robotics',
    'assets/robot_skectch/robot_smileandtypeonlaptop.png',
    ARRAY['Rust', 'WebGPU', 'Python', 'Kafka', 'React'],
    '[{"label": "Telemetry Ingestion", "value": "120k msg/sec"}, {"label": "Latency", "value": "<18ms"}, {"label": "Fleet Size", "value": "500+ Drones"}]'::jsonb,
    'https://github.com',
    'https://aerotwin.example.com',
    true,
    1
) ON CONFLICT (slug) DO NOTHING;

-- Seed Sample Project Media
INSERT INTO public.project_media (project_id, media_type, url, caption, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'image', 'assets/robot_skectch/robot_smileandtypeonlaptop.png', 'Primary Control Dashboard', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'image', 'assets/robot_skectch/robot_seeblueprintandsmile.png', 'Live Telemetry HUD', 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'video_embed', 'https://www.youtube.com/embed/LXb3EKWsInQ', 'System Flight Test Demo', 3)
ON CONFLICT DO NOTHING;



-- Seed Team Members
INSERT INTO public.team_members (name, role, specialty, bio, avatar_url, github_url, linkedin_url, twitter_url, recent_commits, is_published, sort_order) VALUES
('Gokul', 'Dev Lead', 'Compilers & Systems', 'Systems architecture enthusiast and team lead. Loves low-level performance tuning.', 'assets/robot_skectch/robot_smileandtypeonlaptop.png', 'https://github.com', 'https://linkedin.com', 'https://twitter.com', '[{"hash": "a3f21c8", "msg": "feat: CRDT consensus engine"}, {"hash": "b7d90e3", "msg": "fix: UAV sync race condition"}]'::jsonb, true, 1),
('Alex', 'AI Architect', 'PyTorch & Edge ML', 'Specializes in computer vision and real-time spatial object detection.', 'assets/robot_skectch/robot_coding_neon.png', 'https://github.com', 'https://linkedin.com', 'https://twitter.com', '[{"hash": "f90a1e2", "msg": "perf: INT8 quantization on Jetson"}]'::jsonb, true, 2)
ON CONFLICT DO NOTHING;
