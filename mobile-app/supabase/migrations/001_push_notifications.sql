-- ============================================================
-- Migration : Système de notifications push — Biblio Haïti
-- ============================================================

-- Table pour stocker les tokens push Expo des utilisateurs
CREATE TABLE IF NOT EXISTS push_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  platform      TEXT CHECK (platform IN ('ios', 'android', 'web')) DEFAULT 'android',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id   ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_is_active ON push_tokens(is_active);

-- Table pour l'historique des notifications envoyées
CREATE TABLE IF NOT EXISTS notification_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,          -- 'new_book' | 'reading_reminder' | 'quiz_ready'
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,
  recipients  INTEGER NOT NULL DEFAULT 0,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(type);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON notification_log(sent_at DESC);

-- Table pour les préférences de notification par utilisateur
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  new_books             BOOLEAN NOT NULL DEFAULT true,
  reading_reminders     BOOLEAN NOT NULL DEFAULT false,
  quiz_available        BOOLEAN NOT NULL DEFAULT true,
  reminder_hour         SMALLINT NOT NULL DEFAULT 20 CHECK (reminder_hour BETWEEN 0 AND 23),
  reminder_minute       SMALLINT NOT NULL DEFAULT 0  CHECK (reminder_minute BETWEEN 0 AND 59),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE push_tokens             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : push_tokens
CREATE POLICY "Users manage own tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can read all tokens"
  ON push_tokens FOR SELECT
  USING (auth.role() = 'service_role');

-- Politiques RLS : notification_log (lecture seule pour admins)
CREATE POLICY "Admins read notification log"
  ON notification_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS : notification_preferences
CREATE POLICY "Users manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger auto-update de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Webhook trigger : appeler notify-new-book quand un livre est inséré
-- (configurer le webhook dans le dashboard Supabase → Database → Webhooks)
-- URL: https://<project-ref>.supabase.co/functions/v1/notify-new-book
-- Table: books | Events: INSERT

-- Cron job pour le rappel quotidien (via pg_cron)
-- À activer dans Supabase Dashboard → Database → Extensions → pg_cron
-- SELECT cron.schedule(
--   'daily-reading-reminder',
--   '0 20 * * *',  -- Chaque jour à 20h UTC
--   $$SELECT net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/daily-reading-reminder',
--     headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
--   )$$
-- );
