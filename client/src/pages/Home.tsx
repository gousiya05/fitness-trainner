import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdFitnessCenter, MdCameraAlt, MdTrendingUp, MdAutoAwesome,
  MdRestaurant, MdMonitorWeight, MdArrowForward, MdBolt, MdCheck,
} from 'react-icons/md'
import { BrainCircuit, Activity, Scale, Flame, Apple, LineChart } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { WorkoutPlanModal } from '@/components/ui/WorkoutPlanModal'

const FEATURES = [
  { icon: BrainCircuit, title: 'AI Workout Plans',     description: 'Advanced machine learning generates hyper-personalized programs tailored precisely to your evolving fitness goals.', color: '#00ff87' },
  { icon: Activity,     title: 'Live Posture AI',       description: 'Computer vision algorithms detect biomechanical errors and count your repetitions with pinpoint accuracy in real time.', color: '#7c3aed' },
  { icon: Scale,        title: 'BMI Intelligence',      description: 'Smart predictive models classify your body metrics and assess long-term health risks instantaneously.', color: '#06b6d4' },
  { icon: Flame,        title: 'Calorie AI',            description: 'Linear regression models calculate your exact metabolic burn rate per distinct exercise session.', color: '#ff6b35' },
  { icon: Apple,        title: 'Diet Recommendations',  description: 'AI-curated, macro-optimized meal protocols designed specifically to accelerate your recovery and results.', color: '#a78bfa' },
  { icon: LineChart,    title: 'Progress Analytics',    description: 'Deep-dive interactive visualizations map your streaks, weight trajectories, and performance history.', color: '#fbbf24' },
]

const STATS = [
  { val: '4', label: 'AI Models' },
  { val: '33', label: 'Pose Landmarks' },
  { val: '9', label: 'App Pages' },
  { val: '∞', label: 'Workouts' },
]

const STACK = ['React + Vite', 'Tailwind CSS', 'Framer Motion', 'FastAPI', 'MediaPipe', 'scikit-learn', 'MongoDB', 'Node.js']

function MdLocalFireDepartment(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>
}

export default function Home() {
  const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false)

  const handleFeatureClick = (title: string) => {
    if (title === 'AI Workout Plans') {
      setWorkoutModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] bg-neon/[0.04] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fire/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-bg-border bg-bg-secondary/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-gradient flex items-center justify-center shadow-neon-sm">
              <span className="text-bg-primary font-black text-lg font-display">F</span>
            </div>
            <span className="font-display font-black text-xl gradient-text">FitAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/50">
            {['Features', 'Stack', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-white/60 hover:text-white transition-colors text-sm font-medium px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="badge badge-neon mb-8 inline-flex">
            <MdBolt /> Powered by MediaPipe + scikit-learn AI
          </span>

          <h1 className="font-display font-black text-5xl md:text-7xl xl:text-8xl leading-[1.05] mb-6 tracking-tight">
            Train Smarter with
            <br />
            <span className="gradient-text animate-glow">Artificial Intelligence</span>
          </h1>

          <p className="text-white/45 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Real-time posture correction · AI workout plans · Calorie prediction ·
            BMI analysis · Personalized diet plans — all in one premium app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="btn-primary text-base px-8 py-4 gap-2">
              Start Training Free <MdArrowForward />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-10">
            {STATS.map(({ val, label }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
                <div className="font-display font-black text-4xl text-neon">{val}</div>
                <div className="text-white/35 text-sm mt-1">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
        <SectionHeader 
          title="AI-Powered Fitness Ecosystem" 
          subtitle="Advanced machine learning models powering your personal AI trainer."
          highlight="Fitness Ecosystem"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={i * 0.1}
              badge={feature.title === 'AI Workout Plans' ? 'ML Powered' : undefined}
              ctaText={feature.title === 'AI Workout Plans' ? 'Generate Plan' : undefined}
              onCtaClick={feature.title === 'AI Workout Plans' ? () => handleFeatureClick(feature.title) : undefined}
            />
          ))}
        </div>
      </section>

      <WorkoutPlanModal open={isWorkoutModalOpen} onClose={() => setWorkoutModalOpen(false)} />

      {/* Tech stack */}
      <section id="stack" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="glass p-8 md:p-12 text-center">
          <h2 className="font-display font-bold text-3xl mb-8">Built with <span className="gradient-text">Modern Stack</span></h2>
          <div className="flex flex-wrap justify-center gap-3">
            {STACK.map(tech => (
              <span key={tech} className="badge badge-neon text-sm px-4 py-2">
                <MdCheck size={12} /> {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-neon p-12 rounded-3xl">
          <MdAutoAwesome className="text-neon text-5xl mx-auto mb-4" />
          <h2 className="font-display font-black text-4xl mb-4">Ready to <span className="text-neon animate-glow">Level Up?</span></h2>
          <p className="text-white/50 mb-8 max-w-sm mx-auto">Join and start training with AI-powered precision today. Free forever.</p>
          <Link to="/register" className="btn-primary inline-flex text-base px-10 py-4">
            Get Started Free <MdArrowForward />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border py-8 text-center text-white/20 text-sm">
        © 2026 FitAI · React + FastAPI + MediaPipe + scikit-learn
      </footer>
    </div>
  )
}
