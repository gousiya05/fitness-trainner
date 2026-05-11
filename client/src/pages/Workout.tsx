import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdFitnessCenter, MdAutoAwesome, MdRefresh, MdSave,
  MdLocalFireDepartment, MdCheckCircle, MdTimer, MdPsychology,
  MdTrendingUp, MdInfo
} from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { workoutService } from '@/services/workoutService'
import { workoutApi } from '@/api/workout'
import { GOALS, ACTIVITY_LEVELS, FITNESS_LEVELS, GENDERS } from '@/utils/constants'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Workout() {
  const { user } = useAuth()
  const [aiPlan, setAiPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  
  const [form, setForm] = useState({
    age: user?.profile?.age || 25,
    weight: user?.profile?.weight || 70,
    height: user?.profile?.height || 175,
    gender: user?.profile?.gender || 'male',
    goal: user?.profile?.goal || 'general',
    activity_level: user?.profile?.activityLevel || 'moderate',
    experience: user?.profile?.fitnessLevel || 'beginner',
  })

  const steps = [
    "Analyzing physiological data...",
    "Training neural fitness engine...",
    "Optimizing exercise selection...",
    "Finalizing personalized plan..."
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setGenerationStep(prev => (prev + 1) % steps.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const validateForm = () => {
    if (form.age < 16 || form.age > 100) {
      toast.error('Please enter a valid age (16-100)')
      return false
    }
    if (form.weight < 30 || form.weight > 300) {
      toast.error('Please enter a valid weight (30-300kg)')
      return false
    }
    if (form.height < 100 || form.height > 250) {
      toast.error('Please enter a valid height (100-250cm)')
      return false
    }
    return true
  }

  const generate = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setAiPlan(null)
    setGenerationStep(0)
    
    try {
      const data = await workoutService.generatePlan(form as any)
      if (data.success) {
        setAiPlan(data.plan)
        toast.success('AI Plan generated successfully! 🔥')
      } else {
        throw new Error('Failed to generate plan')
      }
    } catch (err: any) {
      toast.error(err.message || 'Connection to AI server failed')
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async () => {
    if (!aiPlan) return
    setSaving(true)
    try {
      // Mapping the AI plan to the backend storage format
      const exercises = aiPlan.weekly_schedule.flatMap((day: any) => 
        day.exercises.map((exName: string) => ({
          name: exName,
          sets: 3,
          reps: 12,
          rest: 60,
          muscle: day.focus,
          calories: 10
        }))
      )

      await workoutApi.save({
        title: `AI ${aiPlan.goal} Plan`,
        exercises: exercises.slice(0, 8), // Save first 8 exercises
        goal: form.goal as any,
        totalCalories: aiPlan.calories_target,
        aiGenerated: true,
      })
      toast.success('Workout saved to your history! 💪')
    } catch {
      toast.error('Failed to save workout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-bold uppercase tracking-widest mb-4"
        >
          <MdPsychology className="text-sm" /> AI Neural Engine v2.0
        </motion.div>
        <h1 className="font-display font-black text-3xl md:text-5xl">
          Personalized <span className="gradient-text">AI Workouts</span>
        </h1>
        <p className="text-white/40 mt-2 text-base md:text-lg max-w-2xl">
          Our Random Forest ML model analyzes your biometrics to generate the most effective training split for your goals.
        </p>
      </div>

      {/* Form Card */}
      <Card className="!p-6 md:!p-8 overflow-hidden relative border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <MdFitnessCenter className="text-9xl" />
        </div>
        
        <div className="relative z-10">
          <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
            <MdAutoAwesome className="text-neon" /> Configure Biometrics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Input
              label="Age"
              type="number"
              value={form.age}
              onChange={e => setForm(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
              placeholder="e.g. 25"
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={form.weight}
              onChange={e => setForm(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 70"
            />
            <Input
              label="Height (cm)"
              type="number"
              value={form.height}
              onChange={e => setForm(p => ({ ...p, height: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 175"
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
              options={GENDERS.map(g => ({ value: g.value, label: g.label }))}
            />
            <Select
              label="Fitness Goal"
              value={form.goal}
              onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
              options={GOALS.map(g => ({ value: g.value, label: `${g.emoji} ${g.label}` }))}
            />
            <Select
              label="Activity Level"
              value={form.activity_level}
              onChange={e => setForm(p => ({ ...p, activity_level: e.target.value }))}
              options={ACTIVITY_LEVELS.map(a => ({ value: a.value, label: a.label }))}
            />
            <Select
              label="Experience"
              value={form.experience}
              onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
              options={FITNESS_LEVELS.map(f => ({ value: f.value, label: f.label }))}
              wrapperClass="md:col-span-2"
            />
          </div>

          <Button 
            onClick={generate} 
            loading={loading} 
            size="lg"
            className="w-full md:w-auto px-10 h-14 text-lg shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-all"
            icon={<MdAutoAwesome />}
          >
            Execute ML Generation
          </Button>
        </div>
      </Card>

      {/* Loading Experience */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-neon/10 border-t-neon animate-spin" />
              <MdPsychology className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-neon animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-white tracking-wide">
                {steps[generationStep]}
              </h3>
              <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                <motion.div 
                  className="h-full bg-neon shadow-[0_0_10px_#00ff87]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "linear" }}
                />
              </div>
              <p className="text-white/30 text-sm italic">Simulating metabolic outcomes...</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mt-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Dashboard */}
      <AnimatePresence>
        {aiPlan && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Banner */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass-card p-6 md:p-10 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 rounded-lg bg-neon/20 text-neon text-[10px] font-black uppercase tracking-widest border border-neon/30">
                      ML Confidence: {aiPlan.ai_confidence}%
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/10">
                      Tier: {aiPlan.difficulty}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black">
                    Your <span className="text-neon">{aiPlan.goal}</span> Protocol
                  </h2>
                  <p className="text-white/50 text-sm max-w-md">
                    Targeting optimal hypertrophic response and metabolic efficiency based on your 
                    {form.activity_level} activity profile.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center min-w-[140px]">
                    <MdLocalFireDepartment className="text-fire text-2xl mx-auto mb-1" />
                    <p className="text-2xl font-display font-black text-white">{aiPlan.calories_target}</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Daily Target Kcal</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center min-w-[140px]">
                    <MdTimer className="text-neon text-2xl mx-auto mb-1" />
                    <p className="text-2xl font-display font-black text-white">{aiPlan.recommended_duration}</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Session Length</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Split */}
            <div>
              <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <MdTrendingUp className="text-neon" /> Weekly Training Split
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiPlan.weekly_schedule.map((day: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card variant="dark" className="h-full border-neon/10 hover:border-neon/30 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-black text-neon uppercase tracking-tighter">{day.day}</span>
                        <div className="p-2 rounded-xl bg-neon/10 text-neon group-hover:scale-110 transition-transform">
                          <MdFitnessCenter />
                        </div>
                      </div>
                      <h4 className="font-display font-bold text-lg mb-4 text-white/90">{day.focus}</h4>
                      <div className="space-y-2">
                        {day.exercises.map((ex: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-white/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon/30" />
                            {ex}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-neon/10 flex items-center justify-center shrink-0">
                <MdInfo className="text-2xl text-neon" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white/90">Neural Fitness Insight</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Focus on controlled eccentric movements for the first two weeks. Your current 
                  weight/height ratio suggests high mechanical tension will yield the best {aiPlan.goal.toLowerCase()} 
                  results. Ensure 48h recovery between same-muscle sessions.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={savePlan} loading={saving} size="lg" className="flex-1 h-14" icon={<MdSave />}>
                Save Plan to Profile
              </Button>
              <Button onClick={generate} variant="secondary" size="lg" className="flex-1 h-14" icon={<MdRefresh />}>
                Regenerate Plan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!aiPlan && !loading && (
        <div className="text-center py-20 px-6 rounded-3xl border-2 border-dashed border-white/5">
          <MdAutoAwesome className="text-7xl mx-auto mb-6 text-white/5" />
          <h3 className="text-xl font-display font-bold text-white/20">Awaiting Generation Input</h3>
          <p className="text-white/10 mt-2 max-w-sm mx-auto">
            Your high-performance training protocol is one click away. Fill out the form above to start.
          </p>
        </div>
      )}
    </div>
  )
}
