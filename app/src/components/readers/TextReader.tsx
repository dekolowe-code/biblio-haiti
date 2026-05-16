import React from 'react'

interface TextReaderProps {
  content: string[]
  currentPage: number
  fontSize: number
}

const TextReader: React.FC<TextReaderProps> = ({ content, currentPage, fontSize }) => {
  return (
    <div
      className="font-merriweather leading-relaxed w-full"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
    >
      <p>{content[currentPage % content.length]}</p>
    </div>
  )
}

export default TextReader
