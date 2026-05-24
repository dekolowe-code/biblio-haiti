import { getAllBooks } from './bookService';
import { Message } from '@/types';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY ?? '';

export async function getLibraryContext(): Promise<string> {
  const books = await getAllBooks();
  const booksList = books
    .map(b => `- ${b.title} par ${b.author} (${b.category}): ${b.description}`)
    .join('\n');

  return `Tu es l'assistant IA de l'application Biblio Haïti. Ton rôle est d'aider les utilisateurs à trouver des livres, de répondre à leurs questions sur le catalogue et de recommander des lectures.
Voici la liste des livres actuellement disponibles dans notre bibliothèque :
${booksList}

Réponds toujours de manière polie, concise et en français.`;
}

export async function sendChatMessage(messages: Message[]): Promise<string> {
  if (!API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "Ceci est une réponse simulée. Pour activer la véritable IA, veuillez configurer EXPO_PUBLIC_MISTRAL_API_KEY dans votre fichier .env.";
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch {
    return "Désolé, je n'ai pas pu me connecter à l'IA pour le moment.";
  }
}

export async function generateQuizForBook(bookTitle: string, bookCategory: string): Promise<Array<{
  text: string;
  options: string[];
  correctIndex: number;
}>> {
  const systemPrompt = `Tu es un générateur de quiz éducatif pour l'application Biblio Haïti. 
Génère 5 questions de quiz sur le livre "${bookTitle}" (catégorie: ${bookCategory}).
Réponds UNIQUEMENT en JSON valide avec ce format exact:
[{"text": "Question?", "options": ["A", "B", "C", "D"], "correctIndex": 0}]`;

  if (!API_KEY) {
    return [
      {
        text: `Quelle est la catégorie du livre "${bookTitle}" ?`,
        options: [bookCategory, 'Jeunesse', 'Sciences', 'Arts'],
        correctIndex: 0,
      },
      {
        text: 'Quel est le but principal de Biblio Haïti ?',
        options: [
          'Promouvoir la lecture en Haïti',
          'Vendre des livres',
          'Enseigner le créole',
          'Organiser des événements',
        ],
        correctIndex: 0,
      },
    ];
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return [];
  } catch {
    return [];
  }
}
