import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdSave, MdEdit } from 'react-icons/md'
import { authApi } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { FitnessGoal, ActivityLevel, FitnessLevel } from '@/types'
import { GOALS, ACTIVITY_LEVELS, FITNESS_LEVELS } from '@/utils/constants'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:          user?.name          || '',
    age:           String(user?.profile?.age    || ''),
    weight:        String(user?.profile?.weight || ''),
    height:        String(user?.profile?.height || ''),
    gender:        user?.profile?.gender        || 'male',
    goal:          (user?.profile?.goal         || 'general')   as FitnessGoal,
    activityLevel: (user?.profile?.activityLevel || 'moderate') as ActivityLevel,
    fitnessLevel:  (user?.profile?.fitnessLevel  || 'beginner') as FitnessLevel,
  })

  const bmi = form.weight && form.height
    ? +(+form.weight / Math.pow(+form.height / 100, 2)).toFixed(1)
    : null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await authApi.updateProfile({
        name: form.name.trim(),
        profile: {
          age:          +form.age   || undefined,
          weight:       +form.weight|| undefined,
          height:       +form.height|| undefined,
          gender:       form.gender as any,
          goal:         form.goal,
          activityLevel:form.activityLevel,
          fitnessLevel: form.fitnessLevel,
        },
      })
      updateUser(data.user)
      toast.success('Profile saved! 🎉')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  const goalInfo = GOALS.find(g => g.value === form.goal)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
          <MdPerson className="text-violet-light" /> My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">Update your data to improve AI recommendations.</p>
      </div>

      {/* Avatar card */}
      <Card className="!p-5 md:!p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-neon-gradient flex items-center justify-center text-bg-primary font-black text-4xl font-display shrink-0 shadow-neon">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl">{user?.name}</h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {bmi && <span className="badge badge-neon">BMI: {bmi}</span>}
              <span className="badge badge-violet capitalize">{form.fitnessLevel}</span>
              {goalInfo && <span className="badge" style={{ background: `${goalInfo.color}15`, color: goalInfo.color, border: `1px solid ${goalInfo.color}30` }}>{goalInfo.emoji} {goalInfo.label}</span>}
            </div>
          </div>
          <div className="text-right shrink-0 space-y-2">
            <div className="text-center">
              <p className="font-display font-black text-2xl text-neon">{user?.streak || 0}</p>
              <p className="text-white/30 text-xs">day streak</p>
            </div>
            <div className="text-center">
              <p className="font-display font-black text-2xl text-violet-light">{user?.totalWorkouts || 0}</p>
              <p className="text-white/30 text-xs">workouts</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <h2 className="font-display font-semibold text-base mb-5 flex items-center gap-2">
          <MdEdit className="text-neon" /> Edit Information
        </h2>
        <form onSubmit={handleSave} className="space-y-5">
          <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} icon={<MdPerson />} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Age" type="number" placeholder="25" min="10" max="120" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
            <Select label="Gender" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as 'male' | 'female' | 'other' }))} options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} />
            <Input label="Weight (kg)" type="number" placeholder="70" step="0.1" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
            <Input label="Height (cm)" type="number" placeholder="170" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} />
          </div>

          <Select label="Fitness Goal" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value as FitnessGoal }))} options={GOALS.map(g => ({ value: g.value, label: `${g.emoji} ${g.label}` }))} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Activity Level" value={form.activityLevel} onChange={e => setForm(p => ({ ...p, activityLevel: e.target.value as ActivityLevel }))} options={ACTIVITY_LEVELS.map(a => ({ value: a.value, label: a.label }))} />
            <Select label="Fitness Level"  value={form.fitnessLevel}  onChange={e => setForm(p => ({ ...p, fitnessLevel:  e.target.value as FitnessLevel  }))} options={FITNESS_LEVELS.map(f  => ({ value: f.value,  label: f.label  }))} />
          </div>

          <Button type="submit" fullWidth size="lg" loading={saving} icon={<MdSave />}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      {/* BMI quick display */}
      {bmi && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-neon p-4 rounded-2xl text-center">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Calculated BMI</p>
          <p className="font-display font-black text-4xl text-neon">{bmi}</p>
          <p className="text-white/40 text-sm mt-1">Based on your weight & height above</p>
        </motion.div>
      )}
    </div>
  )
}
