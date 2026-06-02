import { useQuery } from '@tanstack/react-query'
import { Loader2, RefreshCw, BarChart2, Users, Award, Box } from 'lucide-react'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import GlassCard from '../../components/GlassCard'
import AdminNav from '../../components/AdminNav'

export default function Intelligence() {
  const { rate, symbol } = useSelector((s) => s.currency)

  // Fetch Inventory Intelligence
  const { data: inventoryRes, isLoading: inventoryLoading, refetch: refetchInventory } = useQuery({
    queryKey: ['admin-intelligence-inventory'],
    queryFn: () => api.get('/admin/analytics/inventory').then(r => r.data)
  })

  // Fetch Demand Intelligence
  const { data: demandRes, isLoading: demandLoading, refetch: refetchDemand } = useQuery({
    queryKey: ['admin-intelligence-demand'],
    queryFn: () => api.get('/admin/analytics/demand').then(r => r.data)
  })

  const isLoading = inventoryLoading || demandLoading

  const handleRefresh = () => {
    refetchInventory()
    refetchDemand()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16 bg-dark-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-neon-purple animate-spin" />
          <p className="text-white/60 text-sm font-medium">Crunching ecosystem intelligence...</p>
        </div>
      </div>
    )
  }

  const inventory = inventoryRes || { summary: {}, products: [] }
  const demand = demandRes || { platform: {}, grailDemand: [], wishlistDemand: [] }
  const restockRecommendations = inventory.products?.map((product) => {
    const productDemand = demand.grailDemand?.find(g => g.product?._id === product._id)?.trackerCount || 0
    const suggested = Math.max(0, Math.ceil((productDemand * 2) - product.stock))
    return {
      ...product,
      productDemand,
      suggestedOrder: suggested
    }
  }) || []

  const topRestock = restockRecommendations
    .filter(p => p.suggestedOrder > 0)
    .sort((a, b) => b.productDemand - a.productDemand)
    .slice(0, 3)

  return (
    <main className="pt-24 pb-16 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-syne font-black text-3xl sm:text-4xl text-white">Ecosystem Intelligence</h1>
          <p className="text-white/40 text-sm mt-1">Ecommerce health indexes, Grail demand logs, and inventory intelligence</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2 !py-2.5 !px-4 text-xs font-semibold">
          <RefreshCw size={14} /> Refresh Analytics
        </button>
      </div>

      <AdminNav />

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-5 border border-white/5" hover={true}>
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Ecosystem Grail Demand</p>
          <p className="font-syne font-black text-2xl text-white mt-1">
            {demand.grailDemand?.reduce((sum, item) => sum + item.trackerCount, 0) || 0} Watchers
          </p>
          <p className="text-xs text-white/30 mt-0.5">Active stock/price telemetry subscriptions</p>
        </GlassCard>

        <GlassCard className="p-5 border border-white/5">
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Inventory Health Index</p>
          <p className="font-syne font-black text-2xl text-green-400 mt-1">
            {inventory.summary?.healthy || 0} / {inventory.summary?.total || 0}
          </p>
          <p className="text-xs text-white/30 mt-0.5">Products with healthy stock levels (&gt;10 units)</p>
        </GlassCard>

        <GlassCard className="p-5 border border-white/5">
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Restock Warnings</p>
          <p className="font-syne font-black text-2xl text-red-400 mt-1">
            {inventory.summary?.needsRestock || 0} Items
          </p>
          <p className="text-xs text-white/30 mt-0.5">Products under critical stock threshold (≤5 units)</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6 border border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="text-neon-ember" size={20} />
            <h3 className="text-white font-bold font-syne text-lg">Restock Forecast</h3>
          </div>
          {topRestock.length === 0 ? (
            <p className="text-white/40 text-sm">All inventory positions are currently healthy or demand is stable.</p>
          ) : (
            <div className="space-y-3">
              {topRestock.map((product) => (
                <div key={product._id} className="glass rounded-2xl border border-white/10 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{product.title}</p>
                    <p className="text-xs text-white/40">Demand watchers: {product.productDemand}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-red-300 font-black">Order +{product.suggestedOrder}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Demand Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Grail Demand Heatmap Leaderboard */}
        <GlassCard className="p-6 border border-white/8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-yellow-400" size={20} />
            <h3 className="text-white font-bold font-syne text-lg">Top Tracked Grails (Demand signals)</h3>
          </div>

          <div className="flex flex-col gap-4">
            {demand.grailDemand?.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-6">No grail trackers active.</p>
            ) : (
              demand.grailDemand?.map((item, idx) => (
                <div key={item._id} className="glass border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/30 font-bold">#0{idx+1}</span>
                      <h4 className="text-xs font-bold text-white truncate">{item.product?.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                        {item.product?.rarity}
                      </span>
                      <span className="text-[9px] text-white/40">
                        Stock: {item.product?.stock} · Price: {symbol}{(item.product?.price * rate).toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-syne font-black text-sm text-neon-blue">{item.trackerCount} Watchers</span>
                    <div className="flex gap-1.5 justify-end text-[8px] text-white/40 mt-1 uppercase font-bold">
                      {item.priceWatchers > 0 && <span>${item.priceWatchers} Price</span>}
                      {item.restockWatchers > 0 && <span>In Stock Alert</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Wishlist Leaderboard */}
        <GlassCard className="p-6 border border-white/8">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-neon-purple" size={20} />
            <h3 className="text-white font-bold font-syne text-lg">Ecosystem Wishlist Heatmap</h3>
          </div>

          <div className="flex flex-col gap-4">
            {demand.wishlistDemand?.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-6">No wishlist items in ecosystem.</p>
            ) : (
              demand.wishlistDemand?.map((item, idx) => (
                <div key={item._id} className="glass border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/30 font-bold">#0{idx+1}</span>
                      <h4 className="text-xs font-bold text-white truncate">{item.product?.title}</h4>
                    </div>
                    <p className="text-[9px] text-white/40 mt-1">
                      {item.product?.rarity} · Stock: {item.product?.stock} · Catalog Price: {symbol}{(item.product?.price * rate).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-syne font-black text-sm text-neon-purple">{item.wishCount} Collectors</span>
                    <p className="text-[9px] text-white/30 mt-0.5">Wishlisted</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

      </div>

      {/* Inventory Intelligence & Forecasting */}
      <GlassCard className="p-6 border border-white/8">
        <div className="flex items-center gap-2 mb-6">
          <Box className="text-neon-cyan" size={20} />
          <h3 className="text-white font-bold font-syne text-lg">Inventory Intelligence & Forecasting</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-widest font-mono">
                <th className="pb-3 pl-1">FIGURE TITLE</th>
                <th className="pb-3">CATEGORY</th>
                <th className="pb-3 text-center">STOCK STATUS</th>
                <th className="pb-3 text-center">QUANTITY</th>
                <th className="pb-3 text-center">GRAIL DEMAND</th>
                <th className="pb-3 pr-1 text-right">ACTION PLAN</th>
              </tr>
            </thead>
            <tbody>
              {inventory.products?.map(p => {
                const productDemand = demand.grailDemand?.find(g => g.product?._id === p._id)?.trackerCount || 0
                return (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/1 transition-colors text-xs text-white/85">
                    <td className="py-4 pl-1 font-bold text-white truncate max-w-[200px]">
                      {p.title}
                    </td>
                    <td className="py-4 text-white/50">{p.category}</td>
                    <td className="py-4 text-center">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                        p.stockStatus === 'depleted' ? 'bg-red-500/10 border border-red-500/20 text-red-500' :
                        p.stockStatus === 'critical' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500' :
                        p.stockStatus === 'low'      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                        'bg-green-500/10 border border-green-500/20 text-green-400'
                      }`}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center font-mono font-bold">{p.stock} units</td>
                    <td className="py-4 text-center font-mono font-bold text-neon-blue">{productDemand} watchers</td>
                    <td className="py-4 pr-1 text-right">
                      {p.stock === 0 ? (
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-400/5 px-2 py-1 rounded border border-red-400/20">
                          Needs Restock & Notify {productDemand} watchers
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider bg-yellow-400/5 px-2 py-1 rounded border border-yellow-400/20">
                          Critical Alert Level
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                          Healthy Inventory
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {inventory.products?.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/30 text-sm">No catalog figures detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </main>
  )
}
