import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, X, Loader2, Truck } from 'lucide-react'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import GlassCard from '../../components/GlassCard'
import AdminNav from '../../components/AdminNav'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function Orders() {
  const queryClient = useQueryClient()
  const { rate, symbol } = useSelector((s) => s.currency)
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Fetch all orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders-list'],
    queryFn: () => api.get('/orders')
  })

  // Update order status mutation
  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-orders-list'])
      // Update local selectedOrder if open in modal
      if (selectedOrder && selectedOrder._id === res.data.data._id) {
        setSelectedOrder(res.data.data)
      }
    },
    onError: (e) => {
      alert(e.response?.data?.error || 'Failed to update order status')
    }
  })

  const orders = data?.data?.data || []

  // Filter logic
  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const openDetails = (order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const closeDetails = () => {
    setSelectedOrder(null)
    setDetailsOpen(false)
  }

  const handleStatusChange = (id, status) => {
    updateStatusMut.mutate({ id, status })
  }

  const formatPrice = (val) => {
    return `${symbol}${(val * rate).toFixed(2)}`
  }

  return (
    <main className="pt-24 pb-16 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne font-black text-3xl sm:text-4xl text-white">Order Operations</h1>
        <p className="text-white/40 text-sm mt-1">Monitor sales transactions, logistics, and order fulfillment</p>
      </div>

      <AdminNav />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', ...STATUS_OPTIONS].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === status
                ? 'btn-primary'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <GlassCard className="border border-white/8 overflow-hidden" hover={false}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
            <p className="text-white/40 text-xs">Loading logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-widest font-mono">
                  <th className="py-4 pl-4">ORDER ID</th>
                  <th className="py-4">CUSTOMER</th>
                  <th className="py-4">ITEMS</th>
                  <th className="py-4">TOTAL</th>
                  <th className="py-4">PAYMENT</th>
                  <th className="py-4">LOGISTICS</th>
                  <th className="py-4 pr-4 text-right">CONTROLS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/1 transition-colors text-xs text-white/80">
                    {/* Order ID */}
                    <td className="py-4 pl-4 font-mono font-bold text-neon-purple text-[10px]">
                      #{o._id.substring(o._id.length - 8).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="py-4">
                      <div className="font-bold text-white">{o.customer?.name || 'Guest User'}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{o.customer?.email || 'N/A'}</div>
                    </td>

                    {/* Items Count */}
                    <td className="py-4">
                      <span className="font-semibold text-white/70">
                        {o.products?.reduce((sum, item) => sum + item.quantity, 0) || 0} figures
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 font-mono font-bold">
                      {formatPrice(o.totalAmount)}
                    </td>

                    {/* Payment */}
                    <td className="py-4">
                      <div className="font-semibold">{o.payment?.method || 'Mock'}</div>
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        o.payment?.status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {o.payment?.status?.toUpperCase()}
                      </span>
                    </td>

                    {/* Logistics Status Badge */}
                    <td className="py-4">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                        o.status === 'Delivered' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                        o.status === 'Cancelled' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                        o.status === 'Shipped' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                        'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500'
                      }`}>
                        {o.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 pr-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {/* Status Updater Dropdown */}
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/80 cursor-pointer focus:outline-none focus:border-neon-purple/50 font-semibold"
                        >
                          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>

                        {/* View Details Button */}
                        <button
                          onClick={() => openDetails(o)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-blue/30 text-white/60 hover:text-neon-blue transition-all"
                          title="Inspect Order"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-white/30 text-sm">
                      No orders found matching the filter status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Order Details Modal */}
      <AnimatePresence>
        {detailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <div>
                  <h2 className="font-syne font-black text-xl text-white">Order Specifications</h2>
                  <p className="text-[10px] text-neon-purple font-mono mt-0.5">ID: {selectedOrder._id.toUpperCase()}</p>
                </div>
                <button onClick={closeDetails} className="p-1 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* Logistics status banner */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-neon-blue animate-pulse" />
                    <div>
                      <span className="text-[10px] text-white/40 block">CURRENT STATUS</span>
                      <span className="text-xs font-bold text-white">{selectedOrder.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      className="bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white/80 font-bold focus:outline-none"
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                {/* Shipping & Payment grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                    <h4 className="text-white text-xs font-bold font-syne mb-2.5">Shipping Destination</h4>
                    <p className="text-xs text-white/70 font-semibold">{selectedOrder.customer?.name || 'Guest User'}</p>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {selectedOrder.shippingAddress?.street}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                      {selectedOrder.shippingAddress?.zipCode || 'No ZipCode'}, {selectedOrder.shippingAddress?.country || 'USA'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                    <h4 className="text-white text-xs font-bold font-syne mb-2.5">Payment Details</h4>
                    <div className="flex justify-between text-xs text-white/70 py-1">
                      <span>Method:</span>
                      <span className="font-bold">{selectedOrder.payment?.method}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 py-1">
                      <span>Status:</span>
                      <span className={`font-bold font-mono text-[10px] px-1 rounded ${
                        selectedOrder.payment?.status === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {selectedOrder.payment?.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 py-1 border-t border-white/5 mt-1.5 pt-1.5">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-[9px] text-white/45 max-w-[120px] truncate" title={selectedOrder.payment?.id}>
                        {selectedOrder.payment?.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div>
                  <h4 className="text-white text-xs font-bold font-syne mb-3">Line Items</h4>
                  <div className="flex flex-col gap-3">
                    {selectedOrder.products?.map((item) => (
                      <div key={item._id || item.product?._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/3 border border-white/5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100'}
                            alt={item.product?.title || 'Unknown Figure'}
                            className="w-10 h-10 rounded-lg object-cover bg-dark-900"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-white max-w-[200px] truncate">{item.product?.title || 'Deleted Item'}</h5>
                            <p className="text-[10px] text-white/40 mt-0.5">{item.product?.category || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">{item.quantity} × {formatPrice(item.price)}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">Subtotal: {formatPrice(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations Summary */}
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-xs text-white/70">
                  {selectedOrder.coupon && (
                    <div className="flex justify-between py-1 border-b border-white/5 pb-2 mb-2 text-green-400">
                      <span>Coupon applied ({selectedOrder.coupon.code}):</span>
                      <span className="font-mono font-bold">-{formatPrice(selectedOrder.coupon.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm">
                    <span>Order Total:</span>
                    <span className="font-mono text-neon-cyan">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                  <button onClick={closeDetails} className="btn-secondary !py-2.5 !px-5 text-xs font-semibold">
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
