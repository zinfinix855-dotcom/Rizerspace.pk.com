import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2, ArrowRight, Home, Zap } from 'lucide-react'
import { loginSuccess } from '../store/authSlice'
import api from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const tokenFromUrl = searchParams.get('token') || ''
  
  const [tokenInput, setTokenInput] = useState(tokenFromUrl)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  const mut = useMutation({
    mutationFn: (token) => api.post('/auth/verify-email', { token }),
    onSuccess: (res) => {
      setSuccess(res.data.message || 'Email verified successfully!')
      // If user object is returned, update the auth state
      if (res.data.user) {
        dispatch(loginSuccess({ user: res.data.user, token: localStorage.getItem('rizerToken') }))
      }
      setTimeout(() => {
        navigate('/')
      }, 3000)
    },
    onError: (e) => {
      setErr(e.response?.data?.error || 'Verification failed. The token may be invalid or expired.')
    }
  })

  // Auto-run if token is in the URL
  const { mutate } = mut

  useEffect(() => {
    if (tokenFromUrl) {
      mutate(tokenFromUrl)
    }
  }, [tokenFromUrl, mutate])

  const handleManualVerify = (e) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    setErr('')
    setSuccess('')
    mut.mutate(tokenInput.trim())
  }

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#1e90ff,transparent)'}} />
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#b833ff,transparent)',animationDelay:'2s'}} />
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#b833ff,#1e90ff)'}}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-syne font-black text-2xl">RIZER<span className="gradient-text">SPACE</span></span>
          </Link>
          <h1 className="font-syne font-black text-3xl text-white">Email Verification</h1>
          <p className="text-white/40 text-sm mt-2">Activate your premium access status</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8 text-center">
          {mut.isPending ? (
            <div className="flex flex-col items-center py-6 gap-4">
              <Loader2 className="w-12 h-12 text-neon-blue animate-spin" />
              <p className="text-white/80 font-medium">Verifying your token credentials...</p>
              <p className="text-xs text-white/40">This will only take a moment.</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center py-4 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-2">
                <ShieldCheck size={36} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white">Verification Complete</h2>
              <p className="text-white/60 text-sm max-w-xs">{success}</p>
              <p className="text-xs text-neon-purple mt-2 flex items-center gap-1.5 justify-center">
                Redirecting to home base <Loader2 size={12} className="animate-spin" />
              </p>
            </div>
          ) : (
            <div>
              {err && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {err}
                </div>
              )}

              {tokenFromUrl ? (
                <p className="text-white/60 text-sm mb-6">
                  An automatic verification request was sent using the code in your link. If it failed, you can re-enter your code below.
                </p>
              ) : (
                <p className="text-white/60 text-sm mb-6">
                  Please enter the verification code sent to your email to activate your account.
                </p>
              )}

              <form onSubmit={handleManualVerify} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-white/40 tracking-widest mb-2 block text-left">VERIFICATION TOKEN</label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Enter your hex verification token"
                    required
                    className="input-neon w-full font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mut.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-2"
                >
                  Confirm Verification <ArrowRight size={16} />
                </button>
              </form>

              {/* Dev Tip */}
              <div className="mt-8 p-3 rounded-2xl bg-white/3 border border-white/5 text-left">
                <p className="text-xs text-neon-purple mb-1 font-bold">DEVELOPER MODE TIP</p>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Since we are in development, check the terminal logs where you started the backend server to find the verification link containing the token.
                </p>
              </div>

              <div className="neon-divider my-6" />
              <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                <Home size={14} /> Back to homepage
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  )
}
