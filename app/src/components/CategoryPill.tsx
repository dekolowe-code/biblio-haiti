import { motion } from 'framer-motion'
import { BookOpen, FlaskConical, Baby, Bookmark, Clock, Palette } from 'lucide-react'
import { useNavigate } from 'react-router'

const iconMap: Record<string, React.ElementType> = {
  'Litt\u00e9rature': BookOpen,
  'Sciences': FlaskConical,
  'Jeunesse': Baby,
  'Contes': Bookmark,
  'Histoire': Clock,
  'Arts': Palette,
}

interface CategoryPillProps {
  id: string
  name: string
  color: string
  bgClass: string
}

export default function CategoryPill({ name, bgClass }: CategoryPillProps) {
  const navigate = useNavigate()
  const Icon = iconMap[name] || BookOpen

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(`/catalogue?category=${encodeURIComponent(name)}`)}
      className={`${bgClass} text-white rounded-full px-4 py-2.5 flex items-center gap-2 flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)]`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-poppins font-semibold text-xs whitespace-nowrap">{name}</span>
    </motion.button>
  )
}
