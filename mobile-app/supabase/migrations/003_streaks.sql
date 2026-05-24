-- ============================================================
-- Migration : Système de Streaks — Biblio Haïti
-- ============================================================

-- Table des sessions de lecture quotidiennes
CREATE TABLE IF NOT EXISTS reading_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id       TEXT NOT NULL,
  session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_sec  INTEGER NOT NULL DEFAULT 0,
  pages_read    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON reading_sessions(user_id, session_date DESC);

-- Table des streaks utilisateur
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  longest_streak    INTEGER NOT NULL DEFAULT 0,
  last_read_date    DATE,
  streak_start_date DATE,
  total_reading_days INTEGER NOT NULL DEFAULT 0,
  total_reading_sec  BIGINT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des récompenses de streak
CREATE TABLE IF NOT EXISTS streak_rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone   INTEGER NOT NULL,            -- 3, 7, 14, 30, 50, 100
  stars_bonus INTEGER NOT NULL DEFAULT 0,
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone)
);

-- Milestones de streak et leurs récompenses
CREATE TABLE IF NOT EXISTS streak_milestones (
  milestone   INTEGER PRIMARY KEY,
  label       TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  stars_bonus INTEGER NOT NULL
);

INSERT INTO streak_milestones(milestone, label, emoji, stars_bonus) VALUES
  (3,   '3 jours',    '🔥',  3),
  (7,   '1 semaine',  '⚡',  7),
  (14,  '2 semaines', '💪',  15),
  (30,  '1 mois',     '🏆',  30),
  (50,  '50 jours',   '🌟',  50),
  (100, '100 jours',  '👑',  100)
ON CONFLICT DO NOTHING;

-- Fonction pour enregistrer une session de lecture et mettre à jour le streak
CREATE OR REPLACE FUNCTION record_reading_session(
  p_user_id    UUID,
  p_book_id    TEXT,
  p_duration   INTEGER,
  p_pages      INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  v_last_date     DATE;
  v_current       INTEGER;
  v_longest       INTEGER;
  v_new_streak    INTEGER;
  v_today         DATE := CURRENT_DATE;
  v_milestone     INTEGER;
  v_stars_bonus   INTEGER := 0;
  v_milestone_hit JSONB := NULL;
  v_streak_rec    user_streaks%ROWTYPE;
BEGIN
  -- Upsert la session
  INSERT INTO reading_sessions(user_id, book_id, session_date, duration_sec, pages_read)
  VALUES (p_user_id, p_book_id, v_today, p_duration, p_pages)
  ON CONFLICT (user_id, book_id, session_date)
  DO UPDATE SET
    duration_sec = reading_sessions.duration_sec + EXCLUDED.duration_sec,
    pages_read   = GREATEST(reading_sessions.pages_read, EXCLUDED.pages_read);

  -- Récupérer le streak actuel
  SELECT * INTO v_streak_rec FROM user_streaks WHERE user_id = p_user_id;
  v_last_date := v_streak_rec.last_read_date;
  v_current   := COALESCE(v_streak_rec.current_streak, 0);
  v_longest   := COALESCE(v_streak_rec.longest_streak, 0);

  -- Calculer nouveau streak
  IF v_last_date IS NULL THEN
    v_new_streak := 1;
  ELSIF v_last_date = v_today THEN
    v_new_streak := v_current;                    -- Déjà lu aujourd'hui
  ELSIF v_last_date = v_today - 1 THEN
    v_new_streak := v_current + 1;                -- Lecture consécutive
  ELSE
    v_new_streak := 1;                            -- Série interrompue
  END IF;

  -- Upsert user_streaks
  INSERT INTO user_streaks(
    user_id, current_streak, longest_streak,
    last_read_date, streak_start_date,
    total_reading_days, total_reading_sec
  )
  VALUES (
    p_user_id, v_new_streak, GREATEST(v_longest, v_new_streak),
    v_today,
    CASE WHEN v_last_date IS NULL OR v_last_date < v_today - 1
         THEN v_today
         ELSE COALESCE(v_streak_rec.streak_start_date, v_today) END,
    CASE WHEN v_last_date = v_today THEN COALESCE(v_streak_rec.total_reading_days, 1)
         ELSE COALESCE(v_streak_rec.total_reading_days, 0) + 1 END,
    COALESCE(v_streak_rec.total_reading_sec, 0) + p_duration
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak     = EXCLUDED.current_streak,
    longest_streak     = EXCLUDED.longest_streak,
    last_read_date     = EXCLUDED.last_read_date,
    streak_start_date  = EXCLUDED.streak_start_date,
    total_reading_days = EXCLUDED.total_reading_days,
    total_reading_sec  = EXCLUDED.total_reading_sec,
    updated_at         = now();

  -- Vérifier si un milestone est atteint
  SELECT sm.milestone, sm.stars_bonus
  INTO v_milestone, v_stars_bonus
  FROM streak_milestones sm
  WHERE sm.milestone <= v_new_streak
    AND NOT EXISTS (
      SELECT 1 FROM streak_rewards sr
      WHERE sr.user_id = p_user_id AND sr.milestone = sm.milestone
    )
  ORDER BY sm.milestone DESC
  LIMIT 1;

  IF v_milestone IS NOT NULL THEN
    -- Enregistrer la récompense
    INSERT INTO streak_rewards(user_id, milestone, stars_bonus)
    VALUES (p_user_id, v_milestone, v_stars_bonus)
    ON CONFLICT DO NOTHING;

    -- Créditer les étoiles
    IF v_stars_bonus > 0 THEN
      UPDATE profiles
      SET stars_balance = COALESCE(stars_balance, 0) + v_stars_bonus
      WHERE id = p_user_id;

      INSERT INTO star_transactions(user_id, amount, reason, reference_id)
      VALUES (p_user_id, v_stars_bonus, 'streak', v_milestone::TEXT);
    END IF;

    SELECT row_to_json(sm) INTO v_milestone_hit
    FROM streak_milestones sm WHERE sm.milestone = v_milestone;
  END IF;

  RETURN jsonb_build_object(
    'streak',       v_new_streak,
    'longest',      GREATEST(v_longest, v_new_streak),
    'stars_bonus',  v_stars_bonus,
    'milestone',    v_milestone_hit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_rewards   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON reading_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read all streaks"
  ON user_streaks FOR SELECT USING (true);

CREATE POLICY "Service manages streaks"
  ON user_streaks FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own rewards"
  ON streak_rewards FOR SELECT USING (auth.uid() = user_id);
