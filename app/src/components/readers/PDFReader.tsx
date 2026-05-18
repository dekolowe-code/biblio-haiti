import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface PDFReaderProps {
  fileUrl: string
  onPageChange?: (page: number) => void
  initialPage?: number
}

const MIN_SCALE = 0.5
const MAX_SCALE = 2.2
const SCALE_STEP = 0.15

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const PDFReader: React.FC<PDFReaderProps> = ({ fileUrl, onPageChange, initialPage = 0 }) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(initialPage + 1)
  const [baseWidth, setBaseWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [scale, setScale] = useState<number>(1)
  const [showControls, setShowControls] = useState(true)

  const committedScale = useRef<number>(1)
  const lastPinchDist = useRef<number | null>(null)
  const isPinching = useRef(false)
  const liveScaleRef = useRef<number>(1)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPageNumber(initialPage + 1)
  }, [initialPage])

  useEffect(() => {
    const updateWidth = () => {
      setBaseWidth(window.innerWidth)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setBaseWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
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

  const changeScale = (delta: number) => {
    const nextScale = clamp(committedScale.current + delta, MIN_SCALE, MAX_SCALE)
    committedScale.current = nextScale
    setScale(nextScale)
    showAndScheduleHide()
  }

  const getPinchDist = (e: TouchEvent) => {
    const [t1, t2] = [e.touches[0], e.touches[1]]
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastPinchDist.current = getPinchDist(e)
        isPinching.current = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault()
        const dist = getPinchDist(e)
        const ratio = dist / lastPinchDist.current
        const candidateScale = clamp(committedScale.current * ratio, MIN_SCALE, MAX_SCALE)
        setScale(candidateScale)
        showAndScheduleHide()
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isPinching.current && e.touches.length < 2) {
        committedScale.current = scale
        lastPinchDist.current = null
        isPinching.current = false
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        changeScale(e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('wheel', onWheel)
    }
  }, [showAndScheduleHide, scale])

  useEffect(() => {
    liveScaleRef.current = scale
  }, [scale])

  const width = Math.max(300, Math.min(baseWidth * scale, baseWidth * MAX_SCALE))

  return (
    <div
      ref={containerRef}
      className="pdf-reader-simple relative flex flex-col w-full h-full overflow-hidden bg-[#1a1a1a]"
      style={{ touchAction: 'pan-y' }}
      onClick={showAndScheduleHide}
    >
      <div className="flex-1 w-full overflow-auto no-scrollbar flex items-start justify-center py-3">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="flex items-center justify-center text-white/60 text-sm font-inter pt-24">Chargement...</div>}
          error={<div className="flex items-center justify-center text-red-400 text-sm font-inter pt-24">Erreur de chargement</div>}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageNumber}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transformOrigin: 'top center' }}
              className="shadow-2xl rounded-sm overflow-hidden"
            >
              <Page
                pageNumber={pageNumber}
                width={width}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </motion.div>
          </AnimatePresence>
        </Document>
      </div>

      <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goToPage(pageNumber - 1) }} />
      <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goToPage(pageNumber + 1) }} />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-2 rounded-full shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => changeScale(-SCALE_STEP)}
              disabled={scale <= MIN_SCALE}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-25"
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-25"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col items-center min-w-[52px]">
              <span className="text-[11px] font-poppins font-bold text-white">{pageNumber} / {numPages}</span>
              <div className="w-12 h-0.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#FAA307] transition-all duration-300"
                  style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }}
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
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={() => changeScale(SCALE_STEP)}
              disabled={scale >= MAX_SCALE}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-25"
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PDFReader
