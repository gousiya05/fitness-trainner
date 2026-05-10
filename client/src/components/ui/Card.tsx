import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

type CardVariant = 'glass' | 'dark' | 'neon' | 'violet' | 'fire' | 'elevated'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
  delay?: number
}

const variantMap: Record<CardVariant, string> = {
  glass:    'glass',
  dark:     'glass-dark',
  neon:     'glass-neon',
  violet:   'glass-violet',
  fire:     'bg-fire/5 border border-fire/20 rounded-2xl',
  elevated: 'bg-bg-elevated border border-bg-border rounded-2xl',
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-5 md:p-6',
  lg:   'p-6 md:p-8',
}

export function Card({
  children,
  variant = 'glass',
  className,
  hover = false,
  onClick,
  padding = 'md',
  animate = false,
  delay = 0,
}: CardProps) {
  const baseClass = clsx(
    variantMap[variant],
    paddingMap[padding],
    hover && 'glass-hover cursor-pointer',
    className
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={baseClass}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClass} onClick={onClick}>
      {children}
    </div>
  )
}

// ─── Stat card ─────────────────────────────────────────────────────────
interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
  trend?: { value: number; positive: boolean }
  delay?: number
}

export function StatCard({ icon, label, value, sub, color = '#00ff87', trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass p-5 flex gap-4 items-center group hover:border-white/12 transition-all"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl transition-transform group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest truncate">{label}</p>
        <p className="font-display font-black text-2xl text-white mt-0.5">{value}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5 truncate">{sub}</p>}
      </div>
      {trend && (
        <div className={`text-xs font-bold shrink-0 ${trend.positive ? 'text-neon' : 'text-danger'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </motion.div>
  )
}

export default Card
