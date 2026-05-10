import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdMenu, MdClose, MdLogout, MdNotificationsNone,
  MdDashboard, MdFitnessCenter, MdMonitorWeight, MdLocalFireDepartment,
  MdSelfImprovement, MdPerson, MdRestaurant,
} from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const MOB_NAV = [
  { path: '/dashboard', label: 'Dashboard',   icon: MdDashboard },
  { path: '/workout',   label: 'AI Workout',  icon: MdFitnessCenter },
  { path: '/bmi',       label: 'BMI',         icon: MdMonitorWeight },
  { path: '/calories',  label: 'Calories',    icon: MdLocalFireDepartment },
  { path: '/diet',      label: 'Diet',        icon: MdRestaurant },
  { path: '/posture',   label: 'Posture AI',  icon: MdSelfImprovement },
  { path: '/profile',   label: 'Profile',     icon: MdPerson },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('See you next time! 👋')
  }

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-xl border-b border-bg-border flex items-center px-4 md:px-6 gap-4 shrink-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={open ? 'close' : 'menu'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <MdClose size={22} /> : <MdMenu size={22} />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Mobile logo */}
      <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-neon-gradient flex items-center justify-center">
          <span className="text-bg-primary font-black text-sm font-display">F</span>
        </div>
        <span className="font-display font-bold gradient-text">FitAI</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors relative">
          <MdNotificationsNone size={20} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neon shadow-neon-sm" />
        </button>

        {/* User avatar */}
        <Link to="/profile" className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-neon-gradient flex items-center justify-center text-bg-primary font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-none">{user?.name}</p>
            <p className="text-white/35 text-xs mt-0.5">{user?.profile?.goal?.replace('_', ' ') || 'Set your goal'}</p>
          </div>
        </Link>

        {/* Desktop logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="hidden md:flex w-9 h-9 rounded-xl glass items-center justify-center text-white/30 hover:text-danger hover:bg-danger/10 transition-all"
        >
          <MdLogout size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="fixed top-16 left-0 bottom-0 w-72 z-50 bg-bg-secondary border-r border-bg-border lg:hidden overflow-y-auto"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            >
              <div className="p-4 space-y-1">
                {MOB_NAV.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" />
                    {label}
                  </NavLink>
                ))}
              </div>
              <div className="p-4 border-t border-bg-border">
                <button onClick={handleLogout} className="nav-item w-full text-danger/70 hover:text-danger hover:bg-danger/10">
                  <MdLogout className="nav-icon" /> Sign Out
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
