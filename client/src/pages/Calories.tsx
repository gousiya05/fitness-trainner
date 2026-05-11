import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { MdLocalFireDepartment, MdCalculate, MdFavorite, MdMonitorWeight, MdTimeline, MdBarChart, MdSpeed, MdHealing } from 'react-icons/md'
import CountUp from 'react-countup'
import { caloriesApi } from '@/api/calories'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChartCard, ChartTooltip } from '@/components/charts/ChartCard'
import { useAuth } from '@/hooks/useAuth'
import type { CaloriePrediction } from '@/types'
import { EXERCISE_TYPES, INTENSITIES } from '@/utils/constants'
import toast from 'react-hot-toast'

// Mock Data for Weekly Analytics
const WEEKLY_DATA = [
  { day: 'Mon', calories: 420, fatBurn: 210 },
  { day: 'Tue', calories: 380, fatBurn: 200 },
  { day: 'Wed', calories: 510, fatBurn: 230 },
  { day: 'Thu', calories: 0,   fatBurn: 0 },
  { day: 'Fri', calories: 600, fatBurn: 260 },
  { day: 'Sat', calories: 450, fatBurn: 210 },
  { day: 'Sun', calories: 300, fatBurn: 180 },
]

export default function Calories() {
  const { user } = useAuth()
  
  const [form, setForm] = useState({
    exercise_type: 'hiit',
    duration: '45',
    intensity: 'high',
    heart_rate: '165',
    weight: user?.profile?.weight?.toString() || '70'
  })
  
  const [prediction, setPrediction] = useState<CaloriePrediction | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [advancedMetrics, setAdvancedMetrics] = useState<any>(null)

  const predictBurn = async (e: React.FormEvent) => {
    e.preventDefault()
    setPredicting(true)
    
    try {
      // API integration
      const { data } = await caloriesApi.predict({
        weight: +form.weight,
        height: user?.profile?.height || 170,
        age: user?.profile?.age || 25,
        gender: user?.profile?.gender || 'male',
        exercise_type: form.exercise_type,
        duration_minutes: +form.duration,
        intensity: form.intensity,
      })
      
      setPrediction(data)
      
      // Calculate advanced AI Analytics based on HR and prediction
      const fatBurnPct = form.intensity === 'low' ? 0.6 : form.intensity === 'moderate' ? 0.5 : 0.35
      const fatBurnCals = Math.round(data.calories_burned * fatBurnPct)
      
      let efficiencyScore = Math.round((data.calories_burned / +form.duration) * (+form.heart_rate / 100))
      efficiencyScore = Math.min(100, Math.max(10, efficiencyScore * 8))
      
      let recoveryHours = 12
      if (form.intensity === 'high') recoveryHours = +form.duration > 30 ? 36 : 24
      if (form.intensity === 'moderate') recoveryHours = +form.duration > 45 ? 24 : 16

      setAdvancedMetrics({
        fatBurn: fatBurnCals,
        efficiency: efficiencyScore,
        recovery: recoveryHours
      })
      
      toast.success('AI Prediction Complete! 🔥')
    } catch {
      toast.error('AI Service Error. Using offline calculation.')
      // Offline fallback
      const metMap: Record<string, Record<string, number>> = {
        cardio: { low: 4.5, moderate: 7, high: 10 }, running: { low: 6, moderate: 9.8, high: 13 },
        hiit: { low: 7, moderate: 9, high: 12 }, strength: { low: 3.5, moderate: 5, high: 6.5 },
        yoga: { low: 2.5, moderate: 3.5, high: 4.5 }, cycling: { low: 4, moderate: 6.8, high: 10 },
      }
      const m = (metMap[form.exercise_type] || metMap.cardio)[form.intensity]
      const cals = Math.round(m * +form.weight * (+form.duration / 60))
      
      setPrediction({
        calories_burned: cals, bmr: 1800, daily_calories_needed: 2500,
        exercise_type: form.exercise_type as any, duration_minutes: +form.duration, intensity: form.intensity as any, met_value: m
      })
      setAdvancedMetrics({ fatBurn: Math.round(cals * 0.4), efficiency: 75, recovery: 24 })
    } finally {
      setPredicting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 5px #ff6b35)', 'drop-shadow(0 0 15px #ff6b35)', 'drop-shadow(0 0 5px #ff6b35)'] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <MdLocalFireDepartment className="text-fire" />
            </motion.div>
            Calorie <span className="gradient-text text-fire">AI Analytics</span>
          </h1>
          <p className="text-white/40 mt-1.5 text-sm">Predictive energy expenditure modeled via XGBoost & Linear Regression.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-white/10 bg-gradient-to-br from-bg-card to-bg-primary">
            <div className="mb-6 pb-4 border-b border-white/5 flex items-center gap-2">
              <MdCalculate className="text-neon text-xl" />
              <h2 className="font-display font-semibold text-xl">Prediction Model Inputs</h2>
            </div>
            
            <form onSubmit={predictBurn} className="space-y-5" noValidate>
              <Select 
                label="Exercise Type" 
                value={form.exercise_type} 
                onChange={e => setForm(p => ({ ...p, exercise_type: e.target.value }))} 
                options={EXERCISE_TYPES.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` }))} 
                className="bg-bg-primary/50" 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Duration (min)" 
                  type="number" 
                  value={form.duration} 
                  onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} 
                  icon={<MdTimeline />}
                  className="bg-bg-primary/50" 
                />
                <Select 
                  label="Intensity" 
                  value={form.intensity} 
                  onChange={e => setForm(p => ({ ...p, intensity: e.target.value }))} 
                  options={INTENSITIES.map(i => ({ value: i.value, label: i.label }))} 
                  className="bg-bg-primary/50" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Avg Heart Rate" 
                  type="number" 
                  value={form.heart_rate} 
                  onChange={e => setForm(p => ({ ...p, heart_rate: e.target.value }))} 
                  icon={<MdFavorite className="text-danger" />}
                  className="bg-bg-primary/50" 
                />
                <Input 
                  label="Weight (kg)" 
                  type="number" 
                  value={form.weight} 
                  onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} 
                  icon={<MdMonitorWeight className="text-cyan-brand" />}
                  className="bg-bg-primary/50" 
                />
              </div>

              <Button type="submit" loading={predicting} fullWidth size="lg" className="h-14 mt-4 shadow-[0_0_20px_rgba(255,107,53,0.3)]" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff8f00)' }}>
                Calculate Energy Burn
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Dynamic AI Dashboard */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!prediction ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] glass-dark border border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/30 p-8 text-center border-dashed">
                <MdLocalFireDepartment className="text-6xl mb-4 opacity-50 text-fire" />
                <p className="text-lg font-medium text-white/50">Awaiting Workout Data</p>
                <p className="text-sm mt-2 max-w-md">Input your session details to generate real-time calorie burn, fat oxidation, and recovery analytics.</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                
                {/* Main Dynamic Counter */}
                <Card className="!p-8 relative overflow-hidden border border-fire/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-fire/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <h3 className="text-white/50 font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
                        <MdLocalFireDepartment className="text-fire" /> AI Predicted Burn
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-black text-7xl text-white drop-shadow-[0_0_15px_rgba(255,107,53,0.5)]">
                          <CountUp end={prediction.calories_burned} duration={2} separator="," />
                        </span>
                        <span className="text-fire font-bold text-xl">kcal</span>
                      </div>
                      <p className="text-white/40 text-sm mt-2">MET Value: {prediction.met_value.toFixed(1)} · {form.duration} mins of {form.exercise_type}</p>
                    </div>

                    {/* Progress Animation Ring */}
                    <div className="relative w-32 h-32 flex shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="45" fill="none" stroke="#ff6b35" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={283}
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - (283 * Math.min(prediction.calories_burned / 1000, 1)) }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,53,0.6))' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-lg font-bold text-white">
                          <CountUp end={Math.min(100, Math.round((prediction.calories_burned / 1000) * 100))} duration={2} />%
                        </span>
                        <span className="text-[10px] text-white/30 uppercase">of 1k Goal</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Sub Metrics */}
                {advancedMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-white/5 bg-bg-card/40 flex flex-col items-center text-center !p-6 group hover:border-neon/30 transition-colors">
                      <MdSpeed className="text-3xl text-neon mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Fat Burn Est.</p>
                      <p className="font-display font-bold text-2xl text-white">
                        <CountUp end={advancedMetrics.fatBurn} duration={2.5} /> <span className="text-sm text-neon">kcal</span>
                      </p>
                    </Card>

                    <Card className="border border-white/5 bg-bg-card/40 flex flex-col items-center text-center !p-6 group hover:border-violet-light/30 transition-colors">
                      <MdBarChart className="text-3xl text-violet-light mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Efficiency</p>
                      <p className="font-display font-bold text-2xl text-white">
                        <CountUp end={advancedMetrics.efficiency} duration={2} /> <span className="text-sm text-violet-light">/ 100</span>
                      </p>
                    </Card>

                    <Card className="border border-white/5 bg-bg-card/40 flex flex-col items-center text-center !p-6 group hover:border-cyan-brand/30 transition-colors">
                      <MdHealing className="text-3xl text-cyan-brand mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Recovery Time</p>
                      <p className="font-display font-bold text-2xl text-white">
                        <CountUp end={advancedMetrics.recovery} duration={1.5} /> <span className="text-sm text-cyan-brand">hrs</span>
                      </p>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Weekly Chart */}
        <ChartCard
          title="Weekly Calorie Analytics" subtitle="Energy expenditure breakdown"
          icon={<MdBarChart />} iconColor="#ff6b35"
          height={320} delay={0.2}
        >
          <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="calories" name="Total Calories" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fatBurn" name="Fat Burn (kcal)" fill="#00ff87" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* Workout Comparison */}
        <ChartCard
          title="Workout Intensity Comparisons" subtitle="Caloric efficiency across modalities"
          icon={<MdTimeline />} iconColor="#7c3aed"
          height={320} delay={0.3}
        >
          <LineChart data={[
            { time: '10m', hiit: 120, cardio: 80, strength: 50 },
            { time: '20m', hiit: 250, cardio: 160, strength: 110 },
            { time: '30m', hiit: 380, cardio: 240, strength: 160 },
            { time: '40m', hiit: 490, cardio: 320, strength: 220 },
            { time: '50m', hiit: 580, cardio: 400, strength: 280 },
          ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="hiit" name="HIIT" stroke="#ff6b35" strokeWidth={3} dot={{ r: 4, fill: '#ff6b35' }} />
            <Line type="monotone" dataKey="cardio" name="Cardio" stroke="#00ff87" strokeWidth={3} dot={{ r: 4, fill: '#00ff87' }} />
            <Line type="monotone" dataKey="strength" name="Strength" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed' }} />
          </LineChart>
        </ChartCard>
      </div>

    </div>
  )
}
