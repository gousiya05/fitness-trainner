import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdPerson, MdFitnessCenter, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

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
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Floating Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-neon/[0.08] rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] bg-violet/[0.08] rounded-full blur-[100px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Hero Section (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hidden lg:flex flex-col justify-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-neon-gradient flex items-center justify-center shadow-[0_0_40px_rgba(0,255,135,0.3)] mb-8 border border-neon/20">
            <MdFitnessCenter className="text-bg-primary text-4xl" />
          </div>
          <h1 className="font-display font-black text-5xl xl:text-6xl text-white mb-6 leading-tight tracking-tight">
            Start Your Journey <br/>
            <span className="gradient-text">With FitAI</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md mb-10 leading-relaxed font-medium">
            Join the premium AI fitness platform. Create a free account today to start building the ultimate version of yourself.
          </p>
          
          <div className="space-y-6">
            {[
              '4 AI-powered machine learning models',
              'Live pose detection & rep counting',
              'Personalized intelligent diet plans',
              'Advanced charts & workout streaks'
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                key={i} 
                className="flex items-center gap-4 text-white/70"
              >
                <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center border border-neon/20 shrink-0">
                  <MdCheckCircle className="text-neon text-base" />
                </div>
                <span className="font-medium text-base">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0"
        >
          <div className="glass-dark border border-white/5 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="text-center lg:text-left mb-8">
              <div className="lg:hidden w-16 h-16 rounded-2xl bg-neon-gradient flex items-center justify-center shadow-neon mx-auto mb-6 border border-neon/20">
                <MdFitnessCenter className="text-bg-primary text-3xl" />
              </div>
              <h2 className="font-display font-bold text-3xl text-white mb-2 tracking-tight">Create Account</h2>
              <p className="text-white/50 text-sm font-medium">No credit card required to start</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input 
                label="Full Name" 
                type="text" 
                placeholder="John Doe" 
                icon={<MdPerson />}
                value={form.name} 
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                error={errors.name} 
                autoComplete="name" 
                className="bg-black/20 focus:bg-black/40 transition-colors duration-300"
              />

              <Input 
                label="Email address" 
                type="email" 
                placeholder="you@example.com" 
                icon={<MdEmail />}
                value={form.email} 
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                error={errors.email} 
                autoComplete="email" 
                className="bg-black/20 focus:bg-black/40 transition-colors duration-300"
              />

              <Input 
                label="Password" 
                type={showPwd ? 'text' : 'password'} 
                placeholder="Min. 6 characters"
                icon={<MdLock />}
                iconRight={
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(!showPwd)} 
                    className="text-white/30 hover:text-white/80 transition-colors duration-200 outline-none focus-visible:text-neon"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                }
                value={form.password} 
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                error={errors.password} 
                autoComplete="new-password" 
                className="bg-black/20 focus:bg-black/40 transition-colors duration-300"
              />

              <Input 
                label="Confirm Password" 
                type={showPwd ? 'text' : 'password'} 
                placeholder="Repeat password"
                icon={<MdLock />}
                value={form.confirm} 
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                error={errors.confirm} 
                autoComplete="new-password" 
                className="bg-black/20 focus:bg-black/40 transition-colors duration-300"
              />

              <div className="pt-2">
                <Button 
                  type="submit" 
                  fullWidth 
                  size="lg" 
                  loading={loading} 
                  className="h-12 text-base shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-shadow duration-300"
                >
                  {loading ? 'Creating account...' : 'Create Free Account'}
                </Button>
              </div>
            </form>

            <div className="relative my-8">
              <div className="divider border-white/5" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d0d15] px-4 text-white/30 text-xs font-semibold uppercase tracking-widest rounded-full border border-white/5">
                Already Joined?
              </span>
            </div>

            <p className="text-center text-white/50 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-neon font-bold hover:text-white transition-colors duration-300 hover:underline underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>

          <p className="text-center text-white/20 text-xs mt-6 font-medium">
            By creating an account you agree to our <a href="#" className="hover:text-white/60 transition-colors">Terms</a> & <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
