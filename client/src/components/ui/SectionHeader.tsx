import { motion } from 'framer-motion'

interface SectionHeaderProps {
  title: string
  subtitle: string
  highlight?: string
}

export function SectionHeader({ title, subtitle, highlight }: SectionHeaderProps) {
  // If highlight is provided, we can split the title to colorize it.
  // For simplicity, if highlight is not provided but the title contains it, we could parse it,
  // but it's easier to just pass the components or use a wrapper.
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="text-center mb-16 md:mb-24"
    >
      <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
        {title.split(highlight || '').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && highlight && (
              <span className="gradient-text">{highlight}</span>
            )}
          </span>
        ))}
        {!highlight && title}
      </h2>
      <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
        {subtitle}
      </p>
    </motion.div>
  )
}
