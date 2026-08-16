import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const variants = {
    primary: 'bg-[#ededed] text-black hover:bg-[#ffffff] active:bg-[#d6d6d6] shadow-sm font-semibold',
    secondary: 'bg-[#141414] text-[#ededed] border border-[#262626] hover:bg-[#1f1f1f] hover:border-[#383838] active:bg-[#181818]',
    ghost: 'text-[#a1a1a1] hover:text-[#ededed] hover:bg-[#1a1a1a] active:bg-[#222222]',
    danger: 'bg-[#1f1212] text-[#f87171] border border-[#3b1c1c] hover:bg-[#2e1919] hover:border-[#522525] hover:text-[#ef4444]',
    link: 'text-[#0070f3] hover:underline p-0 h-auto'
  }

  const sizes = {
    xs: 'h-6 px-2 text-[11px] rounded-[4px] gap-1',
    sm: 'h-7 px-2.5 text-xs rounded-[6px] gap-1.5',
    md: 'h-9 px-3.5 text-xs sm:text-sm rounded-[6px] gap-2',
    lg: 'h-11 px-5 text-sm rounded-[8px] gap-2.5',
    icon: 'h-8 w-8 rounded-[6px] p-0'
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      ) : null}
      {children}
      {!isLoading && IconRight && (
        <IconRight className="w-3.5 h-3.5 flex-shrink-0" />
      )}
    </button>
  )
})

Button.displayName = 'Button'
