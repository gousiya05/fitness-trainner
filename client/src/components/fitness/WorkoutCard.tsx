import { motion } from 'framer-motion'
import { MdFitnessCenter, MdAccessTime, MdLocalFireDepartment, MdCheckCircle } from 'react-icons/md'
import { MUSCLE_COLORS } from '@/utils/constants'
import type { Exercise, WorkoutHistory } from '@/types'
import clsx from 'clsx'

// ─── Single Exercise card ──────────────────────────────────────────────
interface ExerciseCardProps {
  exercise: Exercise
  index: number
  onComplete?: (index: number) => void
}

export function ExerciseCard({ exercise, index, onComplete }: ExerciseCardProps) {
  const color = MUSCLE_COLORS[exercise.muscle] || '#00ff87'
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={clsx(
        'glass p-4 flex items-center gap-4 group transition-all',
        exercise.completed && 'opacity-60'
      )}
    >
      {/* Index badge */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
        style={{ background: color, color: '#07070e' }}>
        {exercise.completed ? <MdCheckCircle /> : index + 1}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={clsx('font-semibold text-sm', exercise.completed && 'line-through text-white/40')}>
          {exercise.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color }}>{exercise.muscle}</p>
      </div>

      {/* Metrics */}
      <div className="flex gap-3 items-center text-center shrink-0">
        <div>
          <p className="font-bold text-white text-sm">{exercise.sets}</p>
          <p className="text-white/30 text-xs">sets</p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div>
          <p className="font-bold text-white text-sm">{exercise.reps}</p>
          <p className="text-white/30 text-xs">reps</p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div>
          <p className="font-bold text-fire text-sm">{exercise.calories}</p>
          <p className="text-white/30 text-xs">kcal</p>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div>
          <p className="font-bold text-white/50 text-sm">{exercise.rest}s</p>
          <p className="text-white/30 text-xs">rest</p>
        </div>
      </div>

      {/* Complete button */}
      {onComplete && !exercise.completed && (
        <button
          onClick={() => onComplete(index)}
          className="w-8 h-8 rounded-lg border border-white/10 hover:border-neon/50 hover:bg-neon/8 text-white/30 hover:text-neon transition-all flex items-center justify-center shrink-0"
        >
          <MdCheckCircle size={16} />
        </button>
      )}
    </motion.div>
  )
}

// ─── Workout history card ──────────────────────────────────────────────
interface WorkoutCardProps {
  workout: WorkoutHistory
  onView?: (w: WorkoutHistory) => void
  delay?: number
}

export function WorkoutCard({ workout, onView, delay = 0 }: WorkoutCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass p-4 flex items-center gap-4 hover:border-white/12 transition-all cursor-pointer group"
      onClick={() => onView?.(workout)}
    >
      <div className="w-11 h-11 rounded-xl bg-neon/8 border border-neon/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <MdFitnessCenter className="text-neon text-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{workout.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-white/40 text-xs flex items-center gap-1">
            <MdAccessTime size={12} />
            {new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {workout.durationMinutes > 0 && (
            <span className="text-white/40 text-xs">{workout.durationMinutes} min</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-neon text-sm flex items-center gap-1">
          <MdLocalFireDepartment /> {workout.totalCalories || '—'}
        </p>
        <p className="text-white/30 text-xs">kcal</p>
      </div>
    </motion.div>
  )
}

export default ExerciseCard
