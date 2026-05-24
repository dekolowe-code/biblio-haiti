# Déploiement des Edge Functions — Biblio Haïti

## Prérequis

```bash
npm install -g supabase
supabase login
```

## 1. Lier le projet Supabase

```bash
supabase link --project-ref <votre-project-ref>
```

## 2. Appliquer la migration SQL

```bash
supabase db push
# ou manuellement via le SQL Editor du dashboard Supabase
```

## 3. Déployer les Edge Functions

```bash
# Déployer toutes les fonctions
supabase functions deploy notify-new-book
supabase functions deploy daily-reading-reminder

# Vérifier le déploiement
supabase functions list
```

## 4. Configurer le Webhook (Dashboard Supabase)

1. Allez dans **Database → Webhooks → Create a new hook**
2. Nom : `notify-new-book`
3. Table : `books`
4. Events : `INSERT`
5. URL : `https://<project-ref>.supabase.co/functions/v1/notify-new-book`
6. Headers : `Authorization: Bearer <service-role-key>`

## 5. Configurer le Cron Job pour le rappel quotidien

Dans **Database → Extensions**, activez `pg_cron`, puis exécutez :

```sql
SELECT cron.schedule(
  'daily-reading-reminder',
  '0 20 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/daily-reading-reminder',
    headers := '{"Authorization": "Bearer <service-role-key>", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
```

## 6. Variables d'environnement des fonctions

Les fonctions utilisent automatiquement :
- `SUPABASE_URL` — injecté automatiquement par Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — injecté automatiquement par Supabase

## 7. Tester les fonctions

```bash
# Test webhook nouveau livre
supabase functions invoke notify-new-book --body '{
  "type": "INSERT",
  "table": "books",
  "record": {
    "id": "test-id",
    "title": "Livre Test",
    "author": "Auteur Test",
    "category": "Roman",
    "cover_url": ""
  }
}'

# Test rappel quotidien
supabase functions invoke daily-reading-reminder
```
