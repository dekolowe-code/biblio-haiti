import React, { useState } from 'react'
import { ReactReader } from 'react-reader'

interface EPUBReaderProps {
  fileUrl: string
  onPageChange?: (cfi: string) => void
  initialLocation?: string
}

const EPUBReader: React.FC<EPUBReaderProps> = ({ fileUrl, onPageChange, initialLocation }) => {
  const [location, setLocation] = useState<string | number>(initialLocation || 0)

  React.useEffect(() => {
    if (initialLocation) setLocation(initialLocation)
  }, [initialLocation])

  const locationChanged = (epubcifi: string) => {
    setLocation(epubcifi)
    if (onPageChange) {
      onPageChange(epubcifi)
    }
  }

  return (
    <div style={{ height: '70vh', width: '100%', position: 'relative' }} className="epub-reader-container bg-white rounded-lg shadow-inner overflow-hidden">
      <ReactReader
        url={fileUrl}
        location={location}
        locationChanged={locationChanged}
        swipeable={true}
        epubOptions={{
          flow: 'paginated', // Force page-by-page
          width: '100%',
        }}
      />
    </div>
  )
}

export default EPUBReader
