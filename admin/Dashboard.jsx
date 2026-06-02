import { DollarSign, ShoppingCart, Box, Tag, AlertTriangle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import api from '../../services/api'
import GlassCard from '../../components/GlassCard'
import AdminNav from '../../components/AdminNav'

export default function Dashboard() {
  const { code, rate, symbol } = useSelector((s) => s.currency)

  // Fetch orders
  const { data: ordersRes, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders')
  })

  // Fetch products
  const { data: productsRes, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products')
  })

  // Fetch coupons
  const { data: couponsRes, isLoading: couponsLoading, refetch: refetchCoupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/coupons')
  })

  const isLoading = ordersLoading || productsLoading || couponsLoading

  const handleRefresh = () => {
    refetchOrders()
    refetchProducts()
    refetchCoupons()
  }

  // Calculations
  const orders = ordersRes?.data?.data || []
  const products = productsRes?.data?.data || []
  const coupons = couponsRes?.data?.data || []

  const activeOrders = orders.filter(o => o.status !== 'Cancelled')
  const rawSales = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const convertedSales = (rawSales * rate).toFixed(2)
  const averageOrderValue = activeOrders.length ? rawSales / activeOrders.length : 0
  const conversionRate = products.length ? Math.min(100, ((orders.length / (products.length * 12)) * 100).toFixed(1)) : 0

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length
  const lowStockProducts = products.filter(p => p.stock <= 5)
  const outOfStockCount = products.filter(p => p.stock === 0).length

  // Dynamically calculate dynamic price for metrics
  const formatPrice = (val) => {
    return `${symbol}${(val * rate).toFixed(2)}`
  }

  // Chart Data Generation (Last 7 Days Sales)
  const getLast7DaysData = () => {
    const dates = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }

    const salesByDay = Array(7).fill(0)
    orders.forEach(o => {
      if (o.status === 'Cancelled') return
      const orderDate = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayIdx = dates.indexOf(orderDate)
      if (dayIdx !== -1) {
        salesByDay[dayIdx] += o.totalAmount
      }
    })

    const convertedSalesByDay = salesByDay.map(s => s * rate)
    const maxVal = Math.max(...convertedSalesByDay, 100)

    return { labels: dates, values: convertedSalesByDay, maxVal }
  }

  const chartData = getLast7DaysData()
  const weeklySales = chartData.values.reduce((sum, value) => sum + value, 0)
  const projectedSales = ((weeklySales / (chartData.values.length || 1)) * 7 * 1.08).toFixed(2)

  // Category Distribution for Bar Chart
  const getCategoryDistribution = () => {
    const catMap = {}
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1
    })

    const labels = Object.keys(catMap)
    const values = Object.values(catMap)
    const maxVal = Math.max(...values, 5)

    return { labels, values, maxVal }
  }

  const categoryData = getCategoryDistribution()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16 bg-dark-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-neon-purple animate-spin" />
          <p className="text-white/60 text-sm font-medium">Analyzing business metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="pt-24 pb-16 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-syne font-black text-3xl sm:text-4xl text-white">Admin Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Telemetry, operations, and commerce metrics</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2 !py-2.5 !px-4 text-xs font-semibold">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      <AdminNav />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1 */}
        <GlassCard className="p-6 border border-white/8 relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 bg-neon-purple translate-x-4 -translate-y-4" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/40 font-bold tracking-widest font-syne">TOTAL REVENUE</span>
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-syne truncate">{symbol}{convertedSales}</p>
          <p className="text-xs text-white/50 mt-1">Based on {activeOrders.length} active orders</p>
        </GlassCard>

        {/* KPI 2 */}
        <GlassCard className="p-6 border border-white/8 relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 bg-neon-blue translate-x-4 -translate-y-4" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/40 font-bold tracking-widest font-syne">TOTAL ORDERS</span>
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-syne">{orders.length}</p>
          <p className="text-xs text-neon-blue mt-1 font-semibold">{pendingOrders} orders require processing</p>
        </GlassCard>

        {/* KPI 3 */}
        <GlassCard className="p-6 border border-white/8 relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 bg-neon-cyan translate-x-4 -translate-y-4" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/40 font-bold tracking-widest font-syne">CATALOG ITEMS</span>
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <Box size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-syne">{products.length}</p>
          <p className="text-xs mt-1 text-red-400 font-semibold flex items-center gap-1">
            {outOfStockCount > 0 && <AlertTriangle size={12} />}
            {outOfStockCount} items out of stock
          </p>
        </GlassCard>

        {/* KPI 4 */}
        <GlassCard className="p-6 border border-white/8 relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 bg-yellow-500 translate-x-4 -translate-y-4" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/40 font-bold tracking-widest font-syne">ACTIVE COUPONS</span>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Tag size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-syne">{coupons.length}</p>
          <p className="text-xs text-white/50 mt-1">{coupons.filter(c => c.isActive).length} campaigns currently active</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6 border border-white/8" hover={true}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/40 font-bold tracking-widest font-syne">7-DAY SALES PROJECTION</span>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-syne">{symbol}{projectedSales}</p>
          <p className="text-xs text-white/50 mt-1">Based on the last 7-day average with an 8% uplift projection</p>
        </GlassCard>

        <GlassCard className="p-6 border border-white/8" hover={true}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/40 font-bold tracking-widest font-syne">AVERAGE ORDER VALUE</span>
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
              <Tag size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-syne">{symbol}{averageOrderValue.toFixed(2)}</p>
          <p className="text-xs text-white/50 mt-1">Orders converted at ~{conversionRate}% estimate</p>
        </GlassCard>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <GlassCard className="p-6 border border-white/8" hover={false}>
          <h3 className="text-white font-bold font-syne text-lg mb-6">Recent Sales Trend ({code})</h3>
          
          {/* Custom SVG Line Chart */}
          <div className="h-64 relative w-full pr-4">
            <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b833ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#b833ff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="75" x2="480" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="185" x2="480" y2="185" stroke="rgba(255,255,255,0.1)" />

              {/* Y Axis Labels */}
              <text x="30" y="25" textAnchor="end" className="text-[10px] fill-white/30 font-mono">
                {symbol}{Math.round(chartData.maxVal).toLocaleString()}
              </text>
              <text x="30" y="105" textAnchor="end" className="text-[10px] fill-white/30 font-mono">
                {symbol}{Math.round(chartData.maxVal / 2).toLocaleString()}
              </text>
              <text x="30" y="188" textAnchor="end" className="text-[10px] fill-white/30 font-mono">
                {symbol}0
              </text>

              {/* Generating SVG Coordinates */}
              {(() => {
                const points = chartData.values.map((v, i) => {
                  const x = 40 + (i * 440) / 6
                  const y = 185 - (v / chartData.maxVal) * 165
                  return { x, y }
                })

                const dPath = points.reduce((path, p, i) => {
                  return path + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `
                }, '')

                const dArea = dPath + `L ${points[6].x} 185 L ${points[0].x} 185 Z`

                return (
                  <>
                    {/* Gradient Area */}
                    <path d={dArea} fill="url(#salesGrad)" />
                    {/* Trend Line */}
                    <path d={dPath} fill="none" stroke="#b833ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Data Points */}
                    {points.map((p, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="5" fill="#1e90ff" stroke="#b833ff" strokeWidth="2" />
                        <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                        <title>{chartData.labels[i]}: {symbol}{chartData.values[i].toFixed(2)}</title>
                      </g>
                    ))}
                  </>
                )
              })()}

              {/* X Axis Labels */}
              {chartData.labels.map((l, i) => (
                <text key={i} x={40 + (i * 440) / 6} y="208" textAnchor="middle" className="text-[9px] fill-white/45 font-syne">
                  {l}
                </text>
              ))}
            </svg>
          </div>
        </GlassCard>

        {/* Category Chart */}
        <GlassCard className="p-6 border border-white/8" hover={false}>
          <h3 className="text-white font-bold font-syne text-lg mb-6">Inventory Categories Distribution</h3>
          
          {/* Custom SVG Bar Chart */}
          <div className="h-64 relative w-full pr-4">
            {categoryData.labels.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/30 text-sm">No items in catalog</div>
            ) : (
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                {/* Horizontal Grid Lines */}
                <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                <line x1="50" y1="102" x2="480" y2="102" stroke="rgba(255,255,255,0.05)" />
                <line x1="50" y1="185" x2="480" y2="185" stroke="rgba(255,255,255,0.1)" />

                {/* Y Axis Labels */}
                <text x="40" y="25" textAnchor="end" className="text-[10px] fill-white/30 font-mono">{categoryData.maxVal}</text>
                <text x="40" y="107" textAnchor="end" className="text-[10px] fill-white/30 font-mono">{Math.round(categoryData.maxVal / 2)}</text>
                <text x="40" y="188" textAnchor="end" className="text-[10px] fill-white/30 font-mono">0</text>

                {/* Bars */}
                {categoryData.values.map((v, i) => {
                  const barWidth = 32
                  const spacing = (430 - (categoryData.labels.length * barWidth)) / (categoryData.labels.length + 1)
                  const x = 50 + spacing + i * (barWidth + spacing)
                  const height = (v / categoryData.maxVal) * 165
                  const y = 185 - height

                  return (
                    <g key={i} className="cursor-pointer group">
                      {/* Bar Gradient Background */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx="4"
                        fill="url(#barGrad)"
                        className="transition-all duration-300 hover:brightness-125"
                      />
                      {/* Interactive tooltip */}
                      <title>{categoryData.labels[i]}: {v} figures</title>
                      
                      {/* Value label on top of bar */}
                      <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[9px] font-bold fill-neon-cyan font-mono">
                        {v}
                      </text>
                    </g>
                  )
                })}

                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e90ff" />
                    <stop offset="100%" stopColor="#b833ff" />
                  </linearGradient>
                </defs>

                {/* X Axis Labels */}
                {categoryData.labels.map((l, i) => {
                  const barWidth = 32
                  const spacing = (430 - (categoryData.labels.length * barWidth)) / (categoryData.labels.length + 1)
                  const x = 50 + spacing + i * (barWidth + spacing) + barWidth / 2
                  return (
                    <text key={i} x={x} y="208" textAnchor="middle" className="text-[9px] fill-white/45 font-syne">
                      {l.length > 12 ? `${l.substring(0, 10)}…` : l}
                    </text>
                  )
                })}
              </svg>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Critical Lists (Low Stock and Recent Orders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Watch */}
        <GlassCard className="p-6 border border-white/8 lg:col-span-1" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold font-syne text-lg">Inventory Alerts</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold font-mono">
              {lowStockProducts.length} CRITICAL
            </span>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-sm">All inventory is fully stocked.</div>
            ) : (
              lowStockProducts.map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100'}
                      alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-dark-800" />
                    <div>
                      <h4 className="text-xs font-bold text-white max-w-[120px] truncate">{p.title}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black font-mono ${p.stock === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {p.stock === 0 ? 'OUT' : `${p.stock} LEFT`}
                    </span>
                    <p className="text-[9px] text-white/35 mt-0.5">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link to="/admin/products" className="w-full flex items-center justify-center gap-2 text-xs text-neon-purple hover:text-white transition-colors pt-2 border-t border-white/5 font-semibold">
              Manage Catalog Inventory <ArrowRight size={12} />
            </Link>
          </div>
        </GlassCard>

        {/* Recent Orders */}
        <GlassCard className="p-6 border border-white/8 lg:col-span-2" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold font-syne text-lg">Recent Operations</h3>
            <Link to="/admin/orders" className="text-xs text-neon-blue hover:underline flex items-center gap-1">
              View all orders <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-widest font-mono">
                  <th className="pb-3 pl-1">ORDER ID</th>
                  <th className="pb-3">CUSTOMER</th>
                  <th className="pb-3">TOTAL</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3 pr-1 text-right">DATE</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/1 transition-colors text-xs text-white/80">
                    <td className="py-4 pl-1 font-mono text-[10px] text-neon-purple font-semibold">
                      #{o._id.substring(o._id.length - 8).toUpperCase()}
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-white">{o.customer?.name || 'Guest User'}</div>
                      <div className="text-[9px] text-white/40 mt-0.5">{o.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 font-mono font-bold">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="py-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                        o.status === 'Delivered' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                        o.status === 'Cancelled' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                        o.status === 'Shipped' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                        'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 pr-1 text-right text-white/40 font-mono text-[10px]">
                      {new Date(o.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-white/30 text-sm">No sales transactions have been logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </main>
  )
}
