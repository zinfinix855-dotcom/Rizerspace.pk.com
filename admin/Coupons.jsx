import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Tag, Calendar, AlertTriangle, Loader2, Save, Sparkles, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'
import GlassCard from '../../components/GlassCard'
import AdminNav from '../../components/AdminNav'

export default function Coupons() {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch all coupons
  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons-list'],
    queryFn: () => api.get('/coupons')
  })

  const coupons = data?.data?.data || []

  // Create coupon mutation
  const createMut = useMutation({
    mutationFn: (payload) => api.post('/coupons', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-coupons-list'])
      setSuccess(`Coupon ${res.data.data.code} created successfully!`)
      setCode('')
      setDiscount('')
      setExpiryDate('')
      setErr('')
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (e) => {
      setErr(e.response?.data?.error || 'Failed to create coupon')
      setSuccess('')
    }
  })

  // Delete coupon mutation
  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons-list'])
    },
    onError: (e) => {
      alert(e.response?.data?.error || 'Failed to delete coupon')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr('')
    setSuccess('')

    if (!code.trim() || !discount || !expiryDate) {
      setErr('Please fill in all coupon fields.')
      return
    }

    const discountNum = Number(discount)
    if (discountNum < 1 || discountNum > 99) {
      setErr('Discount percentage must be between 1% and 99%.')
      return
    }

    createMut.mutate({
      code: code.trim().toUpperCase(),
      discount: discountNum,
      expiryDate
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this coupon campaign? Customers will no longer be able to apply it.')) {
      deleteMut.mutate(id)
    }
  }

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if coupon is expired helper
  const isExpired = (expiryStr) => {
    return new Date(expiryStr) < new Date()
  }

  return (
    <main className="pt-24 pb-16 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne font-black text-3xl sm:text-4xl text-white">Promotional Campaigns</h1>
        <p className="text-white/40 text-sm mt-1">Configure and manage active coupon discount codes</p>
      </div>

      <AdminNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creator Form Panel */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 border border-white/8 sticky top-24" hover={false}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="text-neon-purple w-5 h-5" />
              <h3 className="text-white font-bold font-syne text-lg">Generate Coupon</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">COUPON CODE</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. ULTRA25"
                  required
                  className="input-neon w-full uppercase font-mono text-xs py-3"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">DISCOUNT PERCENTAGE</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    placeholder="25"
                    required
                    className="input-neon w-full font-mono text-xs py-3 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 font-mono text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">EXPIRATION DATE</label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    required
                    className="input-neon w-full text-xs py-3 cursor-pointer text-white/80"
                  />
                </div>
              </div>

              {err && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={createMut.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 text-xs font-semibold"
              >
                {createMut.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Campaign Code
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Coupons List Panel */}
        <div className="lg:col-span-2">
          <GlassCard className="border border-white/8 overflow-hidden" hover={false}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
                <p className="text-white/40 text-xs">Loading campaigns...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-widest font-mono">
                      <th className="py-4 pl-4">COUPON CODE</th>
                      <th className="py-4">DISCOUNT</th>
                      <th className="py-4">EXPIRATION</th>
                      <th className="py-4">STATUS</th>
                      <th className="py-4 pr-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => {
                      const expired = isExpired(c.expiryDate)
                      const active = c.isActive && !expired

                      return (
                        <tr key={c._id} className="border-b border-white/5 hover:bg-white/1 transition-colors text-xs text-white/80">
                          {/* Code */}
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple shrink-0">
                                <Tag size={14} />
                              </div>
                              <span className="font-mono font-black tracking-wider text-sm text-white">
                                {c.code}
                              </span>
                            </div>
                          </td>

                          {/* Discount */}
                          <td className="py-4 font-mono font-bold text-neon-cyan">
                            {c.discount}% OFF
                          </td>

                          {/* Expiry */}
                          <td className="py-4 text-white/60 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-white/30" />
                              <span>{formatDate(c.expiryDate)}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                              active
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                              {active ? 'Active' : expired ? 'Expired' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 pr-4 text-right">
                            <button
                              onClick={() => handleDelete(c._id)}
                              className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 text-red-400/70 hover:text-red-400 transition-all"
                              title="Delete Coupon"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-white/30">
                          No promotional coupon codes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </main>
  )
}
