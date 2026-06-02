import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, ArrowRight } from 'lucide-react'
import api from '../services/api'

const STATUS_COLORS = {
  Pending:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Shipped:    'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
  Delivered:  'text-green-400 bg-green-400/10 border-green-400/30',
  Cancelled:  'text-red-400 bg-red-400/10 border-red-400/30',
}

export default function OrderHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['myorders'],
    queryFn: () => api.get('/orders/myorders').then(r => r.data.data),
  })

  if (isLoading) return (
    <main className="pt-24 px-4 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-neon-purple animate-spin" />
    </main>
  )

  if (!data?.length) return (
    <main className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-7xl opacity-20">📦</div>
      <h2 className="font-syne font-black text-3xl text-white/50">No orders yet</h2>
      <p className="text-white/30">Your order history will appear here</p>
      <Link to="/catalog" className="btn-primary flex items-center gap-2">Shop Now <ArrowRight size={16} /></Link>
    </main>
  )

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-syne font-black text-4xl text-white mb-10">
          Order <span className="gradient-text">History</span>
        </h1>
        <div className="flex flex-col gap-4">
          {data.map((order, i) => (
            <motion.div key={order._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              className="glass rounded-2xl p-5 border border-white/8 hover:border-neon-purple/30 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-white/30 font-mono mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'text-white/50'}`}>
                    {order.status}
                  </span>
                  <span className="font-syne font-black text-lg gradient-text">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              {/* Items preview */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {order.products?.slice(0,3).map((item, j) => (
                  <div key={j} className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/5">
                    <Package size={12} className="text-neon-purple/60" />
                    <span className="text-xs text-white/60 max-w-[120px] truncate">{item.product?.title || 'Figure'}</span>
                    <span className="text-xs text-white/30">×{item.quantity}</span>
                  </div>
                ))}
                {order.products?.length > 3 && (
                  <div className="flex items-center glass rounded-xl px-3 py-2 border border-white/5">
                    <span className="text-xs text-white/30">+{order.products.length - 3} more</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-white/30">
                <span>via {order.payment?.method} · {order.payment?.status}</span>
                <Link to={`/orders/${order._id}`} className="flex items-center gap-1 text-neon-purple hover:text-neon-blue transition-colors font-semibold">
                  Track Order <ChevronRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
