import { useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell } from 'recharts'
import { MdLocalFireDepartment, MdAdd, MdCalculate, MdWaterDrop, MdDelete } from 'react-icons/md'
import { caloriesApi } from '@/api/calories'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import type { Meal, MealTime, CaloriePrediction } from '@/types'
import { MEAL_TIMES, EXERCISE_TYPES, INTENSITIES, DEFAULT_CALORIE_GOAL } from '@/utils/constants'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const INITIAL_MEALS: Meal[] = [
  { name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 58, fat: 8, time: 'breakfast' },
  { name: 'Grilled Chicken Salad', calories: 480, protein: 42, carbs: 22, fat: 18, time: 'lunch' },
  { name: 'Protein Shake', calories: 200, protein: 28, carbs: 14, fat: 4, time: 'snack' },
]

export default function Calories() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS)
  const [mealForm, setMealForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', time: 'snack' as MealTime })
  const [water, setWater] = useState(1750)
  const [prediction, setPrediction] = useState<CaloriePrediction | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [exForm, setExForm] = useState({ exercise_type: 'cardio', duration: '30', intensity: 'moderate' })
  const GOAL = DEFAULT_CALORIE_GOAL

  const totalConsumed = meals.reduce((s, m) => s + m.calories, 0)
  const remaining = GOAL - totalConsumed

  const addMeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mealForm.name || !mealForm.calories) { toast.error('Fill in name and calories'); return }
    setMeals(p => [...p, { ...mealForm, calories: +mealForm.calories, protein: +mealForm.protein || 0, carbs: +mealForm.carbs || 0, fat: +mealForm.fat || 0 }])
    setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '', time: 'snack' })
    toast.success('Meal logged! 🍽️')
  }

  const removeMeal = (idx: number) => { setMeals(p => p.filter((_, i) => i !== idx)) }

  const predictBurn = async () => {
    setPredicting(true)
    try {
      const { data } = await caloriesApi.predict({
        weight: user?.profile?.weight || 70, height: user?.profile?.height || 170,
        age: user?.profile?.age || 25, gender: user?.profile?.gender || 'male',
        exercise_type: exForm.exercise_type, duration_minutes: +exForm.duration, intensity: exForm.intensity,
      })
      setPrediction(data)
    } catch {
      const met: Record<string, Record<string, number>> = {
        cardio: { low: 4.5, moderate: 7, high: 10 }, running: { low: 6, moderate: 9.8, high: 13 },
        hiit: { low: 7, moderate: 9, high: 12 }, strength: { low: 3.5, moderate: 5, high: 6.5 },
        yoga: { low: 2.5, moderate: 3.5, high: 4.5 }, cycling: { low: 4, moderate: 6.8, high: 10 }, swimming: { low: 5, moderate: 7, high: 9 },
      }
      const m = (met[exForm.exercise_type] || met.cardio)[exForm.intensity]
      setPrediction({ calories_burned: Math.round(m * 70 * (+exForm.duration / 60)), bmr: 1800, daily_calories_needed: 2500, exercise_type: exForm.exercise_type as any, duration_minutes: +exForm.duration, intensity: exForm.intensity as any, met_value: m })
    } finally { setPredicting(false) }
  }

  const pieData = [
    { name: 'Consumed', value: Math.min(totalConsumed, GOAL), color: '#7c3aed' },
    { name: 'Remaining', value: Math.max(remaining, 0), color: 'rgba(255,255,255,0.06)' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
          <MdLocalFireDepartment className="text-fire" /> Calories <span className="gradient-text">Tracker</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">Log meals · Predict calorie burn · Track nutrition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!p-5 flex flex-col items-center">
          <div className="relative">
            <PieChart width={140} height={140}>
              <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={68} strokeWidth={0} startAngle={90} endAngle={-270}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-2xl">{totalConsumed}</span>
              <span className="text-white/30 text-xs">/ {GOAL}</span>
            </div>
          </div>
          <span className={clsx('text-sm font-bold mt-1', remaining >= 0 ? 'text-neon' : 'text-danger')}>
            {remaining >= 0 ? `${remaining} kcal left` : `${-remaining} kcal over`}
          </span>
        </Card>

        <Card className="!p-5 md:col-span-2 space-y-3">
          {[
            { label: 'Consumed',  value: totalConsumed, color: '#7c3aed', max: GOAL, unit: 'kcal' },
            { label: 'Protein',   value: meals.reduce((s,m) => s+(m.protein||0),0), color: '#00ff87', max: 150, unit: 'g' },
            { label: 'Carbs',     value: meals.reduce((s,m) => s+(m.carbs||0),0), color: '#ff6b35', max: 300, unit: 'g' },
            { label: 'Fat',       value: meals.reduce((s,m) => s+(m.fat||0),0), color: '#fbbf24', max: 100, unit: 'g' },
          ].map(({ label, value, color, max, unit }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/50">{label}</span>
                <span className="font-bold" style={{ color }}>{value} <span className="text-white/25 font-normal">{unit}</span></span>
              </div>
              <div className="progress-track">
                <motion.div className="progress-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.min((value/max)*100,100)}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          ))}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-white/50 flex items-center gap-1"><MdWaterDrop className="text-cyan-brand" /> Water</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setWater(w => Math.max(0,w-250))} className="w-5 h-5 rounded-full glass text-white/40 hover:text-white flex items-center justify-center">−</button>
                <span className="font-bold text-cyan-brand">{water}ml</span>
                <button onClick={() => setWater(w => w+250)} className="w-5 h-5 rounded-full glass text-white/40 hover:text-white flex items-center justify-center">+</button>
              </div>
            </div>
            <div className="progress-track"><motion.div className="progress-fill bg-cyan-brand" animate={{ width: `${Math.min((water/3000)*100,100)}%` }} /></div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display font-semibold text-base mb-4">Today's Meals</h2>
        <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
          {meals.map((meal, i) => {
            const mt = MEAL_TIMES.find(t => t.value === meal.time)!
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 group transition-colors">
                <span className="text-xl shrink-0">{mt?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{meal.name}</p>
                  <p className="text-white/30 text-xs">{mt?.label}</p>
                </div>
                <p className="font-bold text-fire text-sm shrink-0">{meal.calories} kcal</p>
                <button onClick={() => removeMeal(i)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-danger/15 text-danger/50 hover:text-danger transition-all flex items-center justify-center shrink-0">
                  <MdDelete size={14} />
                </button>
              </div>
            )
          })}
        </div>
        <div className="border-t border-bg-border pt-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Add Meal</p>
          <form onSubmit={addMeal} className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input placeholder="Meal name" value={mealForm.name} onChange={e => setMealForm(p => ({ ...p, name: e.target.value }))} className="md:col-span-2" />
              <Input type="number" placeholder="Calories" value={mealForm.calories} onChange={e => setMealForm(p => ({ ...p, calories: e.target.value }))} />
              <Select value={mealForm.time} onChange={e => setMealForm(p => ({ ...p, time: e.target.value as MealTime }))} options={MEAL_TIMES.map(m => ({ value: m.value, label: `${m.icon} ${m.label}` }))} />
            </div>
            <Button type="submit" size="sm" icon={<MdAdd />}>Add Meal</Button>
          </form>
        </div>
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
          <MdCalculate className="text-neon" /> AI Burn Predictor
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Select label="Exercise" value={exForm.exercise_type} onChange={e => setExForm(p => ({ ...p, exercise_type: e.target.value }))} options={EXERCISE_TYPES.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` }))} />
          <Input label="Duration (min)" type="number" placeholder="30" value={exForm.duration} onChange={e => setExForm(p => ({ ...p, duration: e.target.value }))} />
          <Select label="Intensity" value={exForm.intensity} onChange={e => setExForm(p => ({ ...p, intensity: e.target.value }))} options={INTENSITIES.map(i => ({ value: i.value, label: i.label }))} />
        </div>
        <Button onClick={predictBurn} loading={predicting} icon={<MdCalculate />}>Predict Burn</Button>
        {prediction && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-5 rounded-2xl bg-neon/5 border border-neon/15 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Burned', value: Math.round(prediction.calories_burned), color: '#00ff87' },
              { label: 'BMR',    value: prediction.bmr, color: '#7c3aed' },
              { label: 'Daily Goal', value: prediction.daily_calories_needed, color: '#ff6b35' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="font-display font-black text-3xl" style={{ color }}>{value}</p>
                <p className="text-white/30 text-xs mt-1">kcal · {label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </Card>
    </div>
  )
}
