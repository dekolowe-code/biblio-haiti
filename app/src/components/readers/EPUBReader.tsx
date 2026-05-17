import React, { useState } from 'react'
import { ReactReader } from 'react-reader'

interface EPUBReaderProps {
  fileUrl: string
  onPageChange?: (cfi: string) => void
  initialLocation?: string
}

const EPUBReader: React.FC<EPUBReaderProps> = ({ fileUrl, onPageChange, initialLocation }) => {
  const [location, setLocation] = useState<string | number>(initialLocation || 0)
  const [bookData, setBookData] = useState<ArrayBuffer | string | null>(null)

  React.useEffect(() => {
    if (initialLocation) setLocation(initialLocation)
  }, [initialLocation])

  React.useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(fileUrl)
        if (!res.ok) throw new Error(`Failed to fetch EPUB: ${res.statusText}`)
        
        // Check if Vite returned the fallback HTML (means file doesn't exist)
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Fichier introuvable (404)')
        }
        
        const buffer = await res.arrayBuffer()
        setBookData(buffer)
      } catch (err: any) {
        console.error('Error loading EPUB:', err)
        setBookData(null) // Keep it null to show error or loading forever, but better show error state
        // You can add an error state here if needed
      }
    }
    fetchBook()
  }, [fileUrl])

  const locationChanged = (epubcifi: string) => {
    setLocation(epubcifi)
    if (onPageChange) {
      onPageChange(epubcifi)
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }} className="epub-reader-container bg-white rounded-lg shadow-inner overflow-hidden">
      {bookData ? (
        <ReactReader
          url={bookData}
          location={location}
          locationChanged={locationChanged}
          swipeable={true}
          epubOptions={{
            flow: 'paginated', // Force page-by-page
            width: '100%',
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          Chargement du livre...
        </div>
      )}
    </div>
  )
}

export default EPUBReader
