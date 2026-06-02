import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { KeyRound, Eye, EyeOff, Zap, ShieldCheck, ShieldAlert } from 'lucide-react'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState('')
  const [err, setErr] = useState('')

  const mut = useMutation({
    mutationFn: () => api.post('/auth/reset-password', { token, password: form.password }),
    onSuccess: (res) => {
      setSuccess(res.data.message || 'Password reset successful!')
      setForm({ password: '', confirmPassword: '' })
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    },
    onError: (e) => {
      setErr(e.response?.data?.error || 'Failed to reset password. The link may have expired.')
    }
  })

  const handle = (e) => {
    e.preventDefault()
    if (!token) {
      setErr('No reset token was found in the link. Please request a new reset link.')
      return
    }
    if (form.password.length < 6) {
      setErr('Password must be at least 6 characters long.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setErr('Passwords do not match.')
      return
    }
    setErr('')
    setSuccess('')
    mut.mutate()
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
          <h1 className="font-syne font-black text-3xl text-white">Create New Password</h1>
          <p className="text-white/40 text-sm mt-2">Establish your new account security key</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto mb-4 animate-bounce">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Updated</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">{success}</p>
              <p className="text-xs text-neon-purple mt-2 flex items-center gap-1.5 justify-center">
                Redirecting to login portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handle} className="flex flex-col gap-5">
              {!token && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>No recovery token was found in the URL parameter. Make sure you copied the entire URL correctly.</span>
                </div>
              )}

              <div>
                <label className="text-xs text-white/40 tracking-widest mb-2 block">NEW PASSWORD</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(f => ({...f, password: e.target.value}))}
                    placeholder="••••••••"
                    required
                    disabled={!token}
                    className="input-neon w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    disabled={!token}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 tracking-widest mb-2 block">CONFIRM PASSWORD</label>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm(f => ({...f, confirmPassword: e.target.value}))}
                  placeholder="••••••••"
                  required
                  disabled={!token}
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
                disabled={mut.isPending || !token}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-2"
              >
                <KeyRound size={16} /> {mut.isPending ? 'Updating password…' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  )
}
