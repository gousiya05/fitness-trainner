import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

interface ChartCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  iconColor?: string
  height?: number
  className?: string
  children: ReactNode
  action?: ReactNode
  loading?: boolean
  delay?: number
}

export function ChartCard({
  title, subtitle, icon, iconColor = '#00ff87',
  height = 220, className, children, action, loading = false, delay = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={clsx('glass p-5 md:p-6', className)}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: `${iconColor}18`, color: iconColor }}>
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-display font-semibold text-base">{title}</h3>
            {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-5 rounded" style={{ opacity: 1 - i * 0.25 }} />)}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}

// ─── Recharts shared tooltip ───────────────────────────────────────────
export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs min-w-max">
      {label && <p className="text-white/50 mb-2 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default ChartCard
