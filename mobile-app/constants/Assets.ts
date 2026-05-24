// Références statiques aux assets partagés avec l'app web
// Les covers sont copiés depuis app/public/assets/books/covers/

export const Covers = {
  danse:    require('../assets/covers/book-danse.jpg'),
  histoire: require('../assets/covers/book-histoire.jpg'),
  recits:   require('../assets/covers/book-recits.jpg'),
  carnaval: require('../assets/covers/book-carnaval.jpg'),
  cuisine:  require('../assets/covers/book-cuisine.jpg'),
  jeunesse: require('../assets/covers/book-jeunesse.jpg'),
} as const;

export const Images = {
  heroBanner:    require('../assets/images/hero-banner.jpg'),
  emptyLibrary:  require('../assets/images/empty-library.jpg'),
  quizBanner:    require('../assets/images/quiz-banner.jpg'),
  avatarDefault: require('../assets/images/avatar-default.jpg'),
} as const;

// Map ID livre → cover locale (pour les livres démo)
export const BOOK_COVER_MAP: Record<string, ReturnType<typeof require>> = {
  '1': Covers.danse,
  '2': Covers.histoire,
  '3': Covers.recits,
  '4': Covers.jeunesse,
  '5': Covers.cuisine,
  '6': Covers.carnaval,
};
