-- ==========================================
-- SCRIPT D'INITIALISATION PILOTO SUPABASE
-- ==========================================

-- 1. Création de la table PROFILS (Pour les crédits et infos utilisateurs)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  avatar_url text,
  credits integer DEFAULT 5, -- 5 crédits offerts à l'inscription
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Active la sécurité (Row Level Security) sur la table profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Autorise un utilisateur à voir et modifier uniquement son propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- 2. Création de la table HISTORIQUE VIDÉOS
CREATE TABLE public.video_history (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt text,
  video_url text,
  thumbnail_url text,
  duration integer, -- Durée de la vidéo en secondes
  status text DEFAULT 'completed', -- 'pending', 'generating', 'completed', 'failed'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Active la sécurité sur l'historique
ALTER TABLE public.video_history ENABLE ROW LEVEL SECURITY;

-- Autorise un utilisateur à gérer uniquement ses propres vidéos
CREATE POLICY "Les utilisateurs gèrent leurs propres vidéos" ON public.video_history
  FOR ALL USING (auth.uid() = user_id);


-- 3. Trigger (Déclencheur) pour créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Création du Bucket de Stockage (Pour les photos, audios et vidéos générées)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rogen_media', 'rogen_media', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de sécurité pour le stockage (Autoriser l'accès public en lecture, et l'upload pour les utilisateurs connectés)
CREATE POLICY "Lecture publique des médias"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'rogen_media' );

CREATE POLICY "Les utilisateurs connectés peuvent uploader"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'rogen_media' AND auth.role() = 'authenticated' );
