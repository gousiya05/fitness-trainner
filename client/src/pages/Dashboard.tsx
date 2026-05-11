import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts'
import {
  MdFitnessCenter, MdLocalFireDepartment, MdTrendingUp, MdBolt,
  MdEmojiEvents, MdArrowForward, MdAutoAwesome, MdWaterDrop,
  MdDirectionsWalk, MdNotifications, MdArrowDropDown, MdVideocam,
  MdChatBubble, MdClose, MdSend, MdRestaurant, MdSelfImprovement
} from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { dashboardApi } from '@/api/dashboard'
import { StatCard } from '@/components/ui/Card'
import { ChartCard, ChartTooltip } from '@/components/charts/ChartCard'
import { WorkoutCard } from '@/components/fitness/WorkoutCard'
import type { DashboardStats, WorkoutHistory } from '@/types'

const MOCK: DashboardStats & any = {
  totalWorkouts: 24, streak: 7, latestBMI: 22.4, bmiCategory: 'Normal',
  weeklyGoal: 5, weeklyCompleted: 4,
  waterIntake: '2.4L', steps: 8432, completionPct: 80,
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
  ],
}

// Quick action cards
const QUICK_ACTIONS = [
  { label: 'Generate Workout',   path: '/workout',  icon: MdFitnessCenter,    color: '#00ff87' },
  { label: 'Check BMI',          path: '/bmi',       icon: MdTrendingUp,       color: '#06b6d4' },
  { label: 'Log Calories',       path: '/calories',  icon: MdLocalFireDepartment, color: '#ff6b35' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats & any>(MOCK)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats({ ...MOCK, ...data }))
      .catch(() => {}) // use mock on backend unavailable
      .finally(() => setLoading(false))
  }, [])

  const todayBurned = stats.calorieData.at(-1)?.burned ?? 0
  const weekPct = Math.round((stats.weeklyCompleted / stats.weeklyGoal) * 100)

  const statCards = [
    { icon: <MdLocalFireDepartment />, label: 'Calories Burned', value: todayBurned, sub: 'Today', color: '#ff6b35' },
    { icon: <MdTrendingUp />, label: 'BMI Score', value: stats.latestBMI ?? '—', sub: stats.bmiCategory ?? 'Not set', color: '#06b6d4' },
    { icon: <MdBolt />, label: 'Workout Streak', value: `${stats.streak}d`, sub: 'Keep it up!', color: '#7c3aed' },
    { icon: <MdWaterDrop />, label: 'Water Intake', value: stats.waterIntake, sub: 'Daily Goal: 3L', color: '#3b82f6' },
    { icon: <MdDirectionsWalk />, label: 'Steps Count', value: stats.steps, sub: 'Daily Goal: 10k', color: '#00ff87' },
    { icon: <MdFitnessCenter />, label: 'Completion', value: `${stats.completionPct}%`, sub: 'Weekly Goal', color: '#a855f7' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
      {/* 1. Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card/50 p-6 rounded-3xl border border-white/5 shadow-card backdrop-blur-md"
      >
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/40 mt-1.5 text-sm flex items-center gap-2">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="italic text-neon/80">"Discipline is doing what needs to be done, even if you don't want to do it."</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
            <MdNotifications className="text-white/70 text-xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-fire rounded-full shadow-[0_0_8px_#ff6b35]" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-neon-gradient flex items-center justify-center text-bg-primary font-bold shadow-neon-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-white/40">Pro Member</p>
            </div>
            <MdArrowDropDown className="text-white/50 text-xl" />
          </div>
        </div>
      </motion.div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. AI Recommendation Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="glass-dark border border-neon/10 p-6 lg:col-span-1 flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-full blur-3xl" />
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-6">
            <MdAutoAwesome className="text-neon" /> AI Recommendations
          </h2>
          
          <div className="space-y-4 flex-1">
            <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-neon mb-2">
                <MdFitnessCenter /> <span className="font-medium text-sm">Workout Suggestion</span>
              </div>
              <p className="text-white/60 text-sm">Based on yesterday's cardio, today focus on Upper Body Strength to allow leg muscles to recover.</p>
            </div>

            <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-warning mb-2">
                <MdRestaurant /> <span className="font-medium text-sm">Smart Diet</span>
              </div>
              <p className="text-white/60 text-sm">You are 300 kcal below target. Consider a protein-rich post-workout shake.</p>
            </div>

            <div className="bg-bg-primary/50 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-cyan-brand mb-2">
                <MdSelfImprovement /> <span className="font-medium text-sm">Recovery Tip</span>
              </div>
              <p className="text-white/60 text-sm">Your sleep data suggests taking it easy. Include 10 mins of stretching post-workout.</p>
            </div>
          </div>
        </motion.div>

        {/* 4. Progress Charts */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="Weekly Calories Burned" subtitle="Last 7 days vs Target"
            icon={<MdLocalFireDepartment />} iconColor="#ff6b35"
            height={260} delay={0.3}
          >
            <AreaChart data={stats.calorieData}>
              <defs>
                <linearGradient id="cArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} /><stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff87" stopOpacity={0.3} /><stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="consumed" stroke="#ff6b35" fill="url(#cArea)" strokeWidth={2} name="Consumed" />
              <Area type="monotone" dataKey="burned"   stroke="#00ff87" fill="url(#bArea)" strokeWidth={2} name="Burned" />
            </AreaChart>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Recent Workouts Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <MdEmojiEvents className="text-warning" /> Recent Workouts
            </h2>
            <Link to="/workout" className="text-sm text-neon font-medium hover:underline flex items-center gap-1 transition-all">
              View all <MdArrowForward size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.recentWorkouts.map((w: WorkoutHistory, i: number) => (
              <WorkoutCard key={w.id} workout={w} delay={i * 0.06} />
            ))}
          </div>
        </motion.div>

        {/* 7. Live Pose Detection Preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <MdVideocam className="text-violet-light" /> Live Pose AI
            </h2>
            <span className="badge badge-violet animate-pulse">Beta</span>
          </div>
          
          <div className="aspect-video bg-bg-primary rounded-2xl border border-white/10 relative overflow-hidden mb-4 group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80" alt="Pose Preview" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent" />
            
            {/* Mock Pose Skeleton Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-violet/20 border border-violet/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-violet">
                <MdVideocam className="text-2xl text-violet-light" />
              </div>
            </div>
            
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-neon border border-neon/20 uppercase tracking-widest font-bold">Squats: 0/15</span>
              <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white/70 border border-white/10 uppercase tracking-widest">Posture: Good</span>
            </div>
          </div>
          
          <Link to="/posture" className="btn-primary w-full shadow-violet border-none" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
            Launch Camera <MdArrowForward />
          </Link>
        </motion.div>
      </div>

      {/* 6. AI Fitness Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 glass-dark border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex flex-col mb-4"
              style={{ height: '400px' }}
            >
              <div className="bg-bg-elevated p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-gradient flex items-center justify-center shadow-neon-sm">
                    <MdAutoAwesome className="text-bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">Ask FitAI</h3>
                    <p className="text-[10px] text-neon uppercase tracking-widest font-bold">Online</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="text-white/40 hover:text-white transition-colors">
                  <MdClose size={20} />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-neon-gradient flex items-center justify-center shrink-0">
                    <MdAutoAwesome className="text-bg-primary text-xs" />
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <p className="text-sm text-white/80">Hello {user?.name?.split(' ')[0]}! I'm your AI fitness assistant. You can ask me about workout guidance, diet plans, or recovery tips.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-t border-white/5 bg-bg-elevated">
                <div className="relative">
                  <input type="text" placeholder="Type your question..." className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:border-neon/50 focus:outline-none transition-colors" />
                  <button className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-neon text-bg-primary flex items-center justify-center hover:scale-105 transition-transform shadow-neon-sm">
                    <MdSend size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 rounded-full bg-neon-gradient text-bg-primary flex items-center justify-center shadow-neon hover:scale-110 transition-transform active:scale-95"
        >
          {showChat ? <MdClose size={24} /> : <MdChatBubble size={24} />}
        </button>
      </div>
    </div>
  )
}
