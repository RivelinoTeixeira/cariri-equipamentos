import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children, footer = null }) {
  // Rastreia se o "mouse down" comecou no backdrop. So fecha se TANTO o down
  // QUANTO o up aconteceram no backdrop. Evita fechar quando o usuario clica
  // dentro do modal, arrasta o mouse pra fora (ao selecionar texto, por ex)
  // e solta fora.
  const downOnBackdropRef = useRef(false)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  function handleBackdropMouseDown(e) {
    downOnBackdropRef.current = e.target === e.currentTarget
  }
  function handleBackdropMouseUp(e) {
    const wasOnBackdrop = downOnBackdropRef.current
    downOnBackdropRef.current = false
    if (wasOnBackdrop && e.target === e.currentTarget) {
      onClose?.()
    }
  }
  function handleBackdropTouchEnd(e) {
    // mobile: fecha so se o toque iniciou e terminou no backdrop
    if (e.target === e.currentTarget) onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      onTouchEnd={handleBackdropTouchEnd}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none" />
      <div
        className="relative w-full sm:max-w-lg bg-nexus-card border border-nexus-border rounded-t-3xl sm:rounded-2xl shadow-glow animate-slide-up"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* drag handle visivel apenas no mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-nexus-border" />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-nexus-border">
          <h3 className="text-base font-bold text-nexus-text">{title}</h3>
          <button
            onClick={onClose}
            className="text-nexus-muted hover:text-nexus-text text-2xl leading-none w-9 h-9 grid place-items-center rounded-lg hover:bg-nexus-surface"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        <div className="px-4 sm:px-5 py-4 sm:py-5 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-nexus-border flex flex-col-reverse sm:flex-row justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
