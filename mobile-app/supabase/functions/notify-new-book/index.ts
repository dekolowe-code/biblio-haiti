import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    title: string
    author: string
    category: string
    cover_url: string
  }
  old_record: null | Record<string, unknown>
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()

    if (payload.type !== 'INSERT' || payload.table !== 'books') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const book = payload.record
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer tous les tokens push enregistrés
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (error || !tokens?.length) {
      console.log('Aucun token trouvé ou erreur:', error?.message)
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    // Construire les messages Expo
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title: '📚 Nouveau livre disponible !',
      body: `"${book.title}" par ${book.author} vient d'être ajouté à Biblio Haïti`,
      data: {
        type: 'new_book',
        bookId: book.id,
        category: book.category,
      },
      channelId: 'new-books',
      badge: 1,
    }))

    // Envoyer en lots de 100 (limite Expo)
    const BATCH_SIZE = 100
    let totalSent = 0

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      })

      if (response.ok) {
        totalSent += batch.length
        const result = await response.json()
        console.log(`Lot ${Math.floor(i / BATCH_SIZE) + 1} envoyé:`, result)
      } else {
        console.error('Erreur Expo Push:', await response.text())
      }
    }

    // Enregistrer la notification dans l'historique
    await supabase.from('notification_log').insert({
      type: 'new_book',
      title: '📚 Nouveau livre disponible !',
      body: `"${book.title}" par ${book.author}`,
      data: { bookId: book.id },
      recipients: totalSent,
      sent_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ success: true, sent: totalSent }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Erreur:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
