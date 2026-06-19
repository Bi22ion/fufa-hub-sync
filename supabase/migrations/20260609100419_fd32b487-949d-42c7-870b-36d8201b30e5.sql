
-- =========== ROLES ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========== CMS ===========
-- site_settings: single-row key/value JSON store
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- competitions
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1E40C8',
  description TEXT,
  season TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.competitions TO anon, authenticated;
GRANT ALL ON public.competitions TO service_role;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitions public read" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Admins manage competitions" ON public.competitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_competitions_upd BEFORE UPDATE ON public.competitions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_slug TEXT NOT NULL,
  home TEXT NOT NULL,
  away TEXT NOT NULL,
  kickoff TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.matches TO anon, authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches public read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_matches_upd BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- live_streams (admin/scheduled sources + always-on auto sources)
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'youtube_live',
  url TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_fallback BOOLEAN NOT NULL DEFAULT FALSE,
  is_auto BOOLEAN NOT NULL DEFAULT FALSE, -- always-on 24/7 sources
  category TEXT,                          -- e.g. "UPL", "FUFA", "Global"
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.live_streams TO anon, authenticated;
GRANT ALL ON public.live_streams TO service_role;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Streams public read" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Admins manage streams" ON public.live_streams FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_streams_upd BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- programs (schedule)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  competition_slug TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'Highlights',
  thumbnail TEXT,
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE SET NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs public read" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_programs_upd BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_programs_window ON public.programs (start_time, end_time);

-- videos
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  competition_slug TEXT,
  thumbnail TEXT,
  youtube_id TEXT NOT NULL,
  duration TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos public read" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_videos_upd BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- news
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  hero TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon, authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News public read" ON public.news FOR SELECT USING (true);
CREATE POLICY "Admins manage news" ON public.news FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_news_upd BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ticker headlines
CREATE TABLE public.ticker_headlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ticker_headlines TO anon, authenticated;
GRANT ALL ON public.ticker_headlines TO service_role;
ALTER TABLE public.ticker_headlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticker public read" ON public.ticker_headlines FOR SELECT USING (true);
CREATE POLICY "Admins manage ticker" ON public.ticker_headlines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== SEED ===========
INSERT INTO public.competitions (slug, name, short, color, description, season, sort_order) VALUES
  ('uganda-premier-league','StarTimes Uganda Premier League','UPL','#1E40C8','Uganda''s top-flight football league.','2025/2026',1),
  ('stanbic-uganda-cup','Stanbic Uganda Cup','Cup','#FFCC00','The premier national knock-out competition.','2025/2026',2),
  ('cecafa','CECAFA','CECAFA','#E30613','Council for East and Central Africa Football Associations.','2025/2026',3),
  ('fufa-juniors-league','FUFA Juniors League','Juniors','#1E40C8','Developing the next generation of Cranes.','2025/2026',4),
  ('fufa-women-super-league','FUFA Women Super League','Women','#E30613','Top tier of women''s football in Uganda.','2025/2026',5),
  ('fufa-big-league','FUFA Big League','Big League','#FFCC00','Second tier feeding the Premier League.','2025/2026',6),
  ('beach-soccer','Beach Soccer Uganda','Beach','#1E40C8','Sand, sun and Sand Cranes action.','2025/2026',7),
  ('the-fufa-drum','The FUFA Drum','Drum','#E30613','Regional pride competition across Uganda.','2025/2026',8);

INSERT INTO public.live_streams (label, source_type, url, priority, is_active, is_fallback, is_auto, category) VALUES
  ('FUFA TV Official','youtube_live','https://www.youtube.com/embed/live_stream?channel=UCxq0bb5HRJxRJ7g5HZqU9wA&autoplay=1',1,TRUE,FALSE,TRUE,'FUFA'),
  ('Uganda Premier League Live','youtube_live','https://www.youtube.com/embed/live_stream?channel=UCm6jBpJWGmuKicHTYbsMm2g&autoplay=1',2,TRUE,FALSE,TRUE,'UPL'),
  ('CAF TV','youtube_live','https://www.youtube.com/embed/live_stream?channel=UCDqLwlGyAaczL0DXjQyqkAg&autoplay=1',3,TRUE,FALSE,TRUE,'Global'),
  ('Sports24 Live','youtube_live','https://www.youtube.com/embed/live_stream?channel=UCwGNqGoEcJq3O5_05Sk5KIw&autoplay=1',4,TRUE,FALSE,TRUE,'Global'),
  ('beIN SPORTS Highlights','youtube_live','https://www.youtube.com/embed/live_stream?channel=UCytcfwvDqkdQ8GjW8XaNNMQ&autoplay=1',5,TRUE,FALSE,TRUE,'Global'),
  ('Placeholder Stream (replace via gatekeeper)','youtube_live','https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1',8,TRUE,FALSE,TRUE,'Placeholder'),
  ('FUFA Highlights Loop','youtube_live','https://www.youtube.com/embed/videoseries?list=PLwI-aiLNV6IIE9w8gJ8ZcjUiHpqMt4ZIz&autoplay=1&loop=1',99,TRUE,TRUE,FALSE,'Fallback');

INSERT INTO public.matches (competition_slug, home, away, kickoff, venue, status, home_score, away_score) VALUES
  ('uganda-premier-league','KCCA FC','Vipers SC', now() - interval '30 minutes','Lugogo','live',1,1),
  ('uganda-premier-league','SC Villa','URA FC', now() + interval '90 minutes','Mandela National Stadium','scheduled',0,0),
  ('stanbic-uganda-cup','Express FC','BUL FC', now() + interval '4 hours','Wankulukuku','scheduled',0,0),
  ('fufa-women-super-league','Kampala Queens','She Corporate', now() - interval '2 hours','FUFA Technical Centre','full_time',2,0),
  ('cecafa','Uganda Cranes','Kenya', now() + interval '1 day','Mandela National Stadium','scheduled',0,0),
  ('fufa-juniors-league','Proline Academy','Kataka FC', now() + interval '6 hours','Kavumba','scheduled',0,0);

INSERT INTO public.programs (title, competition_slug, start_time, end_time, type, thumbnail) VALUES
  ('FUFA Football Today', NULL, now() - interval '60 minutes', now() - interval '30 minutes','News','https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&q=80'),
  ('KCCA vs Vipers — LIVE','uganda-premier-league', now() - interval '30 minutes', now() + interval '75 minutes','Live Match','https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80'),
  ('Post-Match Press Conference', NULL, now() + interval '75 minutes', now() + interval '105 minutes','Press Conference','https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80'),
  ('SC Villa vs URA — LIVE','uganda-premier-league', now() + interval '105 minutes', now() + interval '210 minutes','Live Match','https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80'),
  ('Women Super League Highlights','fufa-women-super-league', now() + interval '210 minutes', now() + interval '270 minutes','Highlights','https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80'),
  ('FUFA Juniors Showcase','fufa-juniors-league', now() + interval '270 minutes', now() + interval '330 minutes','Highlights','https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80'),
  ('The FUFA Drum Replay','the-fufa-drum', now() + interval '330 minutes', now() + interval '420 minutes','Replay','https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80');

INSERT INTO public.videos (title, competition_slug, thumbnail, youtube_id, duration, sort_order) VALUES
  ('KCCA vs Vipers — Match Highlights','uganda-premier-league','https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80','dQw4w9WgXcQ','8:42',1),
  ('Uganda Cranes Top 10 Goals 2025','cecafa','https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80','dQw4w9WgXcQ','12:18',2),
  ('Stanbic Uganda Cup Final Recap','stanbic-uganda-cup','https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80','dQw4w9WgXcQ','15:03',3),
  ('Women''s Super League Round Up','fufa-women-super-league','https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80','dQw4w9WgXcQ','6:21',4),
  ('FUFA Drum Regional Showdown','the-fufa-drum','https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80','dQw4w9WgXcQ','10:55',5),
  ('Beach Soccer — Sand Cranes vs Tanzania','beach-soccer','https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80','dQw4w9WgXcQ','9:14',6);

INSERT INTO public.news (slug, title, excerpt, body, hero) VALUES
  ('cranes-name-squad','Uganda Cranes name 26-man squad for CECAFA','Coach Paul Put has confirmed the final list ahead of the regional tournament.','Full squad announcement with debutants and returning veterans...','https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?w=1200&q=80'),
  ('upl-fixtures-released','StarTimes UPL releases Match Day 12 fixtures','Big derby weekend headlined by KCCA vs SC Villa.','Complete Match Day 12 schedule and broadcast partners...','https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&q=80'),
  ('women-league-expansion','FUFA confirms Women Super League expansion','Two new clubs added to the top flight from next season.','Federation outlines criteria and development pathway...','https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80');

INSERT INTO public.ticker_headlines (text, sort_order) VALUES
  ('🔴 LIVE: KCCA 1-1 Vipers — second half underway at Lugogo',1),
  ('📅 SC Villa host URA FC tonight at Mandela National Stadium',2),
  ('🏆 Stanbic Uganda Cup quarter-finals draw set for Friday',3),
  ('⚽ Cranes squad announced for CECAFA — 26 players named',4),
  ('🎯 Women Super League expands to 12 clubs next season',5),
  ('📺 FUFA TV broadcasting all UPL matches this weekend',6);

INSERT INTO public.site_settings (key, value) VALUES
  ('brand', '{"name":"FUFA TV","tagline":"Uganda''s Home of Football, Live Anytime","primary":"#0A1A4F","accent":"#FFCC00","red":"#E30613"}'::jsonb),
  ('hero', '{"headline":"Watch Live Ugandan Football, 24/7","sub":"UPL, Stanbic Uganda Cup, CECAFA, Women & Junior football — anytime, anywhere."}'::jsonb),
  ('about', '{"body":"FUFA TV is the official broadcast home of the Federation of Uganda Football Associations, bringing fans every match, highlight and story across Ugandan football."}'::jsonb),
  ('contact', '{"email":"info@fufa.co.ug","phone":"+256 414 000 000","address":"FUFA House, Mengo, Kampala"}'::jsonb);
