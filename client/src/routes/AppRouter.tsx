import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'

// Pages
import Home        from '@/pages/Home'
import Login       from '@/pages/Login'
import Register    from '@/pages/Register'
import Dashboard   from '@/pages/Dashboard'
import Workout     from '@/pages/Workout'
import BMI         from '@/pages/BMI'
import Calories    from '@/pages/Calories'
import Diet        from '@/pages/Diet'
import Posture     from '@/pages/Posture'
import Profile     from '@/pages/Profile'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected app pages inside Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workout"   element={<Workout />} />
        <Route path="/bmi"       element={<BMI />} />
        <Route path="/calories"  element={<Calories />} />
        <Route path="/diet"      element={<Diet />} />
        <Route path="/posture"   element={<Posture />} />
        <Route path="/profile"   element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
