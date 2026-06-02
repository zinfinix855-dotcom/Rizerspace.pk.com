import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { toggleWishlist } from '../store/wishlistSlice'
import { addToCart } from '../store/cartSlice'

export default function Wishlist() {
  const dispatch = useDispatch()
  const items    = useSelector(s => s.wishlist.items)
  const { symbol, rates, code } = useSelector(s => s.currency)
  const rate = rates[code] || 1
  const fmt = (usd) => `${symbol}${(usd * rate).toFixed(2)}`

  if (items.length === 0) return (
    <main className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-7xl opacity-20">💜</div>
      <h2 className="font-syne font-black text-3xl text-white/50">Your wishlist is empty</h2>
      <p className="text-white/30">Save your favourite figures for later</p>
      <Link to="/catalog" className="btn-primary flex items-center gap-2">Browse Catalog <ArrowRight size={16} /></Link>
    </main>
  )

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-syne font-black text-4xl text-white mb-10">
          My <span className="gradient-text">Wishlist</span>
          <span className="text-white/30 font-normal text-xl ml-3">({items.length})</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item._id} layout initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                className="glass rounded-2xl overflow-hidden border border-white/8 hover:border-neon-purple/30 transition-all">
                <Link to={`/product/${item._id}`}>
                  <div className="h-44 flex items-center justify-center relative overflow-hidden"
                    style={{background: item.gradient || 'linear-gradient(135deg,#120C1F,#1e0538)'}}>
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      : <span className="text-7xl font-black opacity-20" style={{fontFamily:'serif'}}>{item.symbol}</span>}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-neon-purple/70 font-medium tracking-wider mb-1">{item.category?.toUpperCase()}</p>
                  <Link to={`/product/${item._id}`} className="font-syne font-bold text-sm text-white hover:text-neon-purple transition-colors block truncate mb-3">
                    {item.title}
                  </Link>
                  <div className="font-syne font-black text-lg gradient-text mb-4">
                    {fmt(item.discountedPrice || item.price)}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { dispatch(addToCart(item)) }}
                      disabled={item.stock === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl btn-primary !text-xs !py-2.5 disabled:opacity-30 disabled:cursor-not-allowed">
                      <ShoppingCart size={13} /> {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button onClick={() => dispatch(toggleWishlist(item))}
                      className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center hover:border-red-400/50 hover:text-red-400 text-white/40 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
