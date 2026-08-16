import { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  id,
  size = 'md',
  ...props
}, ref) => {
  const sizes = {
    sm: 'h-8 text-xs px-2.5',
    md: 'h-9 text-xs sm:text-sm px-3',
    lg: 'h-11 text-sm px-3.5'
  }

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-medium tracking-wider uppercase text-[#888888]"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-[6px]">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#707070]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            block w-full bg-[#0d0d0d] border rounded-[6px] text-[#ededed] placeholder-[#555555]
            transition-all duration-150 focus:outline-none
            ${sizes[size] || sizes.md}
            ${Icon ? 'pl-9' : ''}
            ${IconRight ? 'pr-9' : ''}
            ${error ? 'border-[#ee0000] focus:border-[#ee0000]' : 'border-[#222222] hover:border-[#333333] focus:border-[#ededed] focus:ring-1 focus:ring-[#ededed]/20'}
            ${className}
          `}
          {...props}
        />
        {IconRight && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#707070]">
            {IconRight}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-[#ff6666] tracking-tight">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
