import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdFitnessCenter, MdMonitorWeight, MdLocalFireDepartment,
  MdSelfImprovement, MdPerson, MdRestaurant, MdLogout, MdAutoAwesome,
} from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',   icon: MdDashboard },
  { path: '/workout',   label: 'AI Workout',  icon: MdFitnessCenter },
  { path: '/bmi',       label: 'BMI Tracker', icon: MdMonitorWeight },
  { path: '/calories',  label: 'Calories',    icon: MdLocalFireDepartment },
  { path: '/diet',      label: 'Diet Plan',   icon: MdRestaurant },
  { path: '/posture',   label: 'Posture AI',  icon: MdSelfImprovement },
  { path: '/profile',   label: 'Profile',     icon: MdPerson },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out. See you next time! 👋')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-bg-secondary border-r border-bg-border shrink-0 relative overflow-hidden">
      {/* Sidebar ambient glow */}
      <div className="absolute inset-0 bg-sidebar-glow pointer-events-none" />

      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 px-5 py-5 border-b border-bg-border shrink-0 group">
        <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center shadow-neon-sm group-hover:shadow-neon transition-all">
          <span className="text-bg-primary font-black text-xl font-display">F</span>
        </div>
        <div>
          <span className="font-display font-black text-xl gradient-text">FitAI</span>
          <p className="text-white/25 text-xs -mt-0.5">AI Fitness Trainer</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/20 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Menu</p>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`nav-icon ${isActive ? 'text-neon' : ''}`} />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-neon shadow-neon-sm"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="p-3 border-t border-bg-border shrink-0 space-y-2">
        {/* AI badge */}
        <div className="glass-neon px-3 py-2 rounded-xl flex items-center gap-2">
          <MdAutoAwesome className="text-neon text-base shrink-0" />
          <div className="min-w-0">
            <p className="text-white/60 text-xs truncate">AI-powered by</p>
            <p className="text-neon text-xs font-semibold truncate">MediaPipe + scikit-learn</p>
          </div>
        </div>

        {/* User row */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-neon-gradient flex items-center justify-center text-bg-primary font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/35 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-danger hover:bg-danger/10 transition-all shrink-0"
          >
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
