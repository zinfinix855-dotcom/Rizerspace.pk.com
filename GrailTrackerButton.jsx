import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Trophy, ChevronDown, X, Check } from 'lucide-react'
import api from '../services/api'

export default function GrailTrackerButton({ product }) {
  const { user } = useSelector(s => s.auth)
  const { symbol, rates, code } = useSelector(s => s.currency)
  const rate = rates[code] || 1
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [notifyRestock, setNotifyRestock] = useState(true)
  const [notifyListing, setNotifyListing] = useState(true)
  const [confirmed, setConfirmed] = useState(false)

  // Check if already tracking this product
  const { data: trackersData } = useQuery({
    queryKey: ['grail-trackers'],
    queryFn: () => api.get('/grail-tracker').then(r => r.data.data),
    enabled: !!user
  })

  const isTracking = trackersData?.some(t => t.product?._id === product._id || t.product === product._id)
  const existingTracker = trackersData?.find(t => t.product?._id === product._id || t.product === product._id)

  const upsertMutation = useMutation({
    mutationFn: (payload) => api.post('/grail-tracker', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grail-trackers'] })
      setConfirmed(true)
      setTimeout(() => { setConfirmed(false); setOpen(false) }, 2000)
    }
  })

  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/grail-tracker/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grail-trackers'] })
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    upsertMutation.mutate({
      productId: product._id,
      targetPrice: targetPrice ? Number(targetPrice) / rate : null,
      notifyOnRestock: notifyRestock,
      notifyOnListing: notifyListing
    })
  }

  if (!user) return null

  return (
    <div className="relative">
      {isTracking ? (
        <button
          onClick={() => existingTracker && removeMutation.mutate(existingTracker._id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-syne font-bold tracking-wider hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all group">
          <Bell size={14} fill="currentColor" />
          <span>Tracking Grail</span>
          <BellOff size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neon-purple/30 bg-neon-purple/5 text-neon-purple text-xs font-syne font-bold tracking-wider hover:border-neon-purple/60 hover:bg-neon-purple/10 transition-all">
          <Trophy size={14} />
          <span>Track this Grail</span>
          <ChevronDown size={12} />
        </button>
      )}

      {/* Tracker Setup Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="absolute right-0 top-full mt-2 w-72 glass border border-white/10 rounded-2xl p-5 z-30 shadow-2xl shadow-black/50">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-yellow-400" />
                <h4 className="font-syne font-black text-sm text-white">Set Grail Alert</h4>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
                <X size={15} />
              </button>
            </div>

            {confirmed ? (
              <div className="flex flex-col items-center gap-2 py-4 text-green-400">
                <Check size={28} className="animate-bounce" />
                <p className="font-syne font-bold text-sm">Grail Tracker Activated!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Price alert */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">
                    Alert when price drops below ({code})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">{symbol}</span>
                    <input
                      type="number"
                      placeholder={`${symbol}${((product.discountedPrice || product.price) * rate).toFixed(0)} (current)`}
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-neon-purple rounded-xl py-2.5 pl-8 pr-3 text-white text-sm placeholder-white/20 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[9px] text-white/25">Leave empty to skip price alerts.</p>
                </div>

                {/* Toggle options */}
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Notify when back In Stock', key: 'restock', value: notifyRestock, set: setNotifyRestock },
                    { label: 'Notify when listed on Marketplace', key: 'listing', value: notifyListing, set: setNotifyListing }
                  ].map(({ label, key, value, set }) => (
                    <button type="button" key={key}
                      onClick={() => set(!value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                        value ? 'border-neon-purple/40 bg-neon-purple/10 text-white' : 'border-white/8 bg-white/3 text-white/40'
                      }`}>
                      <span>{label}</span>
                      <div className={`w-8 h-4 rounded-full transition-colors ${value ? 'bg-neon-purple' : 'bg-white/10'} relative flex-shrink-0`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </button>
                  ))}
                </div>

                <button type="submit" disabled={upsertMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-syne font-black text-xs tracking-widest uppercase shadow-lg shadow-neon-purple/20 hover:opacity-90 transition-all mt-1">
                  {upsertMutation.isPending ? 'Activating...' : 'Activate Tracker 🏆'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop close */}
      {open && (
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}
