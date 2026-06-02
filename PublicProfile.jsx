import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Archive, Shield, Star, ExternalLink } from 'lucide-react'
import api from '../services/api'

const RARITY_COLORS = {
  Grail:       'border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  'Super Rare':'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  Rare:        'border-blue-500/30',
  Common:      'border-white/8'
}

const CONDITION_STYLES = {
  MISB:  'bg-green-500 text-black',
  MIB:   'bg-blue-500 text-white',
  Loose: 'bg-yellow-500 text-black'
}

export default function PublicProfile() {
  const { username } = useParams()
  const { symbol, rates, code } = useSelector(s => s.currency)
  const rate = rates[code] || 1

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => api.get(`/collector/profile/${username}`).then(r => r.data)
  })

  if (isLoading) return (
    <main className="pt-24 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-neon-purple animate-spin" />
    </main>
  )

  if (error || !data) return (
    <main className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4 text-white/50">
      <Shield size={48} className="stroke-1 opacity-30" />
      <h2 className="font-syne font-black text-xl text-white/70">Collector Not Found</h2>
      <p className="text-sm max-w-xs text-center">
        {error?.response?.data?.error || 'This profile does not exist or has been set to private.'}
      </p>
      <Link to="/catalog" className="btn-secondary mt-2">← Browse Catalog</Link>
    </main>
  )

  const { collector, showcase } = data
  const xpInLevel = collector.xp % 300
  const xpPct = Math.min(100, Math.round((xpInLevel / 300) * 100))

  const rarityOrder = { Grail: 0, 'Super Rare': 1, Rare: 2, Common: 3 }
  const sortedItems = [...(showcase.items || [])].sort(
    (a, b) => (rarityOrder[a.product?.rarity] ?? 4) - (rarityOrder[b.product?.rarity] ?? 4)
  )

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* ── Profile Hero ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-white/8 rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden">

          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-neon-purple/15 to-neon-blue/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center border-2 border-white/20 shadow-2xl shadow-neon-purple/20">
                <span className="text-4xl font-black text-white font-syne select-none">
                  {collector.name?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-syne font-black text-xs px-3 py-1.5 rounded-xl border border-yellow-300/30 shadow-lg">
                LVL {collector.level}
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="font-syne font-black text-3xl text-white">{collector.name}</h1>
                <span className="text-xs font-bold text-white/30 tracking-widest uppercase bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                  /rizer/{collector.username}
                </span>
              </div>
              <p className="text-xs text-white/40 tracking-widest font-medium uppercase mb-4">
                RizerSpace Certified Custodian · Member since {new Date(collector.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </p>

              {/* XP Bar */}
              <div className="max-w-sm mb-5">
                <div className="flex justify-between text-[10px] font-bold text-white/30 tracking-wider mb-1.5">
                  <span>LEVEL {collector.level} PROGRESS</span>
                  <span>{collector.xp} XP TOTAL</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full shadow-[0_0_8px_#b833ff]" />
                </div>
              </div>

              {/* Badges */}
              {collector.badges?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {collector.badges.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-3 py-1.5 text-xs font-bold text-white/70">
                      <span>{b.icon}</span>
                      <span>{b.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats column */}
            <div className="flex md:flex-col gap-6 md:gap-4 text-center border-t md:border-t-0 md:border-l border-white/8 pt-6 md:pt-0 md:pl-10 flex-shrink-0">
              <div>
                <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold block mb-0.5">Figures</span>
                <span className="font-syne font-black text-2xl text-white flex items-center justify-center gap-1.5">
                  <Archive size={16} className="text-neon-blue" />{showcase.totalItems}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold block mb-0.5">Portfolio</span>
                <span className="font-syne font-black text-xl text-neon-purple">
                  {symbol}{(showcase.currentEstimatedValue * rate).toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold block mb-0.5">Loyalty</span>
                <span className="font-syne font-black text-xl text-amber-400 flex items-center justify-center gap-1">
                  <Star size={14} fill="currentColor" />{collector.loyaltyPoints}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Cabinet Showcase ──────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-syne font-black text-xl text-white">
            Glass Cabinet <span className="gradient-text">Showcase</span>
          </h2>
          <span className="text-xs text-white/30 tracking-wider font-medium">
            {showcase.totalItems} figure{showcase.totalItems !== 1 ? 's' : ''} · Est. {symbol}{(showcase.currentEstimatedValue * rate).toFixed(2)}
          </span>
        </div>

        {sortedItems.length === 0 ? (
          <div className="glass border border-white/5 rounded-3xl p-16 text-center text-white/40 flex flex-col items-center gap-3">
            <Archive size={40} className="stroke-1 opacity-30" />
            <p className="font-syne font-bold">This collector's cabinet is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedItems.map((item, i) => {
              const p = item.product
              const estVal = item.estimatedCurrentValue || item.acquisitionPrice
              const rarity = p?.rarity || 'Common'

              return (
                <motion.div key={item._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/product/${p?._id}`} className="block group">
                    <div className={`glass border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${RARITY_COLORS[rarity] || 'border-white/8'}`}>

                      {/* Image */}
                      <div className="relative h-44 overflow-hidden flex items-center justify-center"
                        style={{ background: p?.gradient || 'linear-gradient(135deg,#120C1F,#000)' }}>
                        {p?.images?.[0]
                          ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <span className="text-7xl opacity-10 font-black">{p?.symbol}</span>
                        }
                        {/* Condition */}
                        <span className={`absolute top-3 left-3 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded shadow ${CONDITION_STYLES[item.condition] || 'bg-white/10 text-white/60'}`}>
                          {item.condition}
                        </span>
                        {/* Rarity */}
                        <span className={`absolute top-3 right-3 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded shadow ${
                          rarity === 'Grail'       ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black' :
                          rarity === 'Super Rare'  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'  :
                          rarity === 'Rare'        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'    :
                          'bg-white/10 text-white/60'
                        }`}>
                          {rarity}
                        </span>
                        {/* Serial */}
                        {item.serialNumber && (
                          <span className="absolute bottom-2 right-2 text-[9px] bg-black/70 text-white/70 font-mono px-1.5 py-0.5 rounded border border-white/5">
                            #{item.serialNumber}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="text-[10px] text-neon-blue font-bold tracking-wider uppercase mb-0.5">{p?.category}</p>
                        <h4 className="font-syne font-black text-sm text-white truncate mb-3">{p?.title}</h4>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <div>
                            <span className="text-[9px] text-white/30 tracking-wider block">Est. Value</span>
                            <span className="font-syne font-black text-sm text-neon-purple">{symbol}{(estVal * rate).toFixed(2)}</span>
                          </div>
                          <ExternalLink size={13} className="text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                      </div>

                      {/* Shelf LED glow */}
                      <div className={`h-0.5 w-full ${
                        rarity === 'Grail'      ? 'bg-gradient-to-r from-amber-500/60 via-yellow-400/80 to-amber-500/60' :
                        rarity === 'Super Rare' ? 'bg-gradient-to-r from-purple-600/60 via-pink-500/80 to-purple-600/60' :
                        rarity === 'Rare'       ? 'bg-gradient-to-r from-blue-600/40 via-cyan-400/60 to-blue-600/40'     :
                        'bg-gradient-to-r from-white/5 via-white/10 to-white/5'
                      }`} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
