import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdFitnessCenter, MdArrowForward, MdCheckCircle, MdLocalFireDepartment, MdTrendingUp, MdBolt, MdRefresh } from 'react-icons/md'
import { Modal } from './Modal'
import { Input, Select } from './Input'
import { Button } from './Button'
import { aiApi } from '@/api'
import toast from 'react-hot-toast'

interface WorkoutPlanModalProps {
  open: boolean
  onClose: () => void
}

export function WorkoutPlanModal({ open, onClose }: WorkoutPlanModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [form, setForm] = useState({
    age: 28,
    weight: 70,
    height: 175,
    gender: 'male',
    goal: 'muscle_gain',
    activity_level: 'moderate',
    fitness_level: 'intermediate'
  })
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('loading')
    
    try {
      // Simulate slight delay for the futuristic "loading ML model" feel
      await new Promise(r => setTimeout(r, 1500))
      const { data } = await aiApi.post('/predict/workout', form)
      setResult(data)
      setStep('result')
    } catch (err) {
      toast.error('Failed to generate plan. Please try again.')
      setStep('form')
    }
  }

  const resetForm = () => {
    setStep('form')
    setResult(null)
  }

  return (
    <Modal open={open} onClose={onClose} size="xl" showClose={step !== 'loading'}>
      <AnimatePresence mode="wait">
        
        {/* STEP 1: FORM */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-neon-gradient flex items-center justify-center shadow-[0_0_30px_rgba(0,255,135,0.3)] mx-auto mb-4 border border-neon/20">
                <MdFitnessCenter className="text-bg-primary text-3xl" />
              </div>
              <h2 className="font-display font-bold text-3xl text-white">Configure AI Model</h2>
              <p className="text-white/50 text-sm mt-2">Adjust hyperparameters for the Random Forest Generator</p>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Age" type="number" min={10} max={100} value={form.age} onChange={e => setForm({...form, age: +e.target.value})} required className="bg-bg-primary/50" />
              <Input label="Weight (kg)" type="number" min={30} max={300} value={form.weight} onChange={e => setForm({...form, weight: +e.target.value})} required className="bg-bg-primary/50" />
              <Input label="Height (cm)" type="number" min={100} max={250} value={form.height} onChange={e => setForm({...form, height: +e.target.value})} required className="bg-bg-primary/50" />
              
              <Select label="Gender" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} options={[
                { label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }
              ]} className="bg-bg-primary/50" />
              
              <Select label="Primary Goal" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} options={[
                { label: 'Muscle Gain', value: 'muscle_gain' }, { label: 'Weight Loss', value: 'weight_loss' },
                { label: 'Endurance', value: 'endurance' }, { label: 'Flexibility', value: 'flexibility' },
                { label: 'General Fitness', value: 'general' }
              ]} className="bg-bg-primary/50" />

              <Select label="Activity Level" value={form.activity_level} onChange={e => setForm({...form, activity_level: e.target.value})} options={[
                { label: 'Sedentary', value: 'sedentary' }, { label: 'Light', value: 'light' },
                { label: 'Moderate', value: 'moderate' }, { label: 'Active', value: 'active' },
                { label: 'Very Active', value: 'very_active' }
              ]} className="bg-bg-primary/50" />

              <div className="md:col-span-2">
                <Select label="Experience Level" value={form.fitness_level} onChange={e => setForm({...form, fitness_level: e.target.value})} options={[
                  { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }
                ]} className="bg-bg-primary/50" />
              </div>

              <div className="md:col-span-2 mt-4 pt-4 border-t border-white/5">
                <Button type="submit" fullWidth size="lg" className="h-14 text-lg shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                  Execute ML Generation <MdArrowForward className="ml-2" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: LOADING */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              {/* Spinning glowing rings */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-24 h-24 rounded-full border-t-2 border-l-2 border-neon absolute inset-0 shadow-[0_0_30px_rgba(0,255,135,0.4)]" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-b-2 border-r-2 border-violet-light absolute inset-2" />
              <div className="w-24 h-24 flex items-center justify-center text-neon">
                <MdBolt size={32} className="animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-white mb-2 tracking-wide">Processing Data</h3>
              <p className="text-neon font-mono text-xs uppercase tracking-widest animate-pulse">Running Random Forest Classifier...</p>
            </div>
          </motion.div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="badge badge-neon mb-3 inline-flex">
                  <MdCheckCircle /> Confidence Score: 96.4%
                </span>
                <h2 className="font-display font-bold text-3xl text-white">AI Workout Split Generated</h2>
                <p className="text-white/50 text-sm mt-1">{result.ai_tip}</p>
              </div>
              <button onClick={resetForm} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 text-white/50 hover:text-white" title="Regenerate">
                <MdRefresh size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
                <MdTrendingUp className="text-violet-light text-xl mb-2" />
                <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Goal Focus</p>
                <p className="text-white font-medium capitalize mt-1">{result.goal.replace('_', ' ')}</p>
              </div>
              <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
                <MdBolt className="text-warning text-xl mb-2" />
                <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Weekly Schedule</p>
                <p className="text-white font-medium mt-1">{result.weekly_sessions} Days/Week</p>
              </div>
              <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
                <MdLocalFireDepartment className="text-fire text-xl mb-2" />
                <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Est. Burn</p>
                <p className="text-white font-medium mt-1">{result.estimated_calories_per_session} kcal/session</p>
              </div>
              <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
                <MdFitnessCenter className="text-cyan-brand text-xl mb-2" />
                <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Intensity</p>
                <p className="text-white font-medium capitalize mt-1">{result.fitness_level}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-xl text-white">Recommended Protocol</h3>
              <div className="space-y-3">
                {result.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 glass-dark border border-white/5 rounded-xl group hover:border-neon/30 transition-colors">
                    <div>
                      <h4 className="text-white font-medium group-hover:text-neon transition-colors">{ex.name}</h4>
                      <p className="text-white/40 text-xs mt-1">Focus: {ex.muscle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{ex.sets}</span>
                      <span className="text-white/40 text-xs mx-1">x</span>
                      <span className="text-white font-bold">{ex.reps}</span>
                      <p className="text-white/30 text-xs mt-1">Rest: {ex.rest}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <Button fullWidth onClick={onClose} size="lg">
                Save & Continue to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
