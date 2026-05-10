import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdPerson, MdFitnessCenter, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const PERKS = [
  '🤖 4 AI-powered ML models',
  '📸 Live pose detection & rep counting',
  '🍽️ Personalized diet recommendations',
  '📊 Progress charts & streaks',
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left panel */}
        <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-14 h-14 rounded-2xl bg-neon-gradient flex items-center justify-center shadow-neon mb-6">
            <MdFitnessCenter className="text-bg-primary text-3xl" />
          </div>
          <h1 className="font-display font-black text-4xl gradient-text mb-3">Join FitAI</h1>
          <p className="text-white/45 text-base leading-relaxed mb-8">
            Your personal AI fitness trainer. Get started in seconds — no credit card needed.
          </p>
          <div className="space-y-3">
            {PERKS.map(perk => (
              <div key={perk} className="flex items-center gap-3 text-sm text-white/60">
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right panel — form */}
        <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="glass p-8">
            <h2 className="font-display font-bold text-2xl mb-6">Create your account</h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input label="Full Name" type="text" placeholder="John Doe" icon={<MdPerson />}
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                error={errors.name} autoComplete="name" />

              <Input label="Email" type="email" placeholder="you@example.com" icon={<MdEmail />}
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                error={errors.email} autoComplete="email" />

              <Input label="Password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
                icon={<MdLock />}
                iconRight={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/30 hover:text-white/60">
                    {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                }
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                error={errors.password} autoComplete="new-password" />

              <Input label="Confirm Password" type={showPwd ? 'text' : 'password'} placeholder="Repeat password"
                icon={<MdLock />}
                value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                error={errors.confirm} autoComplete="new-password" />

              <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                {loading ? 'Creating account...' : 'Create Free Account'}
              </Button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-neon font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
