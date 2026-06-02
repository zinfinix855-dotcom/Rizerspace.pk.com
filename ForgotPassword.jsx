import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, Zap, ShieldAlert } from 'lucide-react'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState('')
  const [err, setErr] = useState('')

  const mut = useMutation({
    mutationFn: () => api.post('/auth/forgot-password', { email }),
    onSuccess: (res) => {
      setSuccess(res.data.message || 'Recovery link has been generated.')
      setEmail('')
    },
    onError: (e) => {
      setErr(e.response?.data?.error || 'Failed to submit recovery request.')
    }
  })

  const handle = (e) => {
    e.preventDefault()
    if (!email) return
    setErr('')
    setSuccess('')
    mut.mutate()
  }

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#b833ff,transparent)'}} />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#1e90ff,transparent)',animationDelay:'2s'}} />
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#b833ff,#1e90ff)'}}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-syne font-black text-2xl">RIZER<span className="gradient-text">SPACE</span></span>
          </Link>
          <h1 className="font-syne font-black text-3xl text-white">Reset Password</h1>
          <p className="text-white/40 text-sm mt-2">Request a password recovery credential</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple mx-auto mb-4">
                <Mail size={32} className="animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Request Generated</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">{success}</p>
              
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-left mb-6">
                <p className="text-xs text-neon-blue mb-1 font-bold">DEVELOPER CHECKLIST</p>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Go to your server terminal console to retrieve the generated password reset link. Copy and open that URL to complete the reset.
                </p>
              </div>

              <Link to="/login" className="btn-secondary w-full inline-flex items-center justify-center gap-2 py-3.5">
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handle} className="flex flex-col gap-5">
              <p className="text-white/60 text-sm text-center leading-relaxed">
                Enter your registered email address below. We'll generate a token links credential which you can use to choose a new password.
              </p>

              <div>
                <label className="text-xs text-white/40 tracking-widest mb-2 block">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naruto@konoha.jp"
                  required
                  className="input-neon w-full"
                />
              </div>

              {err && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={mut.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4"
              >
                {mut.isPending ? 'Sending request…' : 'Generate Reset Link'} <ArrowRight size={16} />
              </button>

              <div className="neon-divider my-2" />

              <Link to="/login" className="inline-flex items-center justify-center gap-2 text-xs text-white/50 hover:text-white transition-colors py-1">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  )
}
