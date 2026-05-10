import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import { MdCamera, MdCameraAlt, MdRefresh, MdCheckCircle, MdWarning, MdFitnessCenter } from 'react-icons/md'
import { Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EXERCISES_FOR_DETECTION } from '@/utils/constants'

function angle(a: {x:number;y:number}, b: {x:number;y:number}, c: {x:number;y:number}) {
  const rad = Math.atan2(c.y-b.y,c.x-b.x) - Math.atan2(a.y-b.y,a.x-b.x)
  let deg = Math.abs(rad * 180 / Math.PI)
  if (deg > 180) deg = 360 - deg
  return deg
}

export default function Posture() {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poseRef   = useRef<any>(null)
  const frameRef  = useRef<number | null>(null)

  const [running, setRunning]   = useState(false)
  const [reps, setReps]         = useState(0)
  const [score, setScore]       = useState(100)
  const [feedback, setFeedback] = useState<string[]>([])
  const [stage, setStage]       = useState<'up'|'down'>('up')
  const [exercise, setExercise] = useState('squat')
  const [mpLoaded, setMpLoaded] = useState(false)
  const [error, setError]       = useState<string|null>(null)

  useEffect(() => {
    let loaded = false
    const srcs = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
    ]
    const load = async () => {
      for (const src of srcs) {
        await new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
          const s = document.createElement('script')
          s.src = src; s.crossOrigin = 'anonymous'
          s.onload = () => resolve(); s.onerror = () => reject()
          document.head.appendChild(s)
        })
      }
      loaded = true; setMpLoaded(true)
    }
    load().catch(() => setError('Failed to load MediaPipe CDN. Check connection.'))
    return () => { loaded = false }
  }, [])

  const analyze = useCallback((lm: any[]) => {
    const issues: string[] = []
    let s = 100
    const [ls, rs, lh, rh, lk, rk, la, ra] = [11,12,23,24,25,26,27,28].map(i => lm[i])

    if (ls && rs && Math.abs(ls.y - rs.y) > 0.06) { s -= 20; issues.push('⚠️ Shoulders uneven') }
    if (ls && rs && lh && rh) {
      const smx = (ls.x+rs.x)/2, hmx = (lh.x+rh.x)/2
      if (Math.abs(smx-hmx) > 0.08) { s -= 20; issues.push('⚠️ Spine tilting sideways') }
    }

    if (exercise === 'squat' && lh && lk && la) {
      const a = angle({ x: lh.x, y: lh.y }, { x: lk.x, y: lk.y }, { x: la.x, y: la.y })
      if (a > 160) { setStage(st => { if (st === 'down') setReps(r => r+1); return 'up' }) }
      else if (a < 90) { setStage('down') }
    }
    if (exercise === 'push_up' && ls && lm[13] && lm[15]) {
      const a = angle({ x: ls.x, y: ls.y }, { x: lm[13].x, y: lm[13].y }, { x: lm[15].x, y: lm[15].y })
      if (a > 160) { setStage(st => { if (st === 'down') setReps(r => r+1); return 'up' }) }
      else if (a < 90) { setStage('down') }
    }
    if (!issues.length) issues.push('✅ Great form! Keep going!')
    setScore(Math.max(0, s)); setFeedback(issues)
  }, [exercise])

  const initPose = useCallback(() => {
    if (!mpLoaded || !(window as any).Pose) return
    poseRef.current = new (window as any).Pose({
      locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
    })
    poseRef.current.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
    poseRef.current.onResults((res: any) => {
      const canvas = canvasRef.current, video = webcamRef.current?.video
      if (!canvas || !video) return
      canvas.width = video.videoWidth; canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (res.poseLandmarks) {
        if ((window as any).drawConnectors) {
          (window as any).drawConnectors(ctx, res.poseLandmarks, (window as any).POSE_CONNECTIONS, { color: 'rgba(0,255,135,0.7)', lineWidth: 3 })
          ;(window as any).drawLandmarks(ctx, res.poseLandmarks, { color: '#00ff87', radius: 4, lineWidth: 1 })
        }
        analyze(res.poseLandmarks)
      }
    })
  }, [mpLoaded, analyze])

  const start = async () => {
    setError(null); setReps(0); setStage('up')
    if (!mpLoaded) { setError('MediaPipe not ready yet — wait a moment'); return }
    const video = webcamRef.current?.video
    if (!video) { setError('Webcam unavailable'); return }
    initPose()
    if (!poseRef.current) { setError('Pose model failed to initialize'); return }
    setRunning(true)
    const detect = async () => {
      if (poseRef.current && video.readyState === 4) await poseRef.current.send({ image: video })
      frameRef.current = requestAnimationFrame(detect)
    }
    detect()
  }

  const stop = () => {
    setRunning(false)
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  useEffect(() => () => stop(), [])

  const scoreColor = score >= 80 ? '#00ff87' : score >= 60 ? '#fbbf24' : '#f87171'
  const circumference = 2 * Math.PI * 40

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl flex items-center gap-2">
          <MdCameraAlt className="text-violet-light" /> AI Posture <span className="gradient-text">Detection</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">Real-time MediaPipe pose analysis · Rep counter · Form scoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Webcam panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="!p-4">
            <div className="relative rounded-xl overflow-hidden bg-bg-primary aspect-video">
              <Webcam ref={webcamRef} mirrored className="w-full h-full object-cover" videoConstraints={{ facingMode: 'user', width: 1280, height: 720 }} />
              <canvas ref={canvasRef} className="pose-canvas" />

              {running && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs">
                  <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                  <span className="text-neon font-semibold">LIVE</span>
                </div>
              )}
              {!running && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MdCamera className="text-5xl text-white/15 mx-auto mb-2" />
                    <p className="text-white/25 text-sm">Start Detection to begin</p>
                  </div>
                </div>
              )}
              {running && (
                <>
                  <div className="absolute bottom-3 left-3 glass-dark px-4 py-2 rounded-xl">
                    <p className="text-white/35 text-xs uppercase">Reps</p>
                    <p className="font-display font-black text-4xl text-neon leading-none">{reps}</p>
                  </div>
                  <div className="absolute bottom-3 right-3 glass-dark px-4 py-2 rounded-xl text-center">
                    <p className="text-white/35 text-xs uppercase">Form</p>
                    <p className="font-display font-black text-3xl leading-none" style={{ color: scoreColor }}>{score}</p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-danger/8 border border-danger/20 text-danger text-sm flex gap-2">
                <MdWarning className="shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={exercise}
              onChange={e => { setExercise(e.target.value); setReps(0); setStage('up') }}
              options={EXERCISES_FOR_DETECTION.map(e => ({ value: e.value, label: e.label }))}
              className="w-40"
            />
            {!running
              ? <Button onClick={start} icon={<MdCamera />}>Start Detection</Button>
              : <Button onClick={stop} variant="danger">Stop</Button>
            }
            <button onClick={() => { setReps(0); setStage('up') }}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl glass text-white/50 hover:text-white text-sm transition-colors">
              <MdRefresh size={16} /> Reset
            </button>
            {!mpLoaded && (
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <div className="w-3 h-3 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
                Loading AI model...
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Score ring */}
          <Card className="!p-5 text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Posture Score</p>
            <div className="relative inline-flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-28 h-28">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40" fill="none" stroke={scoreColor}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
                  transition={{ duration: 0.6 }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="absolute">
                <p className="font-display font-black text-3xl" style={{ color: scoreColor }}>{score}</p>
                <p className="text-white/25 text-xs">/100</p>
              </div>
            </div>
          </Card>

          {/* Feedback */}
          <Card variant="dark" className="!p-5">
            <h3 className="font-semibold text-sm text-white/50 mb-3 flex items-center gap-2">
              <MdCheckCircle className="text-neon" /> Real-time Feedback
            </h3>
            <AnimatePresence mode="popLayout">
              {feedback.length > 0
                ? feedback.map((f, i) => (
                  <motion.p key={f} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="text-sm text-white/65 mb-2">{f}</motion.p>
                ))
                : <p className="text-white/25 text-sm">Start detection to see feedback</p>
              }
            </AnimatePresence>
          </Card>

          {/* Tips */}
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-white/50 mb-3 flex items-center gap-2">
              <MdFitnessCenter className="text-violet-light" /> {exercise.replace('_', ' ')} Tips
            </h3>
            <ul className="space-y-1.5 text-xs text-white/40">
              {exercise === 'squat' && (<>
                <li>• Feet shoulder-width apart</li><li>• Knees track over toes</li>
                <li>• Keep chest up, back neutral</li><li>• Hit parallel or below</li>
              </>)}
              {exercise === 'push_up' && (<>
                <li>• Hands wider than shoulders</li><li>• Body in straight line</li>
                <li>• Lower chest to ground</li><li>• Don't let hips drop</li>
              </>)}
              {!['squat','push_up'].includes(exercise) && (
                <li>Position yourself fully in frame for best accuracy.</li>
              )}
            </ul>
          </Card>

          <Card variant="dark" className="!p-4">
            <p className="text-white/40 text-xs font-semibold mb-2">How it works</p>
            <div className="space-y-1 text-xs text-white/25">
              <p>• MediaPipe tracks 33 body points</p><p>• Joint angles computed per frame</p>
              <p>• Form scored 0–100 in real-time</p><p>• Reps detected from angle patterns</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
