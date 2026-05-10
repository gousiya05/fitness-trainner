import { motion } from 'framer-motion'
import clsx from 'clsx'

type LoaderVariant = 'spinner' | 'dots' | 'bar' | 'pulse' | 'skeleton'
type LoaderSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LoaderProps {
  variant?: LoaderVariant
  size?: LoaderSize
  color?: string
  className?: string
  text?: string
}

const sizeMap = { xs: 16, sm: 24, md: 36, lg: 48, xl: 64 }

export function Loader({ variant = 'spinner', size = 'md', color = '#00ff87', className, text }: LoaderProps) {
  const px = sizeMap[size]

  if (variant === 'spinner') {
    return (
      <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
        <svg width={px} height={px} viewBox="0 0 50 50" className="animate-spin">
          <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <path
            fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            d="M25 5 a20 20 0 0 1 20 20"
          />
        </svg>
        {text && <p className="text-white/40 text-sm animate-pulse">{text}</p>}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={clsx('flex items-center gap-1.5', className)}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ background: color, width: px / 5, height: px / 5, borderRadius: '50%' }}
            animate={{ y: [0, -px / 4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        {text && <span className="text-white/40 text-sm ml-2">{text}</span>}
      </div>
    )
  }

  if (variant === 'bar') {
    return (
      <div className={clsx('w-full', className)}>
        <div className="progress-track overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        {text && <p className="text-white/40 text-xs mt-2 text-center">{text}</p>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={clsx('rounded-full', className)}
        style={{ width: px, height: px, background: color }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.3, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )
  }

  // skeleton
  return <div className={clsx('skeleton', className)} style={{ height: px }} />
}

// ─── Full-page loader ──────────────────────────────────────────────────
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neon-gradient flex items-center justify-center mx-auto shadow-neon animate-float">
          <span className="text-bg-primary font-black text-3xl font-display">F</span>
        </div>
        <Loader variant="dots" size="md" />
        <p className="text-white/40 text-sm">{text}</p>
      </div>
    </div>
  )
}

export default Loader
