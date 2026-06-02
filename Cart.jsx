import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { removeFromCart, updateQty, selectCartTotal } from '../store/cartSlice'

export default function Cart() {
  const dispatch  = useDispatch()
  const items     = useSelector(s => s.cart.items)
  const total     = useSelector(selectCartTotal)
  const { symbol, rates, code } = useSelector(s => s.currency)
  const rate = rates[code] || 1

  const fmt = (usd) => `${symbol}${(usd * rate).toFixed(2)}`

  if (items.length === 0) return (
    <main className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-7xl opacity-20">🛒</div>
      <h2 className="font-syne font-black text-3xl text-white/50">Your cart is empty</h2>
      <p className="text-white/30">Add some epic figures to get started!</p>
      <Link to="/catalog" className="btn-primary flex items-center gap-2">
        Browse Catalog <ArrowRight size={16} />
      </Link>
    </main>
  )

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-syne font-black text-4xl text-white mb-10">
          Shopping <span className="gradient-text">Cart</span>
          <span className="text-white/30 font-normal text-xl ml-3">({items.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item._id} layout initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  className="glass rounded-2xl p-4 border border-white/8 flex gap-4">
                  {/* Image */}
                  <Link to={`/product/${item._id}`}
                    className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{background: item.gradient || 'linear-gradient(135deg,#120C1F,#1e0538)'}}>
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      : <span className="text-3xl opacity-20 font-black" style={{fontFamily:'serif'}}>{item.symbol}</span>
                    }
                  </Link>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item._id}`} className="font-syne font-bold text-sm text-white hover:text-neon-purple transition-colors truncate block">
                      {item.title}
                    </Link>
                    <p className="text-xs text-white/40 mt-0.5">{item.category}</p>
                    <div className="flex items-center justify-between mt-3">
                      {/* Qty Controls */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => dispatch(updateQty({id: item._id, qty: item.qty - 1}))}
                          className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center hover:border-neon-purple/40 transition-all">
                          <Minus size={12} />
                        </button>
                        <span className="font-syne font-bold text-sm w-6 text-center">{item.qty}</span>
                        <button onClick={() => dispatch(updateQty({id: item._id, qty: item.qty + 1}))}
                          className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center hover:border-neon-purple/40 transition-all">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-syne font-black text-base gradient-text">
                        {fmt((item.discountedPrice || item.price) * item.qty)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item._id))}
                    className="self-start text-white/20 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 border border-white/8 sticky top-24">
              <h3 className="font-syne font-bold text-lg text-white mb-6">Order Summary</h3>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span><span>{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>Shipping</span><span>FREE</span>
                </div>
              </div>
              <div className="neon-divider mb-5" />
              <div className="flex justify-between items-center mb-6">
                <span className="font-syne font-bold text-white">Total</span>
                <span className="font-syne font-black text-2xl gradient-text">{fmt(total)}</span>
              </div>
              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                <ShoppingBag size={16} /> Proceed to Checkout
              </Link>
              <Link to="/catalog" className="mt-3 btn-secondary w-full flex items-center justify-center gap-2 py-3 text-xs">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
