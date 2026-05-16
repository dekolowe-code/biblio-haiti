import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface PDFReaderProps {
  fileUrl: string
  onPageChange?: (page: number) => void
  initialPage?: number
}

const PDFReader: React.FC<PDFReaderProps> = ({ fileUrl, onPageChange, initialPage = 0 }) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(initialPage + 1)
  const [pageWidth, setPageWidth] = useState<number>(300)
  const [scale, setScale] = useState<number>(1.0)
  const [showControls, setShowControls] = useState(true)

  const lastPinchDist = useRef<number | null>(null)
  const lastScaleRef = useRef<number>(1.0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setPageNumber(initialPage + 1) }, [initialPage])

  useEffect(() => {
    const update = () => {
      const padding = 16
      const maxWidth = Math.min(window.innerWidth - padding * 2, 420)
      setPageWidth(maxWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const showAndScheduleHide = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  useEffect(() => {
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [])

  const goToPage = (num: number) => {
    const newPage = Math.max(1, Math.min(numPages, num))
    setPageNumber(newPage)
    onPageChange?.(newPage - 1)
    showAndScheduleHide()
  }

  const applyScale = (next: number) => {
    const clamped = Math.max(0.5, Math.min(3.0, next))
    setScale(clamped)
    lastScaleRef.current = clamped
  }

  // Pinch-to-zoom
  const getPinchDist = (e: TouchEvent) => {
    const [t1, t2] = [e.touches[0], e.touches[1]]
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) lastPinchDist.current = getPinchDist(e)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault()
        const dist = getPinchDist(e)
        const delta = dist / lastPinchDist.current
        lastPinchDist.current = dist
        applyScale(lastScaleRef.current * delta)
        showAndScheduleHide()
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) lastPinchDist.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [showAndScheduleHide])

  return (
    <div
      ref={containerRef}
      className="pdf-reader-simple relative flex flex-col w-full h-full overflow-hidden bg-[#1a1a1a]"
      onClick={showAndScheduleHide}
    >
      {/* PDF Viewport */}
      <div
        className="flex-1 w-full overflow-auto no-scrollbar flex items-start justify-center py-3"
        style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="flex items-center justify-center h-full text-white/60 text-sm font-inter pt-20">Chargement du livre...</div>}
          error={<div className="flex items-center justify-center h-full text-red-400 text-sm font-inter pt-20">Erreur lors du chargement du PDF</div>}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageNumber}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                transformOrigin: 'top center',
                transform: `scale(${scale})`,
                marginBottom: scale < 1 ? `${(1 - scale) * -200}px` : 0,
              }}
              className="shadow-2xl rounded-sm overflow-hidden"
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </motion.div>
          </AnimatePresence>
        </Document>
      </div>

      {/* Tap zones left/right to flip pages */}
      <div
        className="absolute inset-y-0 left-0 w-1/4 z-10"
        onClick={(e) => { e.stopPropagation(); goToPage(pageNumber - 1) }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/4 z-10"
        onClick={(e) => { e.stopPropagation(); goToPage(pageNumber + 1) }}
      />

      {/* Minimal page indicator — auto-hides */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-25"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col items-center min-w-[60px]">
              <span className="text-[11px] font-poppins font-bold text-white">{pageNumber} / {numPages}</span>
              <div className="w-14 h-0.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#FAA307] transition-all duration-300"
                  style={{ width: `${(pageNumber / numPages) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => goToPage(pageNumber + 1)}
              disabled={pageNumber >= numPages}
              className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-25"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PDFReader
