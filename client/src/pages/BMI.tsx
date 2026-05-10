import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdMonitorWeight, MdCalculate, MdCheckCircle, MdSave } from 'react-icons/md'
import { bmiApi } from '@/api/bmi'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { BMIResult } from '@/types'
import { BMI_RANGES } from '@/utils/constants'
import toast from 'react-hot-toast'

function BMIGauge({ bmi }: { bmi: number }) {
  const clamped = Math.min(Math.max(bmi, 10), 40)
  const pct = ((clamped - 10) / 30) * 100
  const color = BMI_RANGES.find(r => bmi >= r.min && bmi < r.max)?.color || '#dc2626'

  return (
    <div className="my-4">
      <div className="flex justify-between text-xs text-white/25 mb-2 px-1">
        {BMI_RANGES.map(r => <span key={r.label}>{r.min}</span>)}
        <span>40+</span>
      </div>
      <div className="h-4 rounded-full relative overflow-visible"
        style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399, #fbbf24, #f87171, #dc2626)' }}>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-bg-primary shadow-lg z-10"
          style={{ background: color, left: `${Math.min(Math.max(pct, 2), 98)}%` }}
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(Math.max(pct, 2), 98)}%` }}
          transition={{ type: 'spring', damping: 22 }}
        />
      </div>
      <div className="flex justify-between text-xs mt-2 px-1">
        {BMI_RANGES.map(r => <span key={r.label} style={{ color: r.color }}>{r.label}</span>)}
      </div>
    </div>
  )
}

function CircularBMI({ bmi, color }: { bmi: number; color: string }) {
  const radius = 54; const circ = 2 * Math.PI * radius
  const pct = Math.min(Math.max(bmi / 40, 0), 1)
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={130} height={130} viewBox="0 0 130 130" className="-rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display font-black text-3xl" style={{ color }}>{bmi}</p>
        <p className="text-white/30 text-xs">BMI</p>
      </div>
    </div>
  )
}

export default function BMI() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male' })
  const [result, setResult] = useState<BMIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.weight || +form.weight < 20) e.weight = 'Enter valid weight (kg)'
    if (!form.height || +form.height < 50) e.height = 'Enter valid height (cm)'
    if (!form.age || +form.age < 10)       e.age = 'Enter valid age'
    return e
  }

  const calculate = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({}); setLoading(true)
    try {
      const { data } = await bmiApi.predict({
        weight: +form.weight, height: +form.height, age: +form.age, gender: form.gender,
      })
      setResult(data)
      toast.success(`BMI calculated: ${data.bmi} (${data.category})`)
    } catch {
      // Offline fallback
      const w = +form.weight, h = +form.height / 100
      const bmi = parseFloat((w / (h * h)).toFixed(1))
      const info = BMI_RANGES.find(r => bmi >= r.min && bmi < r.max) || BMI_RANGES[BMI_RANGES.length - 1]
      const hm = +form.height / 100
      setResult({
        bmi, category: info.label as any, risk: 'See a physician', color: info.color,
        ideal_weight_range: { min: +(18.5 * hm * hm).toFixed(1), max: +(24.9 * hm * hm).toFixed(1), unit: 'kg' },
        advice: ['Connect AI service for detailed recommendations'],
      })
    } finally { setLoading(false) }
  }

  const saveMeasurement = async () => {
    if (!result) return
    try {
      await bmiApi.save({ weight: +form.weight, height: +form.height, age: +form.age, gender: form.gender, bmi: result.bmi, bmiCategory: result.category })
      toast.success('Measurement saved!')
    } catch { toast.error('Failed to save') }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
          <MdMonitorWeight className="text-cyan-brand" /> BMI <span className="gradient-text">Calculator</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">AI-powered BMI analysis with Logistic Regression health classification.</p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={calculate} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Weight (kg)" type="number" placeholder="70" min="20" max="500" step="0.1"
              value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
              icon={<MdMonitorWeight />} error={errors.weight} />
            <Input label="Height (cm)" type="number" placeholder="170" min="50" max="300"
              value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
              icon={<MdMonitorWeight />} error={errors.height} />
            <Input label="Age" type="number" placeholder="25" min="10" max="120"
              value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              error={errors.age} />
            <Select label="Gender" value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
              options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
          </div>
          <Button type="submit" loading={loading} icon={<MdCalculate />}>Calculate BMI</Button>
        </form>
      </Card>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score */}
          <Card className="!p-8 text-center">
            <CircularBMI bmi={result.bmi} color={result.color} />
            <div className="mt-4">
              <span className="badge text-sm px-4 py-2" style={{ background: `${result.color}18`, color: result.color, border: `1px solid ${result.color}35` }}>
                {result.category} · {result.risk} Risk
              </span>
            </div>
            <BMIGauge bmi={result.bmi} />
            <div className="glass p-4 rounded-xl mt-4 inline-flex items-center gap-3">
              <div className="text-left">
                <p className="text-white/40 text-xs">Ideal Weight Range</p>
                <p className="font-display font-bold text-lg text-white mt-0.5">
                  {result.ideal_weight_range.min} – {result.ideal_weight_range.max} kg
                </p>
              </div>
            </div>
          </Card>

          {/* Advice */}
          <Card variant="dark">
            <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
              <MdCheckCircle className="text-neon" /> AI Health Recommendations
            </h3>
            <ul className="space-y-2.5">
              {result.advice.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                  <span className="text-neon mt-0.5 shrink-0">→</span> {tip}
                </li>
              ))}
            </ul>
          </Card>

          <Button onClick={saveMeasurement} variant="secondary" icon={<MdSave />}>
            Save Measurement
          </Button>
        </motion.div>
      )}
    </div>
  )
}
