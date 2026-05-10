import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  MdFitnessCenter, MdLocalFireDepartment, MdTrendingUp, MdBolt,
  MdEmojiEvents, MdArrowForward, MdAutoAwesome, MdWaterDrop,
} from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { dashboardApi } from '@/api/dashboard'
import { StatCard } from '@/components/ui/Card'
import { ChartCard, ChartTooltip } from '@/components/charts/ChartCard'
import { WorkoutCard } from '@/components/fitness/WorkoutCard'
import { Loader } from '@/components/ui/Loader'
import type { DashboardStats, WorkoutHistory } from '@/types'

const MOCK: DashboardStats = {
  totalWorkouts: 24, streak: 7, latestBMI: 22.4, bmiCategory: 'Normal',
  weeklyGoal: 5, weeklyCompleted: 4,
  weeklyData: [
    { day: 'Mon', workouts: 1, calories: 420 }, { day: 'Tue', workouts: 0, calories: 0 },
    { day: 'Wed', workouts: 1, calories: 380 }, { day: 'Thu', workouts: 1, calories: 510 },
    { day: 'Fri', workouts: 0, calories: 0 },   { day: 'Sat', workouts: 1, calories: 600 },
    { day: 'Sun', workouts: 1, calories: 450 },
  ],
  calorieData: [
    { date: 'Mon', consumed: 1850, burned: 420, goal: 2000 },
    { date: 'Tue', consumed: 2100, burned: 280, goal: 2000 },
    { date: 'Wed', consumed: 1700, burned: 510, goal: 2000 },
    { date: 'Thu', consumed: 1950, burned: 380, goal: 2000 },
    { date: 'Fri', consumed: 2200, burned: 320, goal: 2000 },
    { date: 'Sat', consumed: 1800, burned: 600, goal: 2000 },
    { date: 'Sun', consumed: 1600, burned: 450, goal: 2000 },
  ],
  recentWorkouts: [
    { id: '1', title: 'Full Body HIIT', date: new Date().toISOString(), completed: true, totalCalories: 450, durationMinutes: 45, exercises: [], goal: 'weight_loss' },
    { id: '2', title: 'Upper Body Strength', date: new Date(Date.now() - 86400000).toISOString(), completed: true, totalCalories: 320, durationMinutes: 40, exercises: [] },
    { id: '3', title: 'Cardio Blast', date: new Date(Date.now() - 172800000).toISOString(), completed: true, totalCalories: 380, durationMinutes: 30, exercises: [] },
  ],
}

// Quick action cards
const QUICK_ACTIONS = [
  { label: 'Generate Workout',   path: '/workout',  icon: MdFitnessCenter,    color: '#00ff87' },
  { label: 'Check BMI',          path: '/bmi',       icon: MdTrendingUp,       color: '#06b6d4' },
  { label: 'Log Calories',       path: '/calories',  icon: MdLocalFireDepartment, color: '#ff6b35' },
  { label: 'Open Posture AI',    path: '/posture',   icon: MdAutoAwesome,      color: '#7c3aed' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(MOCK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats({ ...MOCK, ...data }))
      .catch(() => {}) // use mock on backend unavailable
      .finally(() => setLoading(false))
  }, [])

  const todayBurned = stats.calorieData.at(-1)?.burned ?? 0
  const todayConsumed = stats.calorieData.at(-1)?.consumed ?? 0
  const weekPct = Math.round((stats.weeklyCompleted / stats.weeklyGoal) * 100)

  const statCards = [
    { icon: <MdFitnessCenter />, label: 'Total Workouts',  value: stats.totalWorkouts, sub: 'All time',         color: '#00ff87' },
    { icon: <MdBolt />,          label: 'Streak',          value: `${stats.streak}d`,  sub: 'Keep it up!',      color: '#7c3aed' },
    { icon: <MdTrendingUp />,    label: 'BMI',             value: stats.latestBMI ?? '—', sub: stats.bmiCategory ?? 'Not set', color: '#06b6d4' },
    { icon: <MdLocalFireDepartment />, label: "Today's Burn", value: todayBurned,       sub: 'kcal burned',      color: '#ff6b35' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl md:text-3xl">
          Good day, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-white/35 mt-1 text-sm">Here's your fitness overview for today.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.08} />
        ))}
      </div>

      {/* Weekly goal progress */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-base">Weekly Goal Progress</h2>
            <p className="text-white/40 text-xs mt-0.5">{stats.weeklyCompleted} of {stats.weeklyGoal} sessions completed</p>
          </div>
          <span className="text-2xl font-display font-black text-neon">{weekPct}%</span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            style={{ background: 'linear-gradient(90deg, #00ff87, #7c3aed)', width: `${weekPct}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${weekPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {stats.weeklyData.map(({ day, workouts }) => (
            <div key={day} className="text-center">
              <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                workouts > 0 ? 'bg-neon text-bg-primary' : 'bg-bg-elevated text-white/20'}`}>
                {workouts > 0 ? '✓' : '·'}
              </div>
              <p className="text-white/30 text-xs mt-1">{day.slice(0,1)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Weekly Workouts" subtitle="Last 7 days"
          icon={<MdFitnessCenter />} iconColor="#00ff87"
          height={200} delay={0.25}
        >
          <BarChart data={stats.weeklyData}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff87" /><stop offset="100%" stopColor="#00cc6a" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="workouts" fill="url(#barGrad)" radius={[6,6,0,0]} name="Workouts" />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Calories (7 Days)" subtitle="Consumed vs Burned"
          icon={<MdLocalFireDepartment />} iconColor="#ff6b35"
          height={200} delay={0.3}
        >
          <AreaChart data={stats.calorieData}>
            <defs>
              <linearGradient id="cArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff87" stopOpacity={0.3} /><stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="consumed" stroke="#7c3aed" fill="url(#cArea)" strokeWidth={2} name="Consumed" />
            <Area type="monotone" dataKey="burned"   stroke="#00ff87" fill="url(#bArea)" strokeWidth={2} name="Burned" />
          </AreaChart>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent workouts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <MdEmojiEvents className="text-warning" /> Recent Workouts
            </h2>
            <Link to="/workout" className="text-xs text-neon hover:underline flex items-center gap-1">
              View all <MdArrowForward size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentWorkouts.map((w, i) => (
              <WorkoutCard key={w.id} workout={w} delay={i * 0.06} />
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-5">
          <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
            <MdBolt className="text-neon" /> Quick Actions
          </h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ label, path, icon: Icon, color }) => (
              <Link
                key={path} to={path}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: `${color}18`, color }}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{label}</span>
                <MdArrowForward className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
              </Link>
            ))}
          </div>

          {/* AI tip */}
          <div className="mt-4 p-3 rounded-xl bg-neon/5 border border-neon/15">
            <p className="text-white/40 text-xs flex items-start gap-2">
              <MdAutoAwesome className="text-neon shrink-0 mt-0.5" />
              <span>Based on your goal, try adding 1 more session this week to hit your target. 💪</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
