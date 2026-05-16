import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface PDFReaderProps {
  fileUrl: string
  onPageChange?: (page: number) => void
  initialPage?: number
}

const PDFReader: React.FC<PDFReaderProps> = ({ fileUrl, onPageChange, initialPage = 0 }) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(initialPage + 1)
  const [containerWidth, setContainerWidth] = useState<number>(350)
  const [containerHeight, setContainerHeight] = useState<number>(window.innerHeight * 0.8)
  const [scale, setScale] = useState<number>(1.0)
 
  useEffect(() => {
    setPageNumber(initialPage + 1)
  }, [initialPage])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  useEffect(() => {
    const updateDimensions = () => {
      // Available height is screen - top toolbar (64) - bottom toolbar (80)
      const availableHeight = window.innerHeight - 144
      setContainerHeight(availableHeight * 0.95)
      
      const width = window.innerWidth > 430 ? 380 : window.innerWidth - 40
      setContainerWidth(width)
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const goToPage = (num: number) => {
    const newPage = Math.max(1, Math.min(numPages, num))
    setPageNumber(newPage)
    if (onPageChange) {
      onPageChange(newPage - 1)
    }
  }

  const [showControls, setShowControls] = useState(true)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showAndScheduleHide = () => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  useEffect(() => {
    // Auto-hide after 3s on mount
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [])

  const zoomIn = () => { setScale(prev => Math.min(prev + 0.2, 3.0)); showAndScheduleHide() }
  const zoomOut = () => { setScale(prev => Math.max(prev - 0.2, 0.5)); showAndScheduleHide() }
  const resetZoom = () => { setScale(1.0); showAndScheduleHide() }

  return (
    <div className="pdf-reader-simple relative flex flex-col items-center justify-center w-full h-full overflow-hidden">
      {/* Tap anywhere on PDF to show controls */}
      <div
        className="flex-1 w-full flex items-center justify-center overflow-auto no-scrollbar py-4 px-2"
        onClick={showAndScheduleHide}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-sm font-inter">Chargement du livre...</div>}
          error={<div className="text-sm font-inter text-red-500">Erreur lors du chargement du PDF</div>}
          className="flex justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageNumber}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white shadow-2xl rounded-sm overflow-hidden"
              style={{ scale }}
            >
              <Page 
                pageNumber={pageNumber} 
                height={containerHeight}
                scale={1} // We use CSS scale for smoother animation but can also use scale prop
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={<div style={{ width: containerWidth, height: containerHeight }} />}
              />
            </motion.div>
          </AnimatePresence>
        </Document>
      </div>

      {/* Navigation Overlays (Click left/right side to turn) */}
        <div 
          className="absolute inset-y-0 left-0 w-1/4 cursor-pointer z-10" 
          onClick={(e) => { e.stopPropagation(); goToPage(pageNumber - 1); showAndScheduleHide() }}
        />
        <div 
          className="absolute inset-y-0 right-0 w-1/4 cursor-pointer z-10" 
          onClick={(e) => { e.stopPropagation(); goToPage(pageNumber + 1); showAndScheduleHide() }}
        />

      {/* Floating Controls — bottom of screen, auto-hides */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/50 z-50"
          >
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
          <button onClick={zoomOut} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ZoomOut className="w-5 h-5 text-[#1A1A2E]" />
          </button>
          <button onClick={resetZoom} className="px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors text-[10px] font-bold font-poppins">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ZoomIn className="w-5 h-5 text-[#1A1A2E]" />
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goToPage(pageNumber - 1); }}
          disabled={pageNumber <= 1}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-poppins font-bold text-[#1A1A2E]">
            {pageNumber} / {numPages}
          </span>
          <div className="w-16 h-1 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
            <div 
              className="h-full bg-[#C41E3A] transition-all duration-300" 
              style={{ width: `${(pageNumber / numPages) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goToPage(pageNumber + 1); }}
          disabled={pageNumber >= numPages}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PDFReader
