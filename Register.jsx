import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, UserPlus } from 'lucide-react'
import { loginSuccess } from '../store/authSlice'
import api from '../services/api'

import toast from '../utils/toast'

export default function Register() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [err,  setErr]  = useState('')

  const mut = useMutation({
    mutationFn: () => api.post('/auth/register', { name: form.name, email: form.email, password: form.password }),
    onSuccess: (res) => {
      dispatch(loginSuccess(res.data))
      toast.success('Account created successfully! Check email for verification link. 📧')
      navigate('/')
    },
    onError:   (e)   => {
      const msg = e.response?.data?.error || 'Registration failed'
      setErr(msg)
      toast.error(msg)
    },
  })

  const handle = (e) => {
    e.preventDefault(); setErr('')
    if (form.password !== form.confirm) return setErr('Passwords do not match')
    if (form.password.length < 6) return setErr('Password must be at least 6 characters')
    mut.mutate()
  }

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 animate-float" style={{background:'radial-gradient(circle,#b833ff,transparent)'}} />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#00f5ff,transparent)',animationDelay:'2s'}} />
      </div>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#b833ff,#1e90ff)'}}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-syne font-black text-2xl">RIZER<span className="gradient-text">SPACE</span></span>
          </Link>
          <h1 className="font-syne font-black text-3xl text-white">Join the Collector's Club</h1>
          <p className="text-white/40 text-sm mt-2">Create your RizerSpace account</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          <form onSubmit={handle} className="flex flex-col gap-5">
            {[['name','Full Name','text','Your Name'], ['email','Email Address','email','naruto@konoha.jp']].map(([field,label,type,ph]) => (
              <div key={field}>
                <label className="text-xs text-white/40 tracking-widest mb-2 block">{label.toUpperCase()}</label>
                <input type={type} value={form[field]} onChange={e => setForm(f => ({...f,[field]:e.target.value}))}
                  placeholder={ph} required className="input-neon w-full" />
              </div>
            ))}
            {['password','confirm'].map((field, i) => (
              <div key={field}>
                <label className="text-xs text-white/40 tracking-widest mb-2 block">
                  {i === 0 ? 'PASSWORD' : 'CONFIRM PASSWORD'}
                </label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={form[field]}
                    onChange={e => setForm(f => ({...f,[field]:e.target.value}))}
                    placeholder="••••••••" required className="input-neon w-full pr-10" />
                  {i === 0 && (
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {err && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">{err}</p>}
            <button type="submit" disabled={mut.isPending} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              <UserPlus size={16} /> {mut.isPending ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
          <div className="neon-divider my-6" />
          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-purple hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
