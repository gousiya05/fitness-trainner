import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  delay?: number
  badge?: string
  ctaText?: string
  onCtaClick?: () => void
}

export function FeatureCard({ title, description, icon: Icon, color, delay = 0, badge, ctaText, onCtaClick }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative h-full flex flex-col"
    >
      {/* Animated Border Glow Layer */}
      <div 
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md pointer-events-none"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${color}40, transparent)` }}
      />
      
      <div className="relative h-full flex flex-col glass-dark border border-white/5 group-hover:border-white/20 rounded-3xl p-8 transition-all duration-500 overflow-hidden transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Subtle Background Inner Glow */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        <div className="flex justify-between items-start mb-6">
          {/* Icon Container */}
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative"
            style={{ 
              background: `linear-gradient(135deg, ${color}20, transparent)`, 
              border: `1px solid ${color}40` 
            }}
          >
            {/* Inner intense glow on hover */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none"
              style={{ backgroundColor: `${color}40` }}
            />
            <Icon className="text-2xl relative z-10 transition-colors duration-300" style={{ color }} strokeWidth={2.5} />
          </div>

          {badge && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-black/40 border backdrop-blur-md transition-colors duration-300 group-hover:border-transparent group-hover:bg-opacity-80"
                  style={{ color, borderColor: `${color}40`, boxShadow: `0 0 10px ${color}20` }}>
              {badge}
            </span>
          )}
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="font-display font-bold text-2xl text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text transition-colors duration-300"
              style={{ backgroundImage: `linear-gradient(to right, #fff, ${color})` }}>
            {title}
          </h3>
          <p className="text-white/50 text-base leading-relaxed font-medium transition-colors duration-300 group-hover:text-white/70">
            {description}
          </p>
        </div>

        {/* Optional CTA */}
        {ctaText && onCtaClick && (
          <div className="mt-6 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <button 
              onClick={onCtaClick}
              className="w-full py-3 rounded-xl font-semibold text-bg-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, boxShadow: `0 4px 20px ${color}40` }}
            >
              {ctaText}
            </button>
          </div>
        )}

        {/* Bottom edge highlight on hover */}
        <div 
          className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      </div>
    </motion.div>
  )
}
