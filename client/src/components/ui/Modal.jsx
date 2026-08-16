import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-md'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        className={`
          relative w-full ${maxWidth} bg-[#111111] border border-[#262626] rounded-[10px]
          shadow-ds-modal z-10 overflow-hidden animate-in zoom-in-95 duration-150
        `}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#222222] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#ededed] tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-[#888888] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#707070] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
