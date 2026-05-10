import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdFitnessCenter, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-neon/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet/[0.06] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-neon-gradient mx-auto mb-4 flex items-center justify-center shadow-neon"
          >
            <MdFitnessCenter className="text-bg-primary text-3xl" />
          </motion.div>
          <h1 className="font-display font-black text-3xl gradient-text">Welcome Back</h1>
          <p className="text-white/40 mt-2 text-sm">Sign in to continue your fitness journey</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<MdEmail />}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<MdLock />}
              iconRight={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/30 hover:text-white/60 transition-colors">
                  {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              }
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="divider" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-card px-3 text-white/30 text-xs">
              or
            </span>
          </div>

          <p className="text-center text-white/40 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-neon font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          By signing in you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}
