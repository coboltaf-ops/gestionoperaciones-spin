'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceSearchButtonProps {
  onResult: (text: string) => void
  className?: string
}

export default function VoiceSearchButton({ onResult, className = '' }: VoiceSearchButtonProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const onResultRef = useRef(onResult)
  const isListeningRef = useRef(false)
  onResultRef.current = onResult

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  function handleClick() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    // Si está escuchando, no hacemos nada (se detiene solo)
    if (isListeningRef.current) return

    // Limpiar búsqueda anterior al iniciar nueva
    onResultRef.current('')

    const recognition = new SR()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    let gotResult = false

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      gotResult = true
      const text = e.results[0][0].transcript.trim()
      if (text) onResultRef.current(text)
      isListeningRef.current = false
      setListening(false)
    }

    recognition.onerror = () => {
      isListeningRef.current = false
      setListening(false)
    }

    recognition.onend = () => {
      // Si no hubo resultado, limpiar estado
      if (!gotResult) {
        isListeningRef.current = false
        setListening(false)
      }
    }

    try {
      recognition.start()
      isListeningRef.current = true
      setListening(true)
    } catch {
      isListeningRef.current = false
      setListening(false)
    }
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      title={listening ? 'Escuchando...' : 'Buscar por voz'}
      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shrink-0 ${className}`}
      style={{
        background: listening ? 'rgba(239,68,68,0.4)' : 'rgba(96,165,250,0.15)',
        border: listening ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(96,165,250,0.3)',
        animation: listening ? 'pulse-mic 1.2s infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={listening ? '#f87171' : '#60a5fa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  )
}
