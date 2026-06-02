import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Truck, RotateCcw, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

const CATEGORIES = ['Dragon Ball Z','Naruto','One Piece','Demon Slayer','Attack on Titan','Jujutsu Kaisen','My Hero Academia','Bleach','One Punch Man']

const STAT_ITEMS = [
  { value: '200+', label: 'Figures' },
  { value: '4.9★', label: 'Rating' },
  { value: 'Free', label: 'Shipping' },
  { value: '30-Day', label: 'Returns' },
]

const TRUST_ITEMS = [
  { icon: Truck,     title: 'Free Worldwide Shipping', sub: 'On all orders over $50' },
  { icon: Shield,    title: 'Secure Checkout',         sub: '256-bit SSL encryption' },
  { icon: RotateCcw, title: '30-Day Returns',          sub: 'No questions asked' },
  { icon: Star,      title: '100% Authentic',          sub: 'Officially licensed figures' },
]

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products?sort=rating&limit=8').then(r => r.data.data),
  })
  const { data: newArrivals } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => api.get('/products?sort=newest&limit=4').then(r => r.data.data),
  })

  return (
    <main className="pt-16 overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float" style={{background:'radial-gradient(circle,#b833ff,transparent)'}} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-float" style={{background:'radial-gradient(circle,#1e90ff,transparent)',animationDelay:'2s'}} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-10 animate-float" style={{background:'radial-gradient(circle,#00f5ff,transparent)',animationDelay:'4s'}} />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}} transition={{duration:0.8}}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-purple/30 bg-neon-purple/10 mb-6">
              <Zap size={12} className="text-neon-purple" />
              <span className="text-xs font-semibold text-neon-purple tracking-widest">PREMIUM ANIME COLLECTIBLES</span>
            </div>
            <h1 className="font-syne font-black text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-6">
              The Finest<br />
              <span className="gradient-text glow-purple">Anime Figures.</span><br />
              <span className="text-white/60">Delivered.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-lg mb-10">
              Premium 1/6 &amp; 1/7 scale figures from your favourite series. Officially licensed, museum-grade quality shipped worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/catalog?sort=newest" className="btn-secondary">New Arrivals</Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-14">
              {STAT_ITEMS.map(s => (
                <div key={s.label}>
                  <div className="font-syne font-black text-2xl gradient-text">{s.value}</div>
                  <div className="text-xs text-white/40 tracking-widest mt-0.5">{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.2}}
            className="hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80 animate-float">
              <div className="absolute inset-0 rounded-3xl animate-glow" style={{background:'linear-gradient(135deg,rgba(184,51,255,0.3),rgba(30,144,255,0.2))',backdropFilter:'blur(20px)',border:'1px solid rgba(184,51,255,0.3)'}} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-9xl font-black opacity-30 select-none" style={{fontFamily:'serif',background:'linear-gradient(135deg,#b833ff,#00f5ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>漫</div>
                  <div className="font-syne font-bold text-lg gradient-text mt-2 tracking-wider">ANIME UNIVERSE</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-syne font-black text-3xl text-white">Browse <span className="gradient-text">Categories</span></h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <Link to={`/catalog?category=${encodeURIComponent(cat)}`}
                  className="px-5 py-2.5 rounded-full glass border border-white/10 text-sm font-medium text-white/60 hover:text-white hover:border-neon-purple/50 hover:bg-neon-purple/10 transition-all duration-200">
                  {cat}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-neon-purple font-semibold tracking-widest mb-1">HAND-PICKED</p>
              <h2 className="font-syne font-black text-3xl text-white">Featured <span className="gradient-text">Figures</span></h2>
            </div>
            <Link to="/catalog?sort=rating" className="btn-secondary !py-2 !px-4 !text-xs flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {featured?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((p,i) => (
                <motion.div key={p._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="glass rounded-2xl h-72 animate-pulse border border-white/5" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals?.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs text-neon-cyan font-semibold tracking-widest mb-1">JUST LANDED</p>
                <h2 className="font-syne font-black text-3xl text-white">New <span className="text-neon-cyan glow-cyan">Arrivals</span></h2>
              </div>
              <Link to="/catalog?sort=newest" className="btn-secondary !py-2 !px-4 !text-xs flex items-center gap-1">
                See All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((p,i) => (
                <motion.div key={p._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="neon-divider mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(184,51,255,0.15)',border:'1px solid rgba(184,51,255,0.3)'}}>
                  <Icon size={18} className="text-neon-purple" />
                </div>
                <div>
                  <p className="font-syne font-bold text-sm text-white">{title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
