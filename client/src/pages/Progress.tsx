import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis 
} from 'recharts'
import { 
  MdTrendingUp, MdTimeline, MdFitnessCenter, MdEmojiEvents, 
  MdLocalFireDepartment, MdAutoAwesome, MdFileDownload, MdStars
} from 'react-icons/md'
import { dashboardApi } from '@/api/dashboard'
import { Card } from '@/components/ui/Card'
import { ChartCard, ChartTooltip } from '@/components/charts/ChartCard'
import { Button } from '@/components/ui/Button'
import type { DashboardStats } from '@/types'

// Mock Data for Analytics
const MONTHLY_PROGRESS = [
  { week: 'W1', workouts: 3, calories: 1200, weight: 75.2 },
  { week: 'W2', workouts: 4, calories: 1600, weight: 74.8 },
  { week: 'W3', workouts: 5, calories: 2100, weight: 74.1 },
  { week: 'W4', workouts: 4, calories: 1800, weight: 73.5 },
]

const CONSISTENCY_DATA = [
  { day: 'M', completed: 100 }, { day: 'T', completed: 80 },
  { day: 'W', completed: 100 }, { day: 'T', completed: 0 },
  { day: 'F', completed: 100 }, { day: 'S', completed: 60 },
  { day: 'S', completed: 100 },
]

export default function Progress() {
  const [stats, setStats] = useState<DashboardStats | any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {
        // Fallback Mock if backend fails
        setStats({
          totalWorkouts: 42, streak: 12, latestBMI: 23.4,
          weeklyCompleted: 5, weeklyGoal: 5,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const downloadReport = () => {
    const content = `FITAI PERFORMANCE REPORT\n------------------\nWorkouts: ${stats?.totalWorkouts}\nStreak: ${stats?.streak} days\nBMI: ${stats?.latestBMI}\n\nAI Insights: Excellent progress. Keep up the high intensity.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `Progress_Report.txt`
    a.click()
  }

  if (loading) return <div className="p-20 text-center"><div className="spinner mx-auto" /></div>

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
            <MdTimeline className="text-warning" /> Progress <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-white/40 mt-1.5 text-sm">Deep dive into your fitness journey, consistency, and AI-driven performance reports.</p>
        </div>
        <Button onClick={downloadReport} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white" icon={<MdFileDownload />}>
          Export PDF
        </Button>
      </div>

      {/* Floating Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Total Workouts', v: stats?.totalWorkouts || 0, i: <MdFitnessCenter/>, c: '#00ff87' },
          { l: 'Current Streak', v: `${stats?.streak || 0} Days`, i: <MdLocalFireDepartment/>, c: '#ff6b35' },
          { l: 'Milestones Hit', v: 8, i: <MdEmojiEvents/>, c: '#fbbf24' },
          { l: 'Fitness Level', v: 'Advanced', i: <MdStars/>, c: '#7c3aed' },
        ].map((stat, i) => (
          <motion.div key={stat.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="flex items-center gap-4 !p-5 group hover:border-white/20 transition-all cursor-default">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${stat.c}40, transparent)`, color: stat.c, border: `1px solid ${stat.c}60` }}>
                {stat.i}
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-0.5">{stat.l}</p>
                <p className="font-display font-black text-2xl text-white">{stat.v}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Charts */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Weight & BMI Progress */}
          <ChartCard
            title="Weight Progression" subtitle="Last 4 Weeks vs Target"
            icon={<MdTrendingUp />} iconColor="#06b6d4" height={300}
          >
            <AreaChart data={MONTHLY_PROGRESS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#06b6d4" strokeWidth={3} fill="url(#colorWeight)" activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Consistency Bar Chart */}
            <ChartCard
              title="Workout Consistency" subtitle="Daily completion percentage"
              icon={<MdTimeline />} iconColor="#00ff87" height={220}
            >
              <BarChart data={CONSISTENCY_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="completed" name="Consistency %" fill="#00ff87" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            {/* Calorie Trends */}
            <ChartCard
              title="Calorie Expenditure" subtitle="Weekly energy burn trends"
              icon={<MdLocalFireDepartment />} iconColor="#ff6b35" height={220}
            >
              <LineChart data={MONTHLY_PROGRESS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="calories" name="Burned (kcal)" stroke="#ff6b35" strokeWidth={3} dot={{ r: 4, fill: '#ff6b35' }} />
              </LineChart>
            </ChartCard>
          </div>
        </div>

        {/* Right Col: AI Reports & Badges */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Goal Completion Radial */}
          <Card className="text-center !p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-violet/5 blur-3xl rounded-full" />
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Weekly Goal</h3>
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={[{ name: 'Completion', value: 85, fill: '#7c3aed' }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-4xl text-white">85%</span>
                <span className="text-white/40 text-xs mt-1">Completed</span>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-4">You are on track to crush your weekly volume targets.</p>
          </Card>

          {/* AI Generated Report */}
          <Card variant="dark" className="border border-neon/20 bg-neon/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-2xl" />
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <MdAutoAwesome className="text-neon" /> AI Performance Report
            </h3>
            <div className="space-y-4">
              <div className="bg-bg-primary/50 p-4 rounded-xl border border-white/5">
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong className="text-neon">Consistency Peak:</strong> Your 12-day streak is in the top 5% of users with similar profiles. Keep up the momentum to maximize muscle hypertrophy.
                </p>
              </div>
              <div className="bg-bg-primary/50 p-4 rounded-xl border border-white/5">
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong className="text-cyan-brand">Weight Trend:</strong> Down 1.7kg this month. You are perfectly aligned with a healthy 0.5kg/week sustainable fat loss trajectory.
                </p>
              </div>
            </div>
          </Card>

          {/* Achievement Badges */}
          <Card>
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-3 rounded-xl border border-white/5 flex flex-col items-center text-center group hover:border-warning/30 transition-colors">
                <MdLocalFireDepartment className="text-3xl text-fire mb-2 drop-shadow-[0_0_8px_rgba(255,107,53,0.5)] group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white mb-1">10 Day Streak</p>
                <p className="text-[10px] text-white/40">Unstoppable</p>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 flex flex-col items-center text-center group hover:border-neon/30 transition-colors">
                <MdFitnessCenter className="text-3xl text-neon mb-2 drop-shadow-[0_0_8px_rgba(0,255,135,0.5)] group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white mb-1">Iron Master</p>
                <p className="text-[10px] text-white/40">Lifted 5,000kg</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
