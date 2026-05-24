-- ============================================================
-- Migration : Classement (Leaderboard) — Biblio Haïti
-- ============================================================

-- Table des scores de quiz
CREATE TABLE IF NOT EXISTS quiz_scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id     TEXT NOT NULL,
  book_title  TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '',
  score       SMALLINT NOT NULL CHECK (score >= 0),
  total       SMALLINT NOT NULL CHECK (total > 0),
  percentage  NUMERIC(5,2) GENERATED ALWAYS AS (ROUND((score::numeric / total) * 100, 2)) STORED,
  stars_earned SMALLINT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_scores_user    ON quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_book    ON quiz_scores(book_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_pct     ON quiz_scores(percentage DESC);

-- Table des transactions d'étoiles (audit trail)
CREATE TABLE IF NOT EXISTS star_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      SMALLINT NOT NULL,          -- positif = gagné, négatif = dépensé
  reason      TEXT NOT NULL,              -- 'quiz_perfect', 'quiz_good', 'streak', etc.
  reference_id TEXT,                      -- quiz_score.id ou autre
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_star_tx_user ON star_transactions(user_id);

-- Vue classement global (meilleur score par utilisateur)
CREATE OR REPLACE VIEW leaderboard_global AS
SELECT
  p.id          AS user_id,
  p.full_name,
  p.avatar_url,
  COUNT(DISTINCT qs.book_id)                           AS books_completed,
  COALESCE(SUM(qs.stars_earned), 0)                   AS total_stars,
  COALESCE(AVG(qs.percentage), 0)::NUMERIC(5,2)       AS avg_score,
  COALESCE(MAX(qs.percentage), 0)::NUMERIC(5,2)       AS best_score,
  COUNT(qs.id)                                         AS total_quizzes,
  COALESCE(SUM(CASE WHEN qs.percentage = 100 THEN 1 ELSE 0 END), 0) AS perfect_scores
FROM profiles p
LEFT JOIN quiz_scores qs ON qs.user_id = p.id
GROUP BY p.id, p.full_name, p.avatar_url
ORDER BY total_stars DESC, avg_score DESC;

-- Vue classement par catégorie
CREATE OR REPLACE VIEW leaderboard_by_category AS
SELECT
  qs.category,
  p.id          AS user_id,
  p.full_name,
  p.avatar_url,
  COUNT(qs.id)                              AS quizzes_in_category,
  COALESCE(AVG(qs.percentage), 0)::NUMERIC(5,2) AS avg_score,
  COALESCE(SUM(qs.stars_earned), 0)         AS stars_in_category,
  RANK() OVER (PARTITION BY qs.category ORDER BY AVG(qs.percentage) DESC) AS rank
FROM quiz_scores qs
JOIN profiles p ON p.id = qs.user_id
GROUP BY qs.category, p.id, p.full_name, p.avatar_url;

-- Ajouter colonne stars_balance à profiles si elle n'existe pas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stars_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quiz_streak    SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_quiz_at   TIMESTAMPTZ;

-- Fonction pour attribuer des étoiles après un quiz
CREATE OR REPLACE FUNCTION award_quiz_stars(
  p_user_id    UUID,
  p_score_id   UUID,
  p_percentage NUMERIC
) RETURNS SMALLINT AS $$
DECLARE
  v_stars SMALLINT := 0;
  v_reason TEXT;
BEGIN
  IF p_percentage = 100 THEN
    v_stars  := 5;
    v_reason := 'quiz_perfect';
  ELSIF p_percentage >= 80 THEN
    v_stars  := 3;
    v_reason := 'quiz_good';
  ELSIF p_percentage >= 60 THEN
    v_stars  := 1;
    v_reason := 'quiz_pass';
  ELSE
    v_stars  := 0;
    v_reason := 'quiz_fail';
  END IF;

  IF v_stars > 0 THEN
    -- Enregistrer la transaction
    INSERT INTO star_transactions(user_id, amount, reason, reference_id)
    VALUES (p_user_id, v_stars, v_reason, p_score_id::TEXT);

    -- Mettre à jour le solde dans profiles
    UPDATE profiles
    SET stars_balance = COALESCE(stars_balance, 0) + v_stars,
        last_quiz_at  = now()
    WHERE id = p_user_id;

    -- Mettre à jour le score avec les étoiles gagnées
    UPDATE quiz_scores SET stars_earned = v_stars WHERE id = p_score_id;
  END IF;

  RETURN v_stars;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE quiz_scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read all scores"
  ON quiz_scores FOR SELECT USING (true);

CREATE POLICY "Users insert own scores"
  ON quiz_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own transactions"
  ON star_transactions FOR SELECT
  USING (auth.uid() = user_id);
