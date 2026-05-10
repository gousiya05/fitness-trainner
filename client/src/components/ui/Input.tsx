import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  wrapperClass?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon,
  iconRight,
  wrapperClass,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClass)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'input-field',
            icon && 'pl-11',
            iconRight && 'pr-11',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'

// ─── Select variant ────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  wrapperClass?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, options, wrapperClass, className, ...props
}, ref) => (
  <div className={clsx('flex flex-col gap-1.5', wrapperClass)}>
    {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>}
    <select ref={ref} className={clsx('input-field capitalize', error && 'input-error', className)} {...props}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-danger">⚠ {error}</p>}
  </div>
))
Select.displayName = 'Select'

export default Input
