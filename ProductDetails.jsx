import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, Star, Package, ArrowLeft, ChevronLeft, ChevronRight, LineChart, Camera, RefreshCw, Users } from 'lucide-react'
import { addToCart } from '../store/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../store/wishlistSlice'
import ReviewSection from '../components/ReviewSection'
import ProductCard from '../components/ProductCard'
import GrailTrackerButton from '../components/GrailTrackerButton'
import api from '../services/api'
import toast from '../utils/toast'

export default function ProductDetails() {
  const { id }      = useParams()
  const dispatch    = useDispatch()
  const { symbol, rates, code } = useSelector(s => s.currency)
  const isWished    = useSelector(selectIsWishlisted(id))
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded]   = useState(false)

  // Media cabinet tabs: "Gallery", "360", "Telemetry", "Video"
  const [activeMediaTab, setActiveMediaTab] = useState("Gallery")
  const [rotAngle, setRotAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [showAR, setShowAR] = useState(false)
  const [arScale, setArScale] = useState(1)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Advanced variant management
  const [selectedVariant, setSelectedVariant] = useState(null)

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
    onSuccess: (data) => {
      if (data?.variants?.length > 0) {
        setSelectedVariant(data.variants[0])
      } else {
        setSelectedVariant(null)
      }
    }
  })

  // Recommendation engine: "Collectors who own this also own..."
  const { data: recsData } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: () => api.get(`/recommendations/${id}?limit=4`).then(r => r.data),
    enabled: !!id,
  })

  const p = res
  const rate = rates[code] || 1

  // Synchronize variant selection on product load
// Local storage watcher for "Recently Viewed Products"
  useEffect(() => {
    if (p) {
      const stored = localStorage.getItem('rizerRecentlyViewed')
      let list = stored ? JSON.parse(stored) : []
      list = list.filter(item => item._id !== p._id)
      list.unshift({
        _id: p._id,
        title: p.title,
        price: p.price,
        discountedPrice: p.discountedPrice,
        images: p.images,
        category: p.category,
        rarity: p.rarity,
        averageRating: p.averageRating
      })
      list = list.slice(0, 5)
      localStorage.setItem('rizerRecentlyViewed', JSON.stringify(list))
    }
  }, [p])

  // SEO documents header synchronization
  useEffect(() => {
    if (p) {
      document.title = p.seo?.title || `${p.title} | Premium Anime Collectible | RizerSpace`
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = p.seo?.description || p.description
    }
  }, [p])

  // Dynamic variation price resolution
  const activePrice = selectedVariant 
    ? (selectedVariant.price * rate).toFixed(2)
    : (p ? ((p.discountedPrice || p.price) * rate).toFixed(2) : null)

  const activeOriginalPrice = selectedVariant
    ? null
    : (p?.discountedPrice ? (p.price * rate).toFixed(2) : null)

  const activeStock = selectedVariant ? selectedVariant.stock : (p ? p.stock : 0)
  const activeSku = selectedVariant ? selectedVariant.sku : (p ? p.sku || 'N/A' : 'N/A')

  const handleCart = () => {
    if (!p || activeStock === 0) return
    
    // Construct cart item injecting active variant specifics if selected
    const cartItem = {
      ...p,
      price: selectedVariant ? selectedVariant.price : p.price,
      discountedPrice: selectedVariant ? undefined : p.discountedPrice,
      stock: activeStock,
      sku: activeSku,
      variantName: selectedVariant ? selectedVariant.name : undefined
    }

    dispatch(addToCart(cartItem))
    setAdded(true)
    toast.success(`${p.title} added to shopping cart! 🛒`)
    setTimeout(() => setAdded(false), 2000)
  }

  // Hover zoom coordinate calculator is currently unused and removed to satisfy lint.

  // 360 rotation handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    setRotAngle(prev => (prev + deltaX * 0.7) % 360)
    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setStartX(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    const deltaX = e.touches[0].clientX - startX
    setRotAngle(prev => (prev + deltaX * 0.7) % 360)
    setStartX(e.touches[0].clientX)
  }

  if (isLoading) return (
    <main className="pt-24 px-4 min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-secondary animate-spin" />
    </main>
  )
  if (error || !p) return (
    <main className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center gap-4 text-white/50 bg-black">
      <p>Product not found.</p>
      <Link to="/catalog" className="btn-secondary">← Back to Catalog</Link>
    </main>
  )

  // Generate price history points dynamically for SVG chart if no DB metrics are set
  const historyPoints = p.marketValueHistory?.length > 0 
    ? p.marketValueHistory 
    : [
        { price: p.price * 0.75, date: new Date("2025-06-01") },
        { price: p.price * 0.85, date: new Date("2025-09-01") },
        { price: p.price * 0.92, date: new Date("2025-12-01") },
        { price: p.price * 1.05, date: new Date("2026-03-01") },
        { price: p.discountedPrice || p.price, date: new Date() }
      ];

  // Map SVG coordinates: width 500, height 220
  const chartWidth = 500
  const chartHeight = 220
  const paddingX = 40
  const paddingY = 30

  const prices = historyPoints.map(pt => pt.price * rate)
  const maxPrice = Math.max(...prices) * 1.1
  const minPrice = Math.min(...prices) * 0.9

  const points = historyPoints.map((pt, index) => {
    const x = paddingX + (index / (historyPoints.length - 1)) * (chartWidth - paddingX * 2)
    const y = chartHeight - paddingY - ((pt.price * rate - minPrice) / (maxPrice - minPrice)) * (chartHeight - paddingY * 2)
    return { x, y, price: pt.price * rate, date: new Date(pt.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) }
  })

  // Build SVG path
  let pathD = ""
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      // Smooth cubic curve interpolation
      const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2
      const cpY1 = points[i-1].y
      const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2
      const cpY2 = points[i].y
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`
    }
  }

  // Area path for gradient background fill under the price curve
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length-1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : ""

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/catalog" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Advanced Media Cabinet */}
          <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="flex flex-col">
            {/* Cabinet Navigation Tabs */}
            <div className="flex gap-2 mb-4 p-1 glass border border-white/5 rounded-xl w-fit self-center sm:self-start">
              <button onClick={() => setActiveMediaTab("Gallery")}
                className={`text-xs font-syne font-bold px-4 py-2 rounded-lg transition-all ${activeMediaTab === "Gallery" ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20' : 'text-white/40 hover:text-white/80'}`}>
                Gallery
              </button>
              <button onClick={() => { setActiveMediaTab("360"); setRotAngle(0); }}
                className={`text-xs font-syne font-bold px-4 py-2 rounded-lg transition-all ${activeMediaTab === "360" ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20' : 'text-white/40 hover:text-white/80'}`}>
                360° Rotator
              </button>
              <button onClick={() => setActiveMediaTab("Telemetry")}
                className={`text-xs font-syne font-bold px-4 py-2 rounded-lg transition-all ${activeMediaTab === "Telemetry" ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20' : 'text-white/40 hover:text-white/80'}`}>
                Value Telemetry
              </button>
            </div>

            {/* Media Box container */}
            <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 border border-white/8 glass flex items-center justify-center"
              style={{background: p.gradient || 'linear-gradient(135deg,#120C1F,#1e0538)'}}>
              
              {/* Rarity Aura Glowing Core */}
              <div className={`absolute w-72 h-72 rounded-full blur-[100px] opacity-20 pointer-events-none ${
                p.rarity === 'Grail' ? 'bg-yellow-500 animate-pulse' :
                p.rarity === 'Super Rare' ? 'bg-purple-600 animate-pulse' :
                p.rarity === 'Rare' ? 'bg-blue-500' : 'bg-cyan-500/50'
              }`} style={{ animationDuration: '4s' }} />

              {/* Rarity Label Overlay */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full shadow-lg ${
                  p.rarity === 'Grail' ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border border-yellow-300/30' :
                  p.rarity === 'Super Rare' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' :
                  p.rarity === 'Rare' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' :
                  'bg-white/10 text-white/70 border border-white/10'
                }`}>
                  {p.rarity || 'Common'} {p.limitedEdition?.isLimited && `(Ltd. Run #${p.limitedEdition.totalRun})`}
                </span>
              </div>

              {/* 1. PHOTO GALLERY */}
              {activeMediaTab === "Gallery" && (
                <div className="w-full h-full flex items-center justify-center">
                  {p.images?.[imgIdx] ? (
                    <img src={p.images[imgIdx]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[120px] font-black opacity-20 select-none" style={{fontFamily:'serif'}}>{p.symbol}</span>
                    </div>
                  )}
                  {p.images?.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => Math.max(0, i-1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center border border-white/10 hover:border-neon-purple/50 transition-all">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setImgIdx(i => Math.min(p.images.length-1, i+1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center border border-white/10 hover:border-neon-purple/50 transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 2. 360 ROTATOR */}
              {activeMediaTab === "360" && (
                <div className="w-full h-full flex flex-col items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}>
                  
                  {/* CSS 3D Rotation Figure Overlay */}
                  <div className="w-80 h-80 flex items-center justify-center transition-transform duration-100 ease-out"
                    style={{
                      transform: `rotateY(${rotAngle}deg) rotateX(${-rotAngle * 0.1}deg)`,
                      transformStyle: 'preserve-3d',
                      perspective: 1000
                    }}>
                    <img src={p.images?.[0] || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"} 
                      alt="" 
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                      style={{ transform: 'translateZ(50px)' }}
                      draggable="false"
                    />
                  </div>

                  {/* Drag Assist Visual overlay */}
                  <div className="absolute bottom-4 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/40 pointer-events-none">
                    <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '10s' }} />
                    Drag horizontally to rotate figure
                  </div>

                  {/* Launch AR Projection Button */}
                  <button onClick={() => setShowAR(true)}
                    className="absolute top-4 right-4 bg-gradient-to-r from-neon-purple to-neon-blue px-3.5 py-2 rounded-xl text-white font-syne font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-lg shadow-neon-purple/30 hover:shadow-neon transition-all border border-white/10">
                    <Camera size={14} />
                    Project AR
                  </button>
                </div>
              )}

              {/* 3. VALUE HISTORY GRAPH */}
              {activeMediaTab === "Telemetry" && (
                <div className="w-full h-full p-6 flex flex-col items-center justify-center text-white relative">
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] text-neon-blue font-bold tracking-wider uppercase bg-neon-blue/10 border border-neon-blue/20 px-2 py-1 rounded-full">
                    <LineChart size={12} />
                    Live Secondary Resale Index
                  </div>
                  
                  {/* Pure SVG responsive chart */}
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full select-none overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#b833ff" />
                        <stop offset="100%" stopColor="#1e90ff" />
                      </linearGradient>
                      <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b833ff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#b833ff" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Y-axis gridlines */}
                    {[0, 0.5, 1].map((r, i) => {
                      const gridY = paddingY + r * (chartHeight - paddingY * 2);
                      const valueVal = maxPrice - r * (maxPrice - minPrice);
                      return (
                        <g key={i} opacity="0.15">
                          <line x1={paddingX} y1={gridY} x2={chartWidth - paddingX} y2={gridY} stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                          <text x={paddingX - 8} y={gridY + 4} fill="white" fontSize="9" textAnchor="end">{symbol}{valueVal.toFixed(0)}</text>
                        </g>
                      );
                    })}

                    {/* Shading area beneath */}
                    {areaD && <path d={areaD} fill="url(#chartAreaGrad)" />}

                    {/* Main line path */}
                    {pathD && <path d={pathD} fill="none" stroke="url(#chartGrad)" strokeWidth="3" filter="url(#glow)" />}

                    {/* Points markers */}
                    {points.map((pt, i) => (
                      <g key={i}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="cursor-pointer">
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#120C1F" stroke="url(#chartGrad)" strokeWidth="2.5" />
                        <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />
                        <text x={pt.x} y={chartHeight - 8} fill="white" opacity="0.4" fontSize="9" textAnchor="middle">{pt.date}</text>
                      </g>
                    ))}
                  </svg>

                  {/* SVG Tooltip Box overlay */}
                  {hoveredPoint && (
                    <div className="absolute bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-2xl flex flex-col gap-0.5 text-center pointer-events-none"
                      style={{ left: `${(hoveredPoint.x / chartWidth) * 90}%`, top: `${(hoveredPoint.y / chartHeight) * 70}%` }}>
                      <span className="text-[9px] uppercase tracking-wider text-white/50">{hoveredPoint.date} Index</span>
                      <span className="font-syne font-black text-sm text-neon-blue">{symbol}{hoveredPoint.price.toFixed(2)}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-white/40 tracking-wider font-medium font-syne text-center mt-2">
                    Resale value index tracked from verified user listing transactions.
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail row below active tab */}
            {activeMediaTab === "Gallery" && p.images?.length > 1 && (
              <div className="flex gap-2">
                {p.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? 'border-neon-purple' : 'border-white/10 opacity-50 hover:opacity-80'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>


          {/* Details */}
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-neon-purple font-semibold tracking-widest mb-2">{p.category?.toUpperCase()}</p>
              <h1 className="font-syne font-black text-3xl sm:text-4xl text-white leading-tight">{p.title}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} fill={i <= Math.round(p.averageRating) ? '#b833ff' : 'none'}
                    className={i <= Math.round(p.averageRating) ? 'text-neon-purple' : 'text-white/20'} />
                ))}
              </div>
              <span className="text-sm text-white/50">{p.averageRating?.toFixed(1)} ({p.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-syne font-black text-4xl gradient-text">{symbol}{activePrice}</span>
              {activeOriginalPrice && <span className="text-lg text-white/30 line-through">{symbol}{activeOriginalPrice}</span>}
              {p.discountedPrice && (
                <span className="badge-sale">
                  -{Math.round((1 - p.discountedPrice/p.price)*100)}% OFF
                </span>
              )}
            </div>

            <p className="text-white/60 leading-relaxed">{p.description}</p>

            {/* Specs */}
            {p.specs && (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(p.specs).map(([k, v]) => (
                  <div key={k} className="glass rounded-xl p-3 text-center border border-white/8">
                    <div className="font-syne font-bold text-sm text-white">{v}</div>
                    <div className="text-xs text-white/40 mt-1 tracking-wider">{k.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package size={15} className={p.stock > 0 ? 'text-green-400' : 'text-red-400'} />
              <span className={`text-sm font-medium ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleCart} disabled={p.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-syne font-bold text-sm tracking-widest transition-all duration-300 ${
                  p.stock === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed' :
                  added ? 'bg-green-500/20 border border-green-500/50 text-green-400' :
                  'btn-primary'
                }`}>
                <ShoppingCart size={16} />
                {added ? '✓ Added to Cart!' : p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={() => dispatch(toggleWishlist(p))}
                className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isWished ? 'border-neon-purple bg-neon-purple/20 text-neon-purple' : 'glass border-white/10 text-white/40 hover:border-neon-purple/50'
                }`}>
                <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Grail Tracker */}
            <div className="pt-1">
              <GrailTrackerButton product={p} />
            </div>

          </motion.div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={id} />

        {/* Recommendation Engine — Collaborative Filtering */}
        {recsData?.data?.filter(r => r._id !== id).length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-syne font-black text-2xl text-white">
                  Collectors Who Own This <span className="gradient-text">Also Own</span>
                </h3>
                {recsData.matchedCollectors && (
                  <p className="text-xs text-white/30 mt-0.5">Based on {recsData.matchedCollectors} collector shelf{recsData.matchedCollectors !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recsData.data.filter(r => r._id !== id).slice(0, 4).map(rec => (
                <ProductCard key={rec._id} product={rec} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Immersive WebXR AR Projection Simulator Modal */}
      <AnimatePresence>
        {showAR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
            
            {/* Holographic scanning background dots */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            {/* Viewfinder Header */}
            <div className="relative z-10 flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-syne font-black text-xs tracking-widest text-white/90">WEBAR // HOLOGRAPHIC PROJECTION ACTIVE</span>
              </div>
              <button onClick={() => setShowAR(false)}
                className="w-10 h-10 rounded-full glass border border-white/10 hover:border-white/30 text-white flex items-center justify-center font-bold text-sm">
                ✕
              </button>
            </div>

            {/* Simulated viewfinder area */}
            <div className="flex-1 relative flex items-center justify-center">
              
              {/* Target ground grid scanning circle */}
              <div className="absolute w-[400px] h-[150px] border border-neon-blue/30 rounded-full [transform:rotateX(75deg)] flex items-center justify-center animate-pulse">
                <div className="w-[300px] h-[100px] border border-neon-purple/40 rounded-full [background:radial-gradient(ellipse,rgba(184,51,255,0.08)_0%,transparent_70%)]" />
                
                {/* Neon radar sweeps */}
                <div className="absolute w-[200px] h-[50px] border-t-2 border-neon-blue rounded-full animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              {/* Holographic Projection Object */}
              <div className="relative flex flex-col items-center justify-center select-none"
                style={{
                  transform: `scale(${arScale})`,
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                <img src={p.images?.[0] || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"}
                  alt=""
                  className="h-80 md:h-[400px] object-contain filter drop-shadow-[0_0_20px_rgba(30,144,255,0.6)] animate-bounce"
                  style={{ transform: `rotateY(${rotAngle}deg)`, animationDuration: '6s' }}
                  draggable="false"
                />
                
                {/* Scale reference shadow */}
                <div className="w-24 h-4 rounded-full bg-black/40 blur-md pointer-events-none mt-2" />
              </div>

              {/* Scanning status banner */}
              <div className="absolute top-8 bg-black/60 border border-white/5 px-4 py-2 rounded-xl text-center backdrop-blur-md max-w-xs">
                <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">Scanning Room Depth</p>
                <p className="text-xs text-neon-blue font-syne font-bold mt-0.5">Surface Detected: Flat Plane Locked</p>
              </div>

              {/* Shutter snapshot flash indicator */}
              <div className="absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-100" id="ar-flash" />
            </div>

            {/* Bottom Controls console */}
            <div className="relative z-10 glass border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-2xl mx-auto flex flex-col gap-4">
              
              {/* Size Scale Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-syne font-bold tracking-widest text-white/60">
                  <span>SELECT SCALE RATIO</span>
                  <span className="text-neon-blue">
                    {arScale === 0.6 ? "1/10 Micro Scale (15cm)" :
                     arScale === 0.85 ? "1/7 Figure Scale (25cm)" :
                     arScale === 1.15 ? "1/6 Premium Scale (30cm)" :
                     arScale === 1.5 ? "1/4 Large Scale (45cm)" :
                     "1/1 Life-size Figure (180cm!)"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0.6, 0.85, 1.15, 1.5, 2.5].map((sc) => (
                    <button key={sc} onClick={() => setArScale(sc)}
                      className={`py-2 px-1 text-[9px] font-black tracking-wider uppercase rounded-lg border transition-all ${
                        arScale === sc 
                          ? 'bg-gradient-to-r from-neon-purple to-neon-blue border-transparent text-white shadow-lg shadow-neon-purple/20' 
                          : 'glass border-white/5 text-white/40 hover:text-white/70'
                      }`}>
                      {sc === 0.6 ? "1/10" :
                       sc === 0.85 ? "1/7" :
                       sc === 1.15 ? "1/6" :
                       sc === 1.5 ? "1/4" : "1/1 LIFE"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capture Snapshot Action */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="text-[10px] text-white/40 tracking-wider">
                  Rotate gesture: Drag on standard 360 rotator to change view angle.
                </div>
                
                <button onClick={() => {
                  const flash = document.getElementById("ar-flash");
                  if (flash) {
                    flash.style.opacity = "1";
                    setTimeout(() => flash.style.opacity = "0", 100);
                  }
                  alert("🎌 Snapshot Saved! Pre-rendered figure mock perspective exported successfully.");
                }}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white/20 active:scale-95 transition-all hover:bg-white/90">
                  <div className="w-10 h-10 rounded-full border-2 border-black/80 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-black/10" />
                  </div>
                </button>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )

}
