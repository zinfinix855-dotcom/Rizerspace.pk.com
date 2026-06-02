import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import api from '../services/api'

const STEPS = [
  { key: 'Pending',          label: 'Placed',         icon: Clock,       desc: 'Order received' },
  { key: 'Confirmed',        label: 'Confirmed',      icon: Clock,       desc: 'Confirmed by merchant' },
  { key: 'Processing',       label: 'Preparing',      icon: Package,     desc: 'Preparing collectibles' },
  { key: 'Packed',           label: 'Packed',         icon: Package,     desc: 'Items packed & sealed' },
  { key: 'Shipped',          label: 'Shipped',        icon: Truck,       desc: 'In transit to destination' },
  { key: 'Out for Delivery',  label: 'Out for Delivery', icon: Truck,       desc: 'Out with courier' },
  { key: 'Delivered',        label: 'Delivered',      icon: CheckCircle, desc: 'Enjoy your collectibles!' },
]

const STATUS_IDX = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Packed: 3,
  Shipped: 4,
  'Out for Delivery': 5,
  Delivered: 6
}

export default function OrderTracking() {
  const { id } = useParams()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data),
    refetchInterval: 30000,
  })

  if (isLoading) return (
    <main className="pt-24 px-4 min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-secondary animate-spin" />
    </main>
  )
  if (error || !order) return (
    <main className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center gap-4 text-white/50 bg-black">
      <p>Order not found.</p>
      <Link to="/orders" className="btn-secondary">← My Orders</Link>
    </main>
  )

  const isSpecialStatus = order.status === 'Cancelled' || order.status === 'Returned'
  const currentStep = isSpecialStatus ? -1 : (STATUS_IDX[order.status] ?? 0)

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-black">
      <div className="max-w-3xl mx-auto">
        <Link to="/orders" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h1 className="font-syne font-black text-3xl text-white">Track <span className="gradient-text">Order</span></h1>
            <p className="text-white/30 text-sm mt-1 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="glass rounded-2xl px-5 py-3 border border-white/8 text-right">
            <p className="text-xs text-white/40 mb-0.5">Order Total</p>
            <p className="font-syne font-black text-xl gradient-text">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Status Timeline */}
        {order.status === 'Cancelled' ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            className="glass rounded-2xl p-8 border border-red-500/30 flex flex-col items-center gap-4 mb-10">
            <XCircle size={48} className="text-red-500 animate-pulse" />
            <h2 className="font-syne font-bold text-xl text-red-500">Order Cancelled</h2>
            <p className="text-white/40 text-sm text-center">This order has been cancelled and voided.</p>
          </motion.div>
        ) : order.status === 'Returned' ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            className="glass rounded-2xl p-8 border border-yellow-500/30 flex flex-col items-center gap-4 mb-10">
            <XCircle size={48} className="text-yellow-500 animate-pulse" />
            <h2 className="font-syne font-bold text-xl text-yellow-500">Order Returned</h2>
            <p className="text-white/40 text-sm text-center">This shipment has been processed as a return.</p>
          </motion.div>
        ) : (
          <div className="glass rounded-2xl p-6 border border-white/8 mb-8 overflow-x-auto no-scrollbar">
            <div className="relative min-w-[600px] py-4">
              {/* Progress bar */}
              <div className="absolute top-10 left-6 right-6 h-0.5 bg-white/10 rounded-full">
                <motion.div className="h-full rounded-full" style={{background:'linear-gradient(90deg,#DC2626,#FF3B3B)'}}
                  initial={{width:'0%'}} animate={{width: `${(currentStep / (STEPS.length-1)) * 100}%`}}
                  transition={{duration:1, ease:'easeOut'}} />
              </div>
              <div className="flex justify-between relative z-10">
                {STEPS.map((step, i) => {
                  const done    = i <= currentStep
                  const active  = i === currentStep
                  const Icon    = step.icon
                  return (
                    <motion.div key={step.key} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                      className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        done ? 'border-secondary bg-secondary/20' :
                        'border-white/10 bg-dark-800'
                      } ${active ? 'animate-glow border-accent shadow-neon' : ''}`}>
                        <Icon size={20} className={done ? 'text-accent' : 'text-white/20'} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-bold ${done ? 'text-white' : 'text-white/30'}`}>{step.label}</p>
                        <p className="text-[9px] text-white/20 hidden sm:block mt-0.5 max-w-[90px] mx-auto">{step.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Items */}
          <div className="glass rounded-2xl p-5 border border-white/8">
            <h3 className="font-syne font-bold text-sm text-white mb-4">Items Ordered</h3>
            <div className="flex flex-col gap-3">
              {order.products?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg glass border border-white/10 flex items-center justify-center">
                    <Package size={14} className="text-neon-purple/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{item.product?.title || 'Anime Figure'}</p>
                    <p className="text-xs text-white/30">×{item.quantity} · ${item.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5 border border-white/8">
              <h3 className="font-syne font-bold text-sm text-white mb-3">Shipping To</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                {order.shippingAddress?.street}<br/>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}<br/>
                {order.shippingAddress?.country}
              </p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <h3 className="font-syne font-bold text-sm text-white mb-3">Payment</h3>
              <p className="text-xs text-white/50">Method: <span className="text-white/80">{order.payment?.method}</span></p>
              <p className="text-xs text-white/50 mt-1">Status: <span className={order.payment?.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>{order.payment?.status}</span></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
