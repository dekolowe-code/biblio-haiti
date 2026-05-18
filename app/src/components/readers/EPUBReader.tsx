import React, { useState, useEffect, useRef } from 'react'
import { ReactReader } from 'react-reader'

interface EPUBReaderProps {
  fileUrl: string
  onPageChange?: (cfi: string) => void
  onPageInfoChange?: (info: { current: number; total: number; percent: number }) => void
  initialLocation?: string
}

const EPUBReader: React.FC<EPUBReaderProps> = ({ fileUrl, onPageChange, onPageInfoChange, initialLocation }) => {
  const [location, setLocation] = useState<string | number>(initialLocation || 0)
  const [bookData, setBookData] = useState<ArrayBuffer | string | null>(null)
  const [displayedPage, setDisplayedPage] = useState<number | null>(null)
  const [displayedTotal, setDisplayedTotal] = useState<number | null>(null)
  const renditionRef = useRef<any>(null)

  useEffect(() => {
    if (initialLocation) setLocation(initialLocation)
  }, [initialLocation])

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(fileUrl)
        if (!res.ok) throw new Error(`Failed to fetch EPUB: ${res.statusText}`)
        
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Fichier introuvable (404)')
        }
        
        const buffer = await res.arrayBuffer()
        setBookData(buffer)
      } catch (err: any) {
        console.error('Error loading EPUB:', err)
        setBookData(null)
      }
    }
    fetchBook()
  }, [fileUrl])

  const updatePageInfo = (cfi: string) => {
    const rendition = renditionRef.current
    if (!rendition) return

    const book = rendition.book
    let page = -1
    let total = -1
    let percent = 0

    try {
      const locationData = rendition.currentLocation?.()
      if (locationData?.start?.displayed?.page) {
        page = Number(locationData.start.displayed.page)
        total = Number(locationData.start.displayed.total || locationData.end?.displayed?.total || total)
        percent = Number(locationData.start.displayed.percentage ?? locationData.start.percentage ?? 0)
      }
    } catch (error) {
      // ignore if currentLocation is not ready yet
    }

    if (page === -1 && book?.pageList?.pageFromCfi) {
      page = book.pageList.pageFromCfi(cfi) || -1
    }

    if (total === -1 && book?.pageList?.lastPage != null && book?.pageList?.firstPage != null) {
      total = Math.max(1, book.pageList.lastPage - book.pageList.firstPage + 1)
    }

    if (page > 0) setDisplayedPage(page)
    if (total > 0) setDisplayedTotal(total)
    if (page > 0 && total > 0) {
      percent = Math.round((page / total) * 100)
    }

    if (onPageInfoChange && page > 0 && total > 0) {
      onPageInfoChange({ current: page, total, percent })
    }
  }

  const locationChanged = (epubcifi: string) => {
    setLocation(epubcifi)
    if (onPageChange) {
      onPageChange(epubcifi)
    }
    updatePageInfo(epubcifi)
  }

  const setRendition = (rendition: any) => {
    renditionRef.current = rendition
    if (initialLocation && typeof initialLocation === 'string') {
      updatePageInfo(initialLocation)
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }} className="epub-reader-container bg-white rounded-lg shadow-inner overflow-hidden">
      {displayedPage && displayedTotal && (
        <div className="absolute top-3 right-3 z-40 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          Page {displayedPage} / {displayedTotal}
        </div>
      )}
      {bookData ? (
        <ReactReader
          url={bookData}
          location={location}
          locationChanged={locationChanged}
          getRendition={setRendition}
          swipeable={true}
          epubOptions={{
            flow: 'paginated',
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
