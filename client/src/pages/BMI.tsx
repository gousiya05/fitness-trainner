import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdMonitorWeight, MdCalculate, MdCheckCircle, MdSave, MdTrendingDown, MdFileDownload, MdLocalFireDepartment, MdFitnessCenter } from 'react-icons/md'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { bmiApi } from '@/api/bmi'
import { aiApi } from '@/api'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChartCard, ChartTooltip } from '@/components/charts/ChartCard'
import type { BMIResult, BMIHistory } from '@/types'
import { BMI_RANGES } from '@/utils/constants'
import toast from 'react-hot-toast'

function BMIGauge({ bmi }: { bmi: number }) {
  const clamped = Math.min(Math.max(bmi, 10), 40)
  const pct = ((clamped - 10) / 30) * 100
  const color = BMI_RANGES.find(r => bmi >= r.min && bmi < r.max)?.color || '#dc2626'

  return (
    <div className="my-6">
      <div className="flex justify-between text-xs text-white/25 mb-2 px-1">
        {BMI_RANGES.map(r => <span key={r.label}>{r.min}</span>)}
        <span>40+</span>
      </div>
      <div className="h-4 rounded-full relative overflow-visible"
        style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399, #fbbf24, #f87171, #dc2626)' }}>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-bg-primary shadow-lg z-10"
          style={{ background: color, left: `${Math.min(Math.max(pct, 2), 98)}%`, boxShadow: `0 0 15px ${color}` }}
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(Math.max(pct, 2), 98)}%` }}
          transition={{ type: 'spring', damping: 22 }}
        />
      </div>
      <div className="flex justify-between text-xs mt-3 px-1">
        {BMI_RANGES.map(r => <span key={r.label} style={{ color: r.color }} className="font-medium">{r.label}</span>)}
      </div>
    </div>
  )
}

function CircularBMI({ bmi, color }: { bmi: number; color: string }) {
  const radius = 64; const circ = 2 * Math.PI * radius
  const pct = Math.min(Math.max(bmi / 40, 0), 1)
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={160} height={160} viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', bounce: 0.2 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute text-center flex flex-col items-center justify-center">
        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Score</p>
        <p className="font-display font-black text-4xl" style={{ color }}>{bmi}</p>
        <p className="text-white/30 text-xs mt-0.5">BMI</p>
      </div>
    </div>
  )
}

export default function BMI() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male' })
  const [result, setResult] = useState<BMIResult | null>(null)
  const [extraAi, setExtraAi] = useState<{ calories: any, workout: any } | null>(null)
  const [history, setHistory] = useState<BMIHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    bmiApi.getHistory().then(({ data }) => setHistory(data.metrics || [])).catch(() => {})
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.weight || +form.weight < 20) e.weight = 'Valid weight required'
    if (!form.height || +form.height < 50) e.height = 'Valid height required'
    if (!form.age || +form.age < 10)       e.age = 'Valid age required'
    return e
  }

  const calculate = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({}); setLoading(true); setExtraAi(null)
    
    try {
      const w = +form.weight; const h = +form.height; const a = +form.age
      
      // Parallel AI requests
      const [bmiRes, calRes, workRes] = await Promise.all([
        bmiApi.predict({ weight: w, height: h, age: a, gender: form.gender }),
        aiApi.post('/predict/calories', { weight: w, height: h, age: a, gender: form.gender, exercise_type: 'cardio', duration_minutes: 30, intensity: 'moderate' }).catch(() => null),
        aiApi.post('/predict/workout', { age: a, weight: w, height: h, gender: form.gender, goal: (w / ((h/100)**2)) > 25 ? 'weight_loss' : 'muscle_gain', activity_level: 'moderate', fitness_level: 'intermediate' }).catch(() => null)
      ])
      
      setResult(bmiRes.data)
      if (calRes && workRes) {
        setExtraAi({ calories: calRes.data, workout: workRes.data })
      }
      toast.success(`Analysis Complete: ${bmiRes.data.bmi}`)
    } catch {
      toast.error('AI Services unavailable. Using offline formulas.')
      const w = +form.weight, h = +form.height / 100
      const bmi = parseFloat((w / (h * h)).toFixed(1))
      const info = BMI_RANGES.find(r => bmi >= r.min && bmi < r.max) || BMI_RANGES[BMI_RANGES.length - 1]
      setResult({
        bmi, category: info.label as any, risk: 'Moderate', color: info.color,
        ideal_weight_range: { min: +(18.5 * h * h).toFixed(1), max: +(24.9 * h * h).toFixed(1), unit: 'kg' },
        advice: ['Drink more water', 'Stay active 3 times a week', 'Connect to AI for deeper insights'],
      })
    } finally { setLoading(false) }
  }

  const saveMeasurement = async () => {
    if (!result) return
    try {
      await bmiApi.save({ weight: +form.weight, height: +form.height, age: +form.age, gender: form.gender, bmi: result.bmi, bmiCategory: result.category })
      toast.success('Measurement saved to history!')
      bmiApi.getHistory().then(({ data }) => setHistory(data.metrics || []))
    } catch { toast.error('Failed to save data') }
  }

  const downloadReport = () => {
    if (!result) return
    let content = `FITAI HEALTH REPORT\n------------------\n`
    content += `Date: ${new Date().toLocaleDateString()}\n`
    content += `Stats: ${form.weight}kg, ${form.height}cm, Age ${form.age}, ${form.gender}\n\n`
    content += `BMI Score: ${result.bmi}\n`
    content += `Category: ${result.category}\n`
    content += `Risk Level: ${result.risk}\n`
    content += `Ideal Weight: ${result.ideal_weight_range.min} - ${result.ideal_weight_range.max} kg\n\n`
    content += `AI RECOMMENDATIONS:\n`
    result.advice.forEach(a => content += `- ${a}\n`)
    
    if (extraAi) {
      content += `\nNUTRITION TARGETS:\n`
      content += `Daily Calories: ${extraAi.calories.daily_calories_needed} kcal\n`
      content += `BMR: ${extraAi.calories.bmr} kcal\n`
      content += `\nSUGGESTED PROTOCOL:\n`
      extraAi.workout.exercises.slice(0, 3).forEach((e: any) => content += `- ${e.name} (${e.sets}x${e.reps})\n`)
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `FitAI_Report_${new Date().getTime()}.txt`
    a.click()
  }

  // Format history for chart
  const chartData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bmi: h.bmi,
    weight: h.weight
  })).reverse()

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
            <MdMonitorWeight className="text-cyan-brand" /> BMI <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-white/40 mt-1.5 text-sm">Predictive health analysis powered by Logistic Regression models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-white/10">
            <div className="mb-6 pb-4 border-b border-white/5">
              <h2 className="font-display font-semibold text-xl">Enter Biometrics</h2>
              <p className="text-xs text-white/40 mt-1">Required for accurate AI prediction</p>
            </div>
            <form onSubmit={calculate} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Weight (kg)" type="number" placeholder="70" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} error={errors.weight} className="bg-bg-primary/50" />
                <Input label="Height (cm)" type="number" placeholder="170" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} error={errors.height} className="bg-bg-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Age" type="number" placeholder="25" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} error={errors.age} className="bg-bg-primary/50" />
                <Select label="Gender" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} className="bg-bg-primary/50" />
              </div>
              <Button type="submit" loading={loading} fullWidth size="lg" className="h-14 mt-2">
                Analyze Metrics
              </Button>
            </form>
          </Card>

          {/* Quick Action when result is present */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Card className="border border-white/10 bg-gradient-to-br from-bg-card to-bg-primary">
                  <h3 className="font-display font-semibold text-base mb-4">Report Actions</h3>
                  <div className="flex flex-col gap-3">
                    <Button onClick={saveMeasurement} variant="secondary" icon={<MdSave />} fullWidth>Save to History</Button>
                    <Button onClick={downloadReport} className="bg-white/5 border border-white/10 hover:bg-white/10" icon={<MdFileDownload />} fullWidth>Download Full Report</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: AI Output Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {!result ? (
            <div className="h-full min-h-[400px] glass-dark border border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/30 p-8 text-center border-dashed">
              <MdMonitorWeight className="text-6xl mb-4 opacity-50" />
              <p className="text-lg font-medium text-white/50">Awaiting Biometric Data</p>
              <p className="text-sm mt-2 max-w-md">Enter your stats to generate a comprehensive health analysis, caloric recommendations, and risk assessment.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              
              {/* Top Stat Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="!p-8 relative overflow-hidden flex flex-col items-center text-center">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: result.color }} />
                  <CircularBMI bmi={result.bmi} color={result.color} />
                  <div className="mt-6 w-full">
                    <span className="badge text-sm px-4 py-2 w-full justify-center" style={{ background: `${result.color}15`, color: result.color, border: `1px solid ${result.color}40` }}>
                      {result.category} · {result.risk} Risk
                    </span>
                  </div>
                </Card>
                
                <Card className="flex flex-col justify-center">
                  <h3 className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">Biometric Targets</h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Target Weight Range</p>
                      <p className="font-display font-bold text-2xl text-white">
                        {result.ideal_weight_range.min} <span className="text-white/30 text-lg">to</span> {result.ideal_weight_range.max} <span className="text-sm text-white/50">{result.ideal_weight_range.unit}</span>
                      </p>
                    </div>
                    {extraAi && (
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-white/60 text-sm mb-1">Recommended Caloric Intake</p>
                        <div className="flex items-end gap-2">
                          <MdLocalFireDepartment className="text-fire text-2xl" />
                          <p className="font-display font-bold text-2xl text-white">{extraAi.calories.daily_calories_needed}</p>
                          <span className="text-sm text-white/50 mb-1">kcal/day</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* BMI Linear Gauge */}
              <Card>
                <h3 className="text-white/40 text-xs font-bold tracking-widest uppercase mb-2">BMI Spectrum</h3>
                <BMIGauge bmi={result.bmi} />
              </Card>

              {/* Multi-Section Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Advice */}
                <Card variant="dark" className="border border-white/5">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <MdCheckCircle className="text-neon" /> Health Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {result.advice.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70 bg-bg-primary/30 p-3 rounded-xl border border-white/5">
                        <span className="text-neon shrink-0 mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* AI Workout Snapshot */}
                {extraAi && (
                  <Card variant="dark" className="border border-white/5">
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <MdFitnessCenter className="text-violet-light" /> Suggested Workout
                    </h3>
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-bold">Goal: {extraAi.workout.goal.replace('_', ' ')}</p>
                    <div className="space-y-2">
                      {extraAi.workout.exercises.slice(0, 3).map((ex: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-bg-primary/30 p-3 rounded-xl border border-white/5">
                          <span className="text-sm text-white/80 font-medium">{ex.name}</span>
                          <span className="text-xs text-neon font-mono bg-neon/10 px-2 py-1 rounded-md border border-neon/20">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                      <div className="text-center pt-2">
                        <span className="text-xs text-white/30 italic">...plus {extraAi.workout.exercises.length - 3} more exercises.</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Section: Progress History */}
      {chartData.length > 0 && (
        <ChartCard
          title="BMI Progression History" subtitle="Your biometric tracking over time"
          icon={<MdTrendingDown />} iconColor="#06b6d4"
          height={300}
        >
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="bmi" name="BMI Score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ChartCard>
      )}
    </div>
  )
}
