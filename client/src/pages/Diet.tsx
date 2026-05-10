import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdRestaurant, MdAutoAwesome, MdCheckCircle, MdRefresh, MdLocalFireDepartment } from 'react-icons/md'
import { aiApi } from '@/api/index'
import { Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { DietPlan, DietMeal, FitnessGoal, ActivityLevel } from '@/types'
import { GOALS, ACTIVITY_LEVELS, MEAL_TIMES } from '@/utils/constants'
import toast from 'react-hot-toast'

// ─── Mock fallback diet ───────────────────────────────────────────────
const MOCK_DIET: DietPlan = {
  goal: 'general', calorie_target: 2100, protein_g: 150, carbs_g: 230, fat_g: 75,
  meals: [
    { time: 'breakfast', name: 'Power Breakfast', items: ['3 eggs scrambled', 'Oatmeal 80g', '1 banana', 'Green tea'], calories: 520, protein: 32, carbs: 65, fat: 16 },
    { time: 'lunch', name: 'Lean Lunch', items: ['200g grilled chicken', 'Brown rice 150g', 'Mixed salad', 'Olive oil dressing'], calories: 680, protein: 52, carbs: 70, fat: 18 },
    { time: 'snack', name: 'Afternoon Boost', items: ['Greek yogurt 200g', '1 apple', '20g almonds'], calories: 320, protein: 22, carbs: 38, fat: 12 },
    { time: 'dinner', name: 'Recovery Dinner', items: ['200g salmon', 'Sweet potato 200g', 'Broccoli', 'Lemon juice'], calories: 580, protein: 44, carbs: 57, fat: 29 },
  ],
  tips: ['Eat protein within 30 min of training', 'Drink 3L water daily', 'Avoid processed sugar', 'Meal prep on Sundays'],
  foods_to_eat: ['Lean proteins', 'Complex carbs', 'Healthy fats', 'Leafy greens', 'Berries', 'Nuts & seeds'],
  foods_to_avoid: ['Processed foods', 'Sugary drinks', 'Trans fats', 'Alcohol', 'Refined carbs'],
  supplements: ['Whey protein', 'Creatine monohydrate', 'Vitamin D3', 'Omega-3 fish oil'],
}

const MACRO_COLORS = { protein: '#00ff87', carbs: '#7c3aed', fat: '#ff6b35' }

function MacroRing({ protein, carbs, fat, total }: { protein: number; carbs: number; fat: number; total: number }) {
  const pCal = protein * 4, cCal = carbs * 4, fCal = fat * 9
  const tCal = pCal + cCal + fCal
  return (
    <div className="space-y-2">
      {[
        { label: 'Protein', value: protein, cal: pCal, color: '#00ff87', unit: 'g' },
        { label: 'Carbs',   value: carbs,   cal: cCal, color: '#7c3aed', unit: 'g' },
        { label: 'Fat',     value: fat,     cal: fCal, color: '#ff6b35', unit: 'g' },
      ].map(({ label, value, cal, color, unit }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">{label}</span>
            <span className="font-bold" style={{ color }}>{value}{unit} <span className="text-white/25">({Math.round((cal/tCal)*100)}%)</span></span>
          </div>
          <div className="progress-track">
            <motion.div className="progress-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${(cal/tCal)*100}%` }} transition={{ duration: 1.2 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MealCard({ meal, index }: { meal: DietMeal; index: number }) {
  const mt = MEAL_TIMES.find(t => t.value === meal.time)!
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mt?.icon}</span>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">{mt?.label}</p>
            <h3 className="font-display font-semibold text-base">{meal.name}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-fire text-lg">{meal.calories}</p>
          <p className="text-white/30 text-xs">kcal</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {meal.items.map((item, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/60">{item}</span>
        ))}
      </div>
      <div className="flex gap-4 text-xs">
        {[
          { l: 'P', v: meal.protein, c: '#00ff87' },
          { l: 'C', v: meal.carbs,   c: '#7c3aed' },
          { l: 'F', v: meal.fat,     c: '#ff6b35' },
        ].map(({ l, v, c }) => (
          <span key={l} className="font-mono font-bold" style={{ color: c }}>{l}: {v}g</span>
        ))}
      </div>
    </motion.div>
  )
}

export default function Diet() {
  const [plan, setPlan] = useState<DietPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ goal: 'general' as FitnessGoal, activity_level: 'moderate' as ActivityLevel })

  const generate = async () => {
    setLoading(true); setPlan(null)
    try {
      const { data } = await aiApi.post<DietPlan>('/predict/diet', form)
      setPlan(data)
      toast.success('AI diet plan ready! 🥗')
    } catch {
      setPlan({ ...MOCK_DIET, goal: form.goal })
      toast('Using sample plan — connect AI service for personalized diets', { icon: 'ℹ️' })
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
          <MdRestaurant className="text-violet-light" /> Diet <span className="gradient-text">Recommendations</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">AI-curated meal plans with macro targets and nutrition guidance.</p>
      </div>

      {/* Controls */}
      <Card>
        <h2 className="font-semibold text-sm text-white/60 uppercase tracking-wider mb-4">Personalize Your Plan</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Select label="Fitness Goal" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value as FitnessGoal }))} options={GOALS.map(g => ({ value: g.value, label: `${g.emoji} ${g.label}` }))} />
          <Select label="Activity Level" value={form.activity_level} onChange={e => setForm(p => ({ ...p, activity_level: e.target.value as ActivityLevel }))} options={ACTIVITY_LEVELS.map(a => ({ value: a.value, label: a.label }))} />
        </div>
        <Button onClick={generate} loading={loading} icon={<MdAutoAwesome />}>Generate Diet Plan</Button>
      </Card>

      {/* Loading */}
      {loading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>}

      <AnimatePresence>
        {plan && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Summary */}
            <Card variant="neon" className="!p-5 md:!p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                <div>
                  <span className="badge badge-neon mb-2 inline-flex">AI-Generated Plan</span>
                  <h2 className="font-display font-bold text-xl capitalize">{plan.goal.replace('_',' ')} Diet</h2>
                  <p className="text-white/40 text-sm mt-1">Daily Target: <span className="text-neon font-bold">{plan.calorie_target} kcal</span></p>
                </div>
                <div className="flex gap-5 text-center">
                  {[
                    { l: 'Protein', v: plan.protein_g, c: '#00ff87' },
                    { l: 'Carbs',   v: plan.carbs_g, c: '#7c3aed' },
                    { l: 'Fat',     v: plan.fat_g, c: '#ff6b35' },
                  ].map(({ l, v, c }) => (
                    <div key={l}>
                      <p className="font-display font-black text-2xl" style={{ color: c }}>{v}g</p>
                      <p className="text-white/35 text-xs">{l}/day</p>
                    </div>
                  ))}
                </div>
              </div>
              <MacroRing protein={plan.protein_g} carbs={plan.carbs_g} fat={plan.fat_g} total={plan.calorie_target} />
            </Card>

            {/* Meals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.meals.map((meal, i) => <MealCard key={i} meal={meal} index={i} />)}
            </div>

            {/* Foods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="dark" className="!p-5">
                <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2 text-neon">
                  <MdCheckCircle /> Foods to Eat
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.foods_to_eat.map((f, i) => <span key={i} className="badge badge-neon">{f}</span>)}
                </div>
              </Card>
              <Card variant="dark" className="!p-5">
                <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2 text-danger">
                  <MdLocalFireDepartment /> Foods to Avoid
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.foods_to_avoid.map((f, i) => <span key={i} className="badge badge-fire text-xs">{f}</span>)}
                </div>
              </Card>
            </div>

            {/* Tips & supplements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="!p-5">
                <h3 className="font-display font-semibold text-sm mb-3">💡 Nutrition Tips</h3>
                <ul className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/55">
                      <span className="text-neon">→</span> {tip}
                    </li>
                  ))}
                </ul>
              </Card>
              {plan.supplements && (
                <Card className="!p-5">
                  <h3 className="font-display font-semibold text-sm mb-3">💊 Supplements</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.supplements.map((s, i) => <span key={i} className="badge badge-violet">{s}</span>)}
                  </div>
                </Card>
              )}
            </div>

            <Button onClick={generate} variant="secondary" icon={<MdRefresh />}>Regenerate Plan</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!plan && !loading && (
        <div className="text-center py-20 text-white/20">
          <MdRestaurant className="text-7xl mx-auto mb-4 opacity-20" />
          <p>Select your goal and generate an AI diet plan</p>
        </div>
      )}
    </div>
  )
}
