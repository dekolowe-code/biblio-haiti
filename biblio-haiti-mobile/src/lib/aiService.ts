import { getAllBooks } from './bookService'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
// Clé API récupérée depuis le fichier .env (EXPO_PUBLIC_MISTRAL_API_KEY)
const API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || ''

export async function getLibraryContext(): Promise<string> {
  const books = await getAllBooks()
  const booksList = books.map(b => `- ${b.title} par ${b.author} (${b.category}): ${b.description}`).join('\n')
  
  return `Tu es l'assistant IA de l'application Biblio-Haiti. Ton rôle est d'aider les utilisateurs à trouver des livres, de répondre à leurs questions sur le catalogue et de recommander des lectures.
Voici la liste des livres actuellement disponibles dans notre bibliothèque :
${booksList}

Réponds toujours de manière polie, concise et en français.`
}

export async function sendChatMessage(messages: Message[]): Promise<string> {
  if (!API_KEY) {
    console.warn('No EXPO_PUBLIC_MISTRAL_API_KEY found. Using mock response.')
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1500))
    return "Ceci est une réponse simulée. Pour activer la véritable IA, veuillez ajouter EXPO_PUBLIC_MISTRAL_API_KEY dans votre fichier .env."
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: messages,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return "Désolé, je n'ai pas pu me connecter à l'IA pour le moment. Veuillez vérifier votre connexion ou votre clé API."
  }
}
