import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Award, Sparkles, TrendingUp, DollarSign, Tag, Archive, CheckCircle, Trash2, Eye, BarChart2, Bell, Trophy, Flame, Zap } from 'lucide-react'
import api from '../services/api'


export default function CollectorDashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { symbol, rates, code } = useSelector(s => s.currency)
  const rate = rates[code] || 1

  const [activeTab, setActiveTab] = useState("Shelf") // "Shelf", "SecondaryListings", "Achievements"
  const [sellItem, setSellItem] = useState(null) // Holds cabinet item being listed to marketplace
  const [sellPrice, setSellPrice] = useState("")
  const [sellCondition, setSellCondition] = useState("MISB")
  const [sellDesc, setSellDesc] = useState("")

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Fetch showcase data
  const { data: resData, isLoading } = useQuery({
    queryKey: ['showcase', user?.id],
    queryFn: () => api.get(`/collector/showcase/${user.id}`).then(r => r.data),
    enabled: !!user?.id,
  })

  // Fetch my secondary listings
  const { data: listingsData } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => api.get('/marketplace/listings').then(r => {
      const allListings = r.data.data || []
      return allListings.filter(l => l.seller?._id === user.id)
    }),
    enabled: !!user?.id,
  })

  // Fetch my grail trackers
  const { data: trackersData } = useQuery({
    queryKey: ['grail-trackers'],
    queryFn: () => api.get('/grail-tracker').then(r => r.data.data),
    enabled: !!user?.id,
  })


  // Mutation to list figure on marketplace
  const listMutation = useMutation({
    mutationFn: (newListing) => api.post('/marketplace/listings', newListing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      setSellItem(null)
      setSellPrice("")
      setSellDesc("")
      alert("🎌 Figure successfully listed on the Secondary Resale Marketplace!")
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Failed to create secondary marketplace listing.")
    }
  })

  // Mutation to remove item from collection
  const removeMutation = useMutation({
    mutationFn: (itemId) => api.delete(`/collector/collection/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase', user.id] })
      alert("Figure removed from showcase cabinet.")
    }
  })

  const showcase = resData?.showcase || { items: [] }
  const collector = resData?.collector || user

  // XP calculations: level threshold is 300 XP
  const currentXP = collector.xp || 0
  const currentLevel = collector.level || 1
  const xpInCurrentLevel = currentXP % 300
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 300) * 100))
  const xpNeeded = 300 - xpInCurrentLevel

  const handleSellSubmit = (e) => {
    e.preventDefault()
    if (!sellPrice || Number(sellPrice) <= 0) {
      alert("Please enter a valid resale price.")
      return
    }
    listMutation.mutate({
      productId: sellItem.product._id,
      price: Number(sellPrice) / rate, // convert back to base USD
      condition: sellCondition,
      description: sellDesc
    })
  }

  // Predefined collector achievement badges list (locked/unlocked visualization)
  const availableAchievements = [
    { name: "First Step", icon: "🌱", desc: "Added your first anime figure to the showcase.", req: "Level 1" },
    { name: "Grail Hunter", icon: "🏆", desc: "Unlock a Grail-tier product on your showcase shelf.", req: "Level 3" },
    { name: "Set Collector", icon: "📚", desc: "Own 3 or more figures from a single anime line.", req: "Level 4" },
    { name: "Master Curator", icon: "💎", desc: "Achieve a total cabinet valuation above $500.", req: "Level 4" },
    { name: "Grail Lord", icon: "👑", desc: "Reach collector level 5 and acquire multiple Grails.", req: "Level 5" },
    { name: "Secondary Reseller", icon: "🤝", desc: "List a figure for secondary resale on the marketplace.", req: "List 1 product" }
  ]

  return (
    <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* GAMIFIED HERO SECTION */}
        <div className="glass border border-white/8 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 blur-[80px] pointer-events-none rounded-full" />
          
          {/* Avatar and Stats */}
          <div className="flex flex-col sm:flex-row gap-6 items-center z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center border-2 border-white/20 shadow-2xl">
                <span className="text-3xl font-black text-white font-syne select-none">
                  {collector.name?.slice(0,2).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-syne font-black text-xs px-2.5 py-1 rounded-lg border border-yellow-300/30 shadow-lg">
                LVL {currentLevel}
              </div>
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="font-syne font-black text-2xl text-white flex items-center gap-2 justify-center sm:justify-start">
                {collector.name}
                <Sparkles size={18} className="text-yellow-400 animate-pulse" />
              </h1>
              <p className="text-xs text-white/50 tracking-widest font-medium uppercase mt-0.5">RizerSpace Certified Custodian</p>
              
              {/* Level XP Bar */}
              <div className="mt-4 w-64">
                <div className="flex justify-between text-[10px] font-bold text-white/40 tracking-wider mb-1.5">
                  <span>LEVEL PROGRESS ({currentXP} XP)</span>
                  <span>{xpNeeded} XP TO NEXT LEVEL</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgressPercent}%` }} transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full shadow-[0_0_10px_#b833ff]" />
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Metrics */}
          <div className="grid grid-cols-2 md:flex gap-6 z-10 text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12 w-full md:w-auto">
            <div className="flex-1 min-w-[120px]">
              <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold block mb-1">Portfolio Size</span>
              <span className="font-syne font-black text-2xl text-white flex items-center justify-center md:justify-end gap-1.5">
                <Archive size={18} className="text-neon-blue" />
                {showcase.totalItems || 0} Figures
              </span>
            </div>
            <div className="flex-1 min-w-[120px]">
              <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold block mb-1">Portfolio Valuation</span>
              <span className="font-syne font-black text-2xl text-neon-purple flex items-center justify-center md:justify-end gap-0.5">
                <TrendingUp size={18} className="text-neon-purple mr-1" />
                {symbol}{(showcase.currentEstimatedValue * rate).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS & TABS */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 glass border border-white/5 rounded-2xl w-fit">
          {[
            { key: "Shelf",            label: "Glass Cabinet" },
            { key: "SecondaryListings",label: `Listings (${listingsData?.length || 0})` },
            { key: "Achievements",     label: "Achievements" },
            { key: "Heatmap",          label: "Heatmap" },
            { key: "GrailTracker",     label: `Grail Tracker (${trackersData?.length || 0})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`font-syne font-bold text-sm px-5 py-2.5 rounded-xl transition-all ${
                activeTab === t.key
                  ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-xl shadow-neon-purple/20'
                  : 'text-white/40 hover:text-white/80'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[400px]">
          
          {/* 1. GLASS CABINET SHELF */}
          {activeTab === "Shelf" && (
            <div>
              {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-transparent border-t-neon-purple rounded-full animate-spin" />
                </div>
              ) : showcase.items.length === 0 ? (
                <div className="glass border border-white/5 rounded-3xl p-12 text-center text-white/40 flex flex-col items-center gap-4">
                  <Archive size={40} className="stroke-1 text-white/30" />
                  <p className="font-syne font-bold text-lg text-white/80">Your showcase cabinet is empty.</p>
                  <p className="text-sm max-w-sm">
                    Add figures to your collection during catalog orders or import figures to display your physical collectibles!
                  </p>
                  <Link to="/catalog" className="btn-primary mt-2">Browse Figure Catalog</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {/* Portfolio Stats panel */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20 text-neon-purple">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 tracking-wider uppercase font-bold">Acquisition Outlay</p>
                        <p className="font-syne font-black text-lg text-white">{symbol}{(showcase.totalAcquisitionValue * rate).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20 text-neon-blue">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 tracking-wider uppercase font-bold">Net Portfolio Value</p>
                        <p className="font-syne font-black text-lg text-neon-blue">{symbol}{(showcase.currentEstimatedValue * rate).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 tracking-wider uppercase font-bold">Gains Index</p>
                        <p className="font-syne font-black text-lg text-green-400">
                          +{(((showcase.currentEstimatedValue - showcase.totalAcquisitionValue) / (showcase.totalAcquisitionValue || 1)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Virtual Shelf Grid */}
                  <div className="flex flex-col gap-12 bg-dark-900/50 p-6 md:p-8 rounded-3xl border border-white/5 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-syne font-bold tracking-widest text-white/30 uppercase">
                      <Sparkles size={12} className="text-yellow-500" />
                      Neon LED Showcase Backlight Active
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {showcase.items.map((item) => {
                        const estVal = item.estimatedCurrentValue || item.acquisitionPrice
                        return (
                          <div key={item._id} className="relative group">
                            
                            {/* Neon glass cabinet display card */}
                            <div className="glass border border-white/8 hover:border-neon-purple/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full bg-dark-950/80">
                              
                              {/* Glowing product aura */}
                              <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 to-transparent pointer-events-none" />

                              {/* Card Image Area */}
                              <div className="relative h-44 overflow-hidden flex items-center justify-center"
                                style={{ background: item.product?.gradient || 'linear-gradient(135deg, #100a20, #000)' }}>
                                {item.product?.images?.[0] ? (
                                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <span className="text-7xl font-black opacity-10">{item.product?.symbol || "漢"}</span>
                                )}
                                
                                {/* Condition Badge */}
                                <span className={`absolute top-3 left-3 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded shadow ${
                                  item.condition === 'MISB' ? 'bg-green-500 text-black font-extrabold' :
                                  item.condition === 'MIB' ? 'bg-neon-blue text-white' : 'bg-yellow-500 text-black'
                                }`}>
                                  {item.condition}
                                </span>

                                {/* Serial Code overlay */}
                                {item.serialNumber && (
                                  <span className="absolute bottom-3 right-3 text-[9px] bg-black/75 text-white/80 font-mono tracking-wider px-2 py-0.5 rounded border border-white/5">
                                    SN: {item.serialNumber}
                                  </span>
                                )}
                              </div>

                              {/* Info Box */}
                              <div className="p-4 flex flex-col gap-3 flex-1 justify-between z-10">
                                <div>
                                  <p className="text-[10px] text-neon-blue font-bold tracking-wider uppercase mb-0.5">{item.product?.category}</p>
                                  <h4 className="font-syne font-black text-sm text-white truncate">{item.product?.title}</h4>
                                </div>

                                {/* Financial metrics grid */}
                                <div className="grid grid-cols-2 gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                                  <div>
                                    <span className="text-[8px] text-white/40 tracking-wider uppercase font-bold block">Acquired Price</span>
                                    <span className="font-syne font-bold text-xs text-white/80">{symbol}{(item.acquisitionPrice * rate).toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-white/40 tracking-wider uppercase font-bold block">Current Index</span>
                                    <span className="font-syne font-black text-xs text-neon-purple">{symbol}{(estVal * rate).toFixed(2)}</span>
                                  </div>
                                </div>

                                {/* Interactive Shelf actions */}
                                <div className="flex gap-2 pt-1 border-t border-white/5">
                                  <button onClick={() => setSellItem(item)}
                                    className="flex-1 py-2 px-3 rounded-lg bg-neon-purple/10 hover:bg-neon-purple hover:text-white border border-neon-purple/20 text-neon-purple text-xs font-syne font-bold tracking-wider transition-all flex items-center justify-center gap-1.5">
                                    <Tag size={12} />
                                    Resale Figure
                                  </button>
                                  
                                  <button onClick={() => removeMutation.mutate(item._id)}
                                    className="w-9 h-9 rounded-lg glass border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all flex items-center justify-center">
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                              </div>

                            </div>

                            {/* Cabinet Wooden/Glass Shelf line base */}
                            <div className="absolute -bottom-2.5 left-4 right-4 h-1.5 bg-gradient-to-r from-neon-purple/40 via-neon-blue/60 to-neon-purple/40 rounded-full blur-[1px] shadow-[0_0_15px_#b833ff] pointer-events-none" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. SECONDARY LISTINGS */}
          {activeTab === "SecondaryListings" && (
            <div className="glass border border-white/5 rounded-3xl p-6 md:p-8">
              <h2 className="font-syne font-black text-xl text-white mb-6">Your Secondary <span className="gradient-text">Marketplace</span> Listings</h2>
              
              {!listingsData || listingsData.length === 0 ? (
                <div className="text-center py-10 text-white/40 flex flex-col items-center gap-3">
                  <Tag size={36} className="stroke-1 text-white/30" />
                  <p className="font-syne font-bold text-sm text-white/80">No secondary resale listings active.</p>
                  <p className="text-xs max-w-xs mx-auto">
                    You can list any figures on your virtual glass cabinet shelf onto the resale market board directly from your showcase grid.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listingsData.map((listing) => (
                    <div key={listing._id} className="glass border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: listing.product?.gradient || 'linear-gradient(135deg, #100a20, #000)' }}>
                        <img src={listing.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-[8px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded ${
                          listing.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/10 text-white/40'
                        }`}>
                          {listing.status}
                        </span>
                        <h4 className="font-syne font-black text-sm text-white truncate mt-1">{listing.product?.title}</h4>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mt-0.5">Condition: {listing.condition}</p>
                        
                        <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-white/5">
                          <span className="font-syne font-bold text-sm text-neon-blue">{symbol}{(listing.price * rate).toFixed(2)}</span>
                          <Link to={`/product/${listing.product?._id}`} className="text-[10px] text-neon-purple hover:underline flex items-center gap-1 font-bold">
                            <Eye size={10} /> View Detail Catalog
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ACHIEVEMENTS GALLERY */}
          {activeTab === "Achievements" && (
            <div className="glass border border-white/5 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black flex items-center justify-center font-bold">
                  🏆
                </div>
                <div>
                  <h2 className="font-syne font-black text-xl text-white">Collector Achievement Badges</h2>
                  <p className="text-xs text-white/40 mt-0.5">Unlock rewards and secondary profile emblems by leveling up your collection.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableAchievements.map((ach) => {
                  // Determine if user has unlocked this badge
                  const isUnlocked = collector.badges?.some(b => b.name?.toLowerCase().trim() === ach.name?.toLowerCase().trim()) || 
                    (ach.name === "First Step" && showcase.items.length > 0) ||
                    (ach.name === "Secondary Reseller" && listingsData?.length > 0);

                  return (
                    <div key={ach.name} className={`relative glass border rounded-2xl p-5 flex gap-4 items-start transition-all duration-300 ${
                      isUnlocked 
                        ? 'border-yellow-500/20 bg-yellow-500/[0.02] shadow-[0_0_15px_rgba(234,179,8,0.05)]' 
                        : 'border-white/5 opacity-50'
                    }`}>
                      {/* Badge Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-xl flex-shrink-0 ${
                        isUnlocked ? 'bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-yellow-400/30' : 'glass border-white/5'
                      }`}>
                        {ach.icon}
                      </div>

                      {/* Badge Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-syne font-black text-sm text-white">{ach.name}</h4>
                          {isUnlocked && <CheckCircle size={12} className="text-yellow-400" />}
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed mt-1">{ach.desc}</p>
                        <div className="mt-3 flex items-center gap-1 text-[9px] uppercase font-black tracking-widest text-neon-blue">
                          <span>Requirement: {ach.req}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4. COLLECTION HEATMAP */}
          {activeTab === "Heatmap" && (() => {
            const items = showcase.items || []
            const rarityOrder = { Grail: 0, 'Super Rare': 1, Rare: 2, Common: 3 }
            const topFigure = [...items].sort((a, b) =>
              (b.estimatedCurrentValue || 0) - (a.estimatedCurrentValue || 0)
            )[0]
            const rarestFigure = [...items].sort((a, b) =>
              (rarityOrder[a.product?.rarity] ?? 4) - (rarityOrder[b.product?.rarity] ?? 4)
            )[0]
            const gainsPct = showcase.totalAcquisitionValue
              ? (((showcase.currentEstimatedValue - showcase.totalAcquisitionValue) / showcase.totalAcquisitionValue) * 100).toFixed(1)
              : '0.0'

            // Category distribution
            const catCount = {}
            items.forEach(i => { if (i.product?.category) catCount[i.product.category] = (catCount[i.product.category] || 0) + 1 })
            const catEntries = Object.entries(catCount).sort((a, b) => b[1] - a[1])

            // Rarity distribution
            const rarCount = { Grail: 0, 'Super Rare': 0, Rare: 0, Common: 0 }
            items.forEach(i => { const r = i.product?.rarity || 'Common'; rarCount[r] = (rarCount[r] || 0) + 1 })
            const rarConfig = [
              { key: 'Grail',      color: '#eab308', label: 'Grail' },
              { key: 'Super Rare', color: '#b833ff', label: 'Super Rare' },
              { key: 'Rare',       color: '#1e90ff', label: 'Rare' },
              { key: 'Common',     color: '#ffffff30', label: 'Common' },
            ]

            return (
              <div className="glass border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
                    <BarChart2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-syne font-black text-xl text-white">Collection <span className="gradient-text">Heatmap</span></h2>
                    <p className="text-xs text-white/40 mt-0.5">Portfolio intelligence and collection analytics.</p>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-10 text-white/40">
                    <BarChart2 size={36} className="stroke-1 mx-auto mb-3 opacity-30" />
                    <p>Add figures to your cabinet to unlock heatmap analytics.</p>
                  </div>
                ) : (
                  <>
                    {/* Top stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Most Valuable */}
                      <div className="glass border border-yellow-500/20 rounded-2xl p-5 bg-yellow-500/[0.02]">
                        <div className="flex items-center gap-2 mb-3">
                          <Flame size={14} className="text-yellow-400" />
                          <span className="text-[10px] font-black tracking-widest text-yellow-400/70 uppercase">Most Valuable</span>
                        </div>
                        {topFigure ? (
                          <>
                            <p className="font-syne font-black text-sm text-white truncate">{topFigure.product?.title}</p>
                            <p className="font-syne font-black text-xl text-yellow-400 mt-1">{symbol}{(topFigure.estimatedCurrentValue * rate).toFixed(2)}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">Paid: {symbol}{(topFigure.acquisitionPrice * rate).toFixed(2)}</p>
                          </>
                        ) : <p className="text-white/30 text-xs">No data</p>}
                      </div>

                      {/* Rarest Figure */}
                      <div className="glass border border-purple-500/20 rounded-2xl p-5 bg-purple-500/[0.02]">
                        <div className="flex items-center gap-2 mb-3">
                          <Trophy size={14} className="text-neon-purple" />
                          <span className="text-[10px] font-black tracking-widest text-neon-purple/70 uppercase">Rarest Piece</span>
                        </div>
                        {rarestFigure ? (
                          <>
                            <p className="font-syne font-black text-sm text-white truncate">{rarestFigure.product?.title}</p>
                            <p className="font-syne font-black text-base text-neon-purple mt-1">{rarestFigure.product?.rarity}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">{rarestFigure.condition} · SN {rarestFigure.serialNumber || '—'}</p>
                          </>
                        ) : <p className="text-white/30 text-xs">No data</p>}
                      </div>

                      {/* Gains */}
                      <div className={`glass border rounded-2xl p-5 ${
                        Number(gainsPct) >= 0 ? 'border-green-500/20 bg-green-500/[0.02]' : 'border-red-500/20 bg-red-500/[0.02]'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap size={14} className={Number(gainsPct) >= 0 ? 'text-green-400' : 'text-red-400'} />
                          <span className={`text-[10px] font-black tracking-widest uppercase ${Number(gainsPct) >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>Portfolio Gain</span>
                        </div>
                        <p className={`font-syne font-black text-3xl ${Number(gainsPct) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Number(gainsPct) >= 0 ? '+' : ''}{gainsPct}%
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">
                          {symbol}{(showcase.totalAcquisitionValue * rate).toFixed(2)} → {symbol}{(showcase.currentEstimatedValue * rate).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Rarity Distribution Bars */}
                    <div className="glass border border-white/5 rounded-2xl p-5">
                      <h4 className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4">Rarity Distribution</h4>
                      <div className="flex flex-col gap-3">
                        {rarConfig.map(({ key, color, label }) => {
                          const count = rarCount[key] || 0
                          const pct = items.length ? Math.round((count / items.length) * 100) : 0
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white/60 w-20 flex-shrink-0">{label}</span>
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ background: color }}
                                />
                              </div>
                              <span className="text-xs font-bold text-white/40 w-10 text-right">{count} ({pct}%)</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Category breakdown */}
                    {catEntries.length > 0 && (
                      <div className="glass border border-white/5 rounded-2xl p-5">
                        <h4 className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-4">Category Breakdown</h4>
                        <div className="flex flex-wrap gap-2">
                          {catEntries.map(([cat, cnt]) => (
                            <div key={cat} className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
                              <span className="text-xs font-bold text-white">{cat}</span>
                              <span className="text-[10px] text-neon-blue font-black">{cnt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })()}

          {/* 5. GRAIL TRACKER */}
          {activeTab === "GrailTracker" && (
            <div className="glass border border-white/5 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                    <Trophy size={18} className="text-black" />
                  </div>
                  <div>
                    <h2 className="font-syne font-black text-xl text-white">Grail <span className="gradient-text">Tracker</span></h2>
                    <p className="text-xs text-white/40 mt-0.5">Get notified when your grails drop in price or restock.</p>
                  </div>
                </div>
                <Link to="/catalog" className="text-xs text-neon-purple font-bold hover:underline">+ Track a Grail</Link>
              </div>

              {!trackersData || trackersData.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-3 text-white/40">
                  <Bell size={40} className="stroke-1 opacity-30" />
                  <p className="font-syne font-bold text-sm text-white/70">No active grail trackers.</p>
                  <p className="text-xs max-w-xs">
                    Visit any figure's product page and click "Track this Grail" to set price and restock alerts.
                  </p>
                  <Link to="/catalog" className="btn-primary mt-2">Browse Catalog</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trackersData.map((tracker) => (
                    <div key={tracker._id} className="glass border border-yellow-500/15 rounded-2xl p-4 flex gap-4 items-center bg-yellow-500/[0.01]">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: tracker.product?.gradient || 'linear-gradient(135deg,#120C1F,#000)' }}>
                        <img src={tracker.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-neon-blue font-bold tracking-wider uppercase">{tracker.product?.rarity}</p>
                        <h4 className="font-syne font-black text-sm text-white truncate">{tracker.product?.title}</h4>
                        <div className="flex gap-3 mt-2">
                          {tracker.targetPrice && (
                            <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">
                              Alert ≤ {symbol}{(tracker.targetPrice * rate).toFixed(0)}
                            </span>
                          )}
                          {tracker.notifyOnRestock && (
                            <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">Restock</span>
                          )}
                          {tracker.notifyOnListing && (
                            <span className="text-[9px] bg-neon-blue/10 border border-neon-blue/20 text-neon-blue px-2 py-0.5 rounded font-bold">Marketplace</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Link to={`/product/${tracker.product?._id}`}
                          className="w-8 h-8 rounded-lg glass border border-white/10 hover:border-neon-purple/40 text-white/30 hover:text-neon-purple transition-all flex items-center justify-center">
                          <Eye size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* POPUP: SECURE SECONDARY MARKETPLACE LISTING MODAL */}
      <AnimatePresence>
        {sellItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 rounded-3xl p-6 w-full max-w-lg relative overflow-hidden bg-dark-950">
              
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 blur-[60px] pointer-events-none rounded-full" />
              
              <h3 className="font-syne font-black text-lg text-white mb-1 flex items-center gap-2">
                <Tag className="text-neon-purple" size={20} />
                List Figure on Resale Board
              </h3>
              <p className="text-xs text-white/50 mb-4">Complete secondary resale pricing and condition settings securely.</p>

              <form onSubmit={handleSellSubmit} className="flex flex-col gap-4 relative z-10">
                {/* Figure Info box */}
                <div className="glass border border-white/5 rounded-xl p-3 flex gap-3 items-center">
                  <img src={sellItem.product?.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h5 className="font-syne font-black text-xs text-white">{sellItem.product?.title}</h5>
                    <p className="text-[10px] text-white/40 mt-0.5">Est. Catalog Valuation: {symbol}{(sellItem.product?.price * rate).toFixed(2)}</p>
                  </div>
                </div>

                {/* Price input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/40 tracking-wider uppercase font-bold">List Resale Price ({code})</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-syne font-bold text-white/60">{symbol}</span>
                    <input type="number" required placeholder="0.00" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-neon-purple rounded-xl py-3 pl-8 pr-4 text-white text-sm font-syne font-bold placeholder-white/20 transition-all outline-none" />
                  </div>
                </div>

                {/* Condition filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/40 tracking-wider uppercase font-bold">Resale Item Condition</label>
                  <select value={sellCondition} onChange={(e) => setSellCondition(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-neon-purple rounded-xl py-3 px-4 text-white text-xs tracking-wider font-bold transition-all outline-none">
                    <option value="MISB" className="bg-dark-950 text-white">MISB (Mint In Sealed Box)</option>
                    <option value="MIB" className="bg-dark-950 text-white">MIB (Mint In Box - Box opened)</option>
                    <option value="Loose" className="bg-dark-950 text-white">Loose (Figure unpacked/No box)</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/40 tracking-wider uppercase font-bold">Seller's Notes</label>
                  <textarea rows="3" placeholder="Condition details, shipping box specifics, etc..." value={sellDesc} onChange={(e) => setSellDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-neon-purple rounded-xl py-3 px-4 text-white text-xs placeholder-white/20 transition-all outline-none resize-none" />
                </div>

                {/* Submit row */}
                <div className="flex gap-2.5 pt-3">
                  <button type="button" onClick={() => setSellItem(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 text-white text-xs font-syne font-bold uppercase transition-all tracking-wider">
                    Cancel
                  </button>
                  <button type="submit" disabled={listMutation.isPending}
                    className="flex-1 py-3 px-4 rounded-xl btn-primary text-xs font-syne font-bold uppercase transition-all tracking-wider">
                    {listMutation.isPending ? "Publishing..." : "Publish Listing"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  )
}
