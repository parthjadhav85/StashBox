export function Kbd({ children, className = '' }) {
  return (
    <kbd
      className={`
        inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono
        font-medium text-[#888888] bg-[#1a1a1a] border border-[#2e2e2e] rounded-[4px]
        shadow-xs select-none ${className}
      `}
    >
      {children}
    </kbd>
  )
}
