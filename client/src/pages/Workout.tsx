import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdFitnessCenter, MdAutoAwesome, MdRefresh, MdSave,
  MdLocalFireDepartment, MdCheckCircle,
} from 'react-icons/md'
import { workoutApi } from '@/api/workout'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ExerciseCard } from '@/components/fitness/WorkoutCard'
import type { WorkoutPlan, Exercise, FitnessGoal, ActivityLevel, FitnessLevel } from '@/types'
import { GOALS, ACTIVITY_LEVELS, FITNESS_LEVELS } from '@/utils/constants'
import toast from 'react-hot-toast'

const GOAL_COLORS: Record<string, string> = {
  weight_loss: '#ff6b35', muscle_gain: '#00ff87',
  endurance: '#06b6d4', flexibility: '#a78bfa', general: '#fbbf24',
}

export default function Workout() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    goal:           (user?.profile?.goal         || 'general')     as FitnessGoal,
    activity_level: (user?.profile?.activityLevel || 'moderate')   as ActivityLevel,
    fitness_level:  (user?.profile?.fitnessLevel  || 'beginner')   as FitnessLevel,
  })

  const generate = async () => {
    setLoading(true); setPlan(null)
    try {
      const { data } = await workoutApi.recommend()
      setPlan(data)
      setExercises(data.exercises.map(e => ({ ...e, completed: false })))
      toast.success('AI workout generated! 🔥')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate plan')
    } finally {
      setLoading(false) }
  }

  const toggleComplete = (idx: number) => {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, completed: !e.completed } : e))
  }

  const savePlan = async () => {
    if (!plan) return
    setSaving(true)
    try {
      await workoutApi.save({
        title: `AI ${plan.goal.replace('_', ' ')} Plan`,
        exercises: exercises,
        goal: plan.goal,
        totalCalories: plan.estimated_calories_per_session,
        aiGenerated: true,
      })
      toast.success('Workout saved to your history! 💪')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const completedCount = exercises.filter(e => e.completed).length
  const goalColor = GOAL_COLORS[form.goal] || '#00ff87'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
          <MdAutoAwesome className="text-neon" /> AI Workout <span className="gradient-text">Generator</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">Random Forest ML creates your personalized training plan.</p>
      </div>

      {/* Controls */}
      <Card className="!p-5 md:!p-6">
        <h2 className="font-semibold text-sm text-white/60 mb-4 uppercase tracking-wider">Customize Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Select
            label="Goal"
            value={form.goal}
            onChange={e => setForm(p => ({ ...p, goal: e.target.value as FitnessGoal }))}
            options={GOALS.map(g => ({ value: g.value, label: `${g.emoji} ${g.label}` }))}
          />
          <Select
            label="Activity Level"
            value={form.activity_level}
            onChange={e => setForm(p => ({ ...p, activity_level: e.target.value as ActivityLevel }))}
            options={ACTIVITY_LEVELS.map(a => ({ value: a.value, label: a.label }))}
          />
          <Select
            label="Fitness Level"
            value={form.fitness_level}
            onChange={e => setForm(p => ({ ...p, fitness_level: e.target.value as FitnessLevel }))}
            options={FITNESS_LEVELS.map(f => ({ value: f.value, label: f.label }))}
          />
        </div>
        <Button onClick={generate} loading={loading} icon={<MdAutoAwesome />}>
          Generate AI Plan
        </Button>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      )}

      {/* Plan result */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Plan summary */}
            <div className="glass p-5 md:p-6" style={{ borderColor: `${goalColor}25` }}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <span className="badge mb-2" style={{ background: `${goalColor}15`, color: goalColor, borderColor: `${goalColor}30` }}>
                    AI-Generated Plan
                  </span>
                  <h2 className="font-display font-bold text-xl capitalize">
                    {plan.goal.replace('_', ' ')} · {plan.fitness_level}
                  </h2>
                </div>
                <div className="flex gap-5 text-center">
                  <div><p className="font-display font-black text-3xl text-neon">{plan.weekly_sessions}</p><p className="text-white/35 text-xs">sessions/wk</p></div>
                  <div><p className="font-display font-black text-3xl text-fire">{plan.estimated_calories_per_session}</p><p className="text-white/35 text-xs">kcal/session</p></div>
                  <div><p className="font-display font-black text-3xl text-white">{exercises.length}</p><p className="text-white/35 text-xs">exercises</p></div>
                </div>
              </div>

              {/* Progress bar */}
              {completedCount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>Session progress</span>
                    <span>{completedCount}/{exercises.length} completed</span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      style={{ background: goalColor, width: `${(completedCount / exercises.length) * 100}%` }}
                      animate={{ width: `${(completedCount / exercises.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {plan.ai_tip && (
                <div className="p-3 rounded-xl bg-black/25 text-sm text-white/55 flex gap-2">
                  <MdAutoAwesome className="text-neon shrink-0 mt-0.5" /> {plan.ai_tip}
                </div>
              )}
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={ex} index={i} onComplete={toggleComplete} />
              ))}
            </div>

            {/* Diet suggestions */}
            <Card variant="dark" className="!p-5">
              <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
                <MdLocalFireDepartment className="text-fire" /> AI Diet Suggestions
              </h3>
              <ul className="space-y-2">
                {plan.diet_suggestions.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/55">
                    <MdCheckCircle className="text-neon shrink-0 mt-0.5" /> {tip}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Save */}
            <div className="flex gap-3">
              <Button onClick={generate} variant="secondary" icon={<MdRefresh />}>Regenerate</Button>
              <Button onClick={savePlan} loading={saving} icon={<MdSave />}>Save Workout</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!plan && !loading && (
        <div className="text-center py-20 text-white/20">
          <MdFitnessCenter className="text-7xl mx-auto mb-4 opacity-20" />
          <p className="text-lg">Configure your preferences above and hit <span className="text-neon/60">Generate AI Plan</span></p>
        </div>
      )}
    </div>
  )
}
