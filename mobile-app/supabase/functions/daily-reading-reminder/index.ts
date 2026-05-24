import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

// Cette fonction est appelée via un cron job Supabase (pg_cron)
// ou depuis un webhook programmé externe
serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer les utilisateurs avec rappel activé
    // qui n'ont pas lu depuis plus de 23h
    const yesterday = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()

    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token, user_id, reminder_enabled')
      .eq('is_active', true)
      .eq('reminder_enabled', true)

    if (error || !tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_tokens' }), { status: 200 })
    }

    // Trouver les utilisateurs qui ont des livres en cours
    const { data: activeReaders } = await supabase
      .from('user_library')
      .select('user_id, book_id, current_page')
      .gt('current_page', 0)
      .eq('is_finished', false)
      .in('user_id', tokens.map((t) => t.user_id))

    const activeUserIds = new Set(activeReaders?.map((r) => r.user_id) ?? [])

    // Construire les messages selon si l'utilisateur lit activement ou non
    const messages = tokens.map((t) => {
      const isActiveReader = activeUserIds.has(t.user_id)
      return {
        to: t.token,
        sound: false,
        title: '📚 Biblio Haïti',
        body: isActiveReader
          ? "Continuez votre lecture ! Vous avez un livre en cours. 📖"
          : "Découvrez un nouveau livre sur Biblio Haïti aujourd'hui ! ✨",
        data: { type: 'reading_reminder' },
        channelId: 'reading-reminder',
      }
    })

    if (!messages.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    // Envoyer en lots
    const BATCH_SIZE = 100
    let totalSent = 0

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      if (response.ok) totalSent += batch.length
    }

    await supabase.from('notification_log').insert({
      type: 'reading_reminder',
      title: '📚 Rappel de lecture',
      body: `Envoyé à ${totalSent} utilisateurs`,
      recipients: totalSent,
      sent_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ success: true, sent: totalSent }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
