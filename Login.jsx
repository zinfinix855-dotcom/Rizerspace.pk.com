import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, LogIn } from 'lucide-react'
import { loginStart, loginSuccess, loginFail } from '../store/authSlice'
import api from '../services/api'

import toast from '../utils/toast'

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [show, setShow]   = useState(false)
  const [err,  setErr]    = useState('')

  const mut = useMutation({
    mutationFn: () => api.post('/auth/login', form),
    onMutate:  () => { dispatch(loginStart()); setErr('') },
    onSuccess: (res) => {
      dispatch(loginSuccess(res.data))
      toast.success(`Welcome back, ${res.data.user.name}! 👋`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    },
    onError: (e) => {
      const msg = e.response?.data?.error || 'Login failed'
      dispatch(loginFail(msg)); setErr(msg)
      toast.error(msg)
    },
  })

  const handle = (e) => { e.preventDefault(); mut.mutate() }

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 animate-float" style={{background:'radial-gradient(circle,#b833ff,transparent)'}} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#1e90ff,transparent)',animationDelay:'3s'}} />
      </div>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#b833ff,#1e90ff)'}}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-syne font-black text-2xl">RIZER<span className="gradient-text">SPACE</span></span>
          </Link>
          <h1 className="font-syne font-black text-3xl text-white">Welcome Back</h1>
          <p className="text-white/40 text-sm mt-2">Sign in to your collector account</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          <form onSubmit={handle} className="flex flex-col gap-5">
            <div>
              <label className="text-xs text-white/40 tracking-widest mb-2 block">EMAIL ADDRESS</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="naruto@konoha.jp" required className="input-neon w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-white/40 tracking-widest">PASSWORD</label>
                <Link to="/forgot-password" className="text-xs text-neon-purple hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="••••••••" required className="input-neon w-full pr-10" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {err && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">{err}</p>}
            <button type="submit" disabled={mut.isPending} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              <LogIn size={16} /> {mut.isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="neon-divider my-6" />
          <p className="text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-neon-purple hover:underline font-semibold">Create one</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5 text-center">
            <p className="text-xs text-white/30 mb-1 font-semibold">DEMO CREDENTIALS</p>
            <p className="text-xs text-white/40 font-mono">admin@rizerspace.com / Admin@1337</p>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
