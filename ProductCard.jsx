import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { addToCart } from '../store/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../store/wishlistSlice'

function Badge({ label }) {
  if (!label) return null
  const cls = {
    NEW: 'badge-new', SALE: 'badge-sale', HOT: 'badge-hot',
  }[label] || 'badge-new'
  return <span className={cls}>{label}</span>
}

export default function ProductCard({ product }) {
  const dispatch     = useDispatch()
  const { symbol, rates, code } = useSelector(s => s.currency)
  const isWished     = useSelector(selectIsWishlisted(product._id))
  const isOutOfStock = product.stock === 0

  const displayPrice = (usd) => {
    const rate = rates[code] || 1
    return `${symbol}${(usd * rate).toFixed(2)}`
  }

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isOutOfStock) dispatch(addToCart(product))
  }
  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    dispatch(toggleWishlist(product))
  }

  const rarity = product.rarity || 'Common';
  const getRarityStyles = (tier) => {
    switch (tier) {
      case 'Grail':
        return {
          borderClass: 'border-white/8 hover:border-yellow-500/50 hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]',
          badgeBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
          textColor: 'text-amber-400'
        };
      case 'Super Rare':
        return {
          borderClass: 'border-white/8 hover:border-neon-purple/50 hover:shadow-[0_0_20px_rgba(184,51,255,0.35)]',
          badgeBg: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
          textColor: 'text-neon-purple'
        };
      case 'Rare':
        return {
          borderClass: 'border-white/8 hover:border-neon-blue/40 hover:shadow-[0_0_15px_rgba(30,144,255,0.25)]',
          badgeBg: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
          textColor: 'text-neon-blue'
        };
      default:
        return {
          borderClass: 'border-white/8 hover:border-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]',
          badgeBg: 'bg-white/10 text-white/70',
          textColor: 'text-white/60'
        };
    }
  };

  const rStyle = getRarityStyles(rarity);

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link to={`/product/${product._id}`} className="block">
        <div className={`glass rounded-2xl overflow-hidden border transition-all duration-300 group ${rStyle.borderClass}`}>
          {/* Image area */}
          <div className="relative h-52 overflow-hidden flex items-center justify-center" style={{ background: product.gradient || 'linear-gradient(135deg,#120C1F,#1e0538)' }}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <span className="text-8xl font-black opacity-20 select-none font-syne">{product.symbol || '漢'}</span>
            )}
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              {product.discountedPrice && <Badge label="SALE" />}
              {product.stock === 0 && <Badge label="OUT" />}
              <span className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded shadow ${rStyle.badgeBg}`}>
                {rarity}
              </span>
            </div>
            {/* Wishlist btn */}
            <button onClick={handleWishlist}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg glass flex items-center justify-center border border-white/10 hover:border-neon-purple/50 transition-all opacity-0 group-hover:opacity-100">
              <Heart size={14} fill={isWished ? '#b833ff' : 'none'} className={isWished ? 'text-neon-purple' : 'text-white/60'} />
            </button>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="font-syne font-bold text-xs tracking-widest text-white/60 border border-white/20 px-3 py-1.5 rounded-full">OUT OF STOCK</span>
              </div>
            )}
          </div>


          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-neon-purple/70 font-medium tracking-wider mb-1 truncate">{product.category?.toUpperCase()}</p>
            <h3 className="font-syne font-bold text-sm text-white leading-tight mb-2 truncate">{product.title}</h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={10} fill={i <= Math.round(product.averageRating) ? '#b833ff' : 'none'}
                    className={i <= Math.round(product.averageRating) ? 'text-neon-purple' : 'text-white/20'} />
                ))}
              </div>
              <span className="text-xs text-white/40">({product.numReviews || 0})</span>
            </div>

            {/* Price + Cart */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-syne font-black text-lg text-white">
                  {displayPrice(product.discountedPrice || product.price)}
                </span>
                {product.discountedPrice && (
                  <span className="ml-2 text-xs text-white/30 line-through">{displayPrice(product.price)}</span>
                )}
              </div>
              <button onClick={handleAddToCart} disabled={isOutOfStock}
                className={`flex items-center gap-1.5 text-xs font-syne font-bold px-3 py-2 rounded-lg transition-all duration-200 ${
                  isOutOfStock ? 'bg-white/5 text-white/20 cursor-not-allowed' :
                  'text-white hover:shadow-neon'
                }`}
                style={isOutOfStock ? {} : { background: 'linear-gradient(135deg,#b833ff,#1e90ff)' }}>
                <ShoppingCart size={12} />
                Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
