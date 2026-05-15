import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import BookCard from '@/components/BookCard'
import { books, countries, categories, styles } from '@/data/mockData'

export default function CatalogueScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [accessFilter, setAccessFilter] = useState<string>('all') // all, free, premium

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCountry = !selectedCountry || book.country === selectedCountry
      const matchesCategory = !selectedCategory || book.category === selectedCategory
      const matchesStyle = !selectedStyle || book.style === selectedStyle
      const matchesAccess = accessFilter === 'all' ||
        (accessFilter === 'free' && !book.isPremium) ||
        (accessFilter === 'premium' && book.isPremium)
      return matchesSearch && matchesCountry && matchesCategory && matchesStyle && matchesAccess
    })
  }, [searchQuery, selectedCountry, selectedCategory, selectedStyle, accessFilter])

  const activeFilters = [
    selectedCountry && { label: selectedCountry, onRemove: () => setSelectedCountry('') },
    selectedCategory && { label: selectedCategory, onRemove: () => setSelectedCategory('') },
    selectedStyle && { label: selectedStyle, onRemove: () => setSelectedStyle('') },
    accessFilter !== 'all' && { label: accessFilter === 'free' ? 'Gratuit' : 'Premium', onRemove: () => setAccessFilter('all') },
  ].filter(Boolean) as { label: string; onRemove: () => void }[]

  return (
    <div className="min-h-full">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-[#FFF8F0] px-4 py-3 shadow-sm">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un livre, auteur..."
              className="w-full h-10 pl-10 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(true)}
            className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#E85D04] rounded-xl flex items-center justify-center shadow-md"
          >
            <SlidersHorizontal className="w-4 h-4 text-white" />
          </motion.button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {activeFilters.map((filter, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 text-xs font-inter text-[#1A1A2E]"
              >
                {filter.label}
                <button onClick={filter.onRemove}>
                  <X className="w-3 h-3 text-[#6B7280]" />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setSelectedCountry(''); setSelectedCategory(''); setSelectedStyle(''); setAccessFilter('all') }}
              className="text-xs text-[#C41E3A] font-inter font-medium"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Book Grid */}
      <div className="px-4 py-4">
        <p className="text-xs text-[#6B7280] font-inter mb-3">{filteredBooks.length} livre{filteredBooks.length !== 1 ? 's' : ''}</p>
        <div className="grid grid-cols-3 gap-3">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} compact />
          ))}
        </div>
        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="w-12 h-12 text-[#6B7280] mb-3" />
            <p className="text-sm text-[#6B7280] font-inter">Aucun résultat trouvé</p>
            <p className="text-xs text-[#6B7280] font-inter mt-1">Essayez d'autres filtres</p>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto"
              style={{ maxWidth: 430, margin: '0 auto' }}
            >
              <div className="sticky top-0 bg-white rounded-t-3xl px-4 pt-4 pb-3 border-b border-gray-100 z-10">
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="font-poppins font-semibold text-lg text-[#1A1A2E]">Filtres</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setSelectedCountry(''); setSelectedCategory(''); setSelectedStyle(''); setAccessFilter('all') }}
                      className="text-xs text-[#6B7280] font-inter"
                    >
                      Réinitialiser
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-xs text-[#C41E3A] font-inter font-semibold"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 space-y-4">
                {/* Country */}
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Pays</h3>
                  <div className="flex flex-wrap gap-2">
                    {countries.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCountry(selectedCountry === c ? '' : c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-inter transition-colors ${selectedCountry === c ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Catégorie</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(selectedCategory === c.name ? '' : c.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-inter transition-colors ${selectedCategory === c.name ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {styles.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedStyle(selectedStyle === s ? '' : s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-inter transition-colors ${selectedStyle === s ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Access */}
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Accès</h3>
                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: 'Tous' },
                      { value: 'free', label: 'Gratuits' },
                      { value: 'premium', label: 'Premium' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAccessFilter(opt.value)}
                        className={`flex-1 py-2 rounded-xl text-xs font-inter font-medium transition-colors ${accessFilter === opt.value ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
