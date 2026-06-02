import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Loader2, Save } from 'lucide-react'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import GlassCard from '../../components/GlassCard'
import AdminNav from '../../components/AdminNav'

const CATEGORIES = ['Dragon Ball Z', 'Naruto', 'One Piece', 'Demon Slayer', 'Attack on Titan', 'Jujutsu Kaisen', 'My Hero Academia', 'Bleach', 'One Punch Man']

const GRADIENTS = [
  { label: 'Orange/Yellow (Goku)', value: 'linear-gradient(135deg,#FF6B35,#FF9F1C)' },
  { label: 'Gold/Yellow (Naruto)', value: 'linear-gradient(135deg,#F7971E,#FFD200)' },
  { label: 'Red/Salmon (Luffy)', value: 'linear-gradient(135deg,#FF0844,#FFB199)' },
  { label: 'Cyan/Blue (Tanjiro)', value: 'linear-gradient(135deg,#1CB5E0,#000046)' },
  { label: 'Grey/Blue (Levi)', value: 'linear-gradient(135deg,#373B44,#4286F4)' },
  { label: 'Purple/Indigo (Gojo)', value: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { label: 'Deep Ocean (Itachi)', value: 'linear-gradient(135deg,#0F0C29,#302B63,#24243e)' },
  { label: 'Carbon/Steel (Ichigo)', value: 'linear-gradient(135deg,#232526,#414345)' },
  { label: 'Emerald/Lime (Zoro)', value: 'linear-gradient(135deg,#00B09B,#96C93D)' },
]

const INITIAL_FORM = {
  title: '',
  description: '',
  category: 'Naruto',
  price: '',
  discountedPrice: '',
  stock: '',
  images: [''],
  specs: { Scale: '1/7', Height: '25cm', Material: 'ABS+PVC' },
  gradient: 'linear-gradient(135deg,#F7971E,#FFD200)',
  symbol: ''
}

export default function Products() {
  const queryClient = useQueryClient()
  const { rate, symbol } = useSelector((s) => s.currency)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [err, setErr] = useState('')

  // Query catalog products
  const { data, isLoading } = useQuery({
    queryKey: ['admin-catalog-products', page, search],
    queryFn: () => api.get(`/products?limit=10&page=${page}&search=${search}`),
    keepPreviousData: true
  })

  const products = data?.data?.data || []
  const totalPages = data?.data?.pages || 1

  // Create mutation
  const createMut = useMutation({
    mutationFn: (payload) => api.post('/products', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-catalog-products'])
      closeModal()
    },
    onError: (e) => {
      setErr(e.response?.data?.error || 'Failed to create product')
    }
  })

  // Update mutation
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/products/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-catalog-products'])
      closeModal()
    },
    onError: (e) => {
      setErr(e.response?.data?.error || 'Failed to update product')
    }
  })

  // Delete mutation
  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-catalog-products'])
    },
    onError: (e) => {
      alert(e.response?.data?.error || 'Failed to delete product')
    }
  })

  const openAddModal = () => {
    setEditingId(null)
    setForm(INITIAL_FORM)
    setErr('')
    setModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingId(p._id)
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      discountedPrice: p.discountedPrice || '',
      stock: p.stock,
      images: p.images || [''],
      specs: p.specs || { Scale: '1/7', Height: '25cm', Material: 'ABS+PVC' },
      gradient: p.gradient || 'linear-gradient(135deg,#F7971E,#FFD200)',
      symbol: p.symbol || ''
    })
    setErr('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(INITIAL_FORM)
    setErr('')
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setErr('')
    
    // Clean and validate form fields
    const payload = {
      ...form,
      price: Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      stock: Number(form.stock),
      // Filter out empty image values
      images: form.images.filter(img => img.trim() !== '')
    }

    if (payload.images.length === 0) {
      payload.images = ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500']
    }

    if (editingId) {
      updateMut.mutate({ id: editingId, payload })
    } else {
      createMut.mutate(payload)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this figure from the catalog?')) {
      deleteMut.mutate(id)
    }
  }

  const handleImageUrlChange = (index, value) => {
    const updated = [...form.images]
    updated[index] = value
    setForm(f => ({ ...f, images: updated }))
  }

  const addImageField = () => {
    setForm(f => ({ ...f, images: [...f.images, ''] }))
  }

  const removeImageField = (index) => {
    if (form.images.length <= 1) return
    const updated = form.images.filter((_, idx) => idx !== index)
    setForm(f => ({ ...f, images: updated }))
  }

  return (
    <main className="pt-24 pb-16 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-syne font-black text-3xl sm:text-4xl text-white">Figures Catalog</h1>
          <p className="text-white/40 text-sm mt-1">Manage catalog collectibles, stock, details and metadata</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-xs font-semibold">
          <Plus size={16} /> Add Anime Figure
        </button>
      </div>

      <AdminNav />

      {/* Filters & Search */}
      <GlassCard className="p-4 border border-white/8 mb-6" hover={false}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search figures by title, series, or keywords..."
            className="input-neon w-full pl-10 text-sm py-3"
          />
        </div>
      </GlassCard>

      {/* Catalog Table */}
      <GlassCard className="border border-white/8 overflow-hidden mb-6" hover={false}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
            <p className="text-white/40 text-xs">Loading anime catalog...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-widest font-mono">
                  <th className="py-4 pl-4">FIGURE</th>
                  <th className="py-4">CATEGORY</th>
                  <th className="py-4">PRICE</th>
                  <th className="py-4">STOCK</th>
                  <th className="py-4">SCALE/MATERIAL</th>
                  <th className="py-4 pr-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/1 transition-colors text-xs text-white/80">
                    {/* Item block */}
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5 relative bg-dark-900">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100'}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                          {p.symbol && (
                            <span className="absolute bottom-0 right-0 bg-dark-950/80 text-white font-bold px-1 rounded-tl text-[8px] border-t border-l border-white/10">
                              {p.symbol}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white max-w-[200px] truncate">{p.title}</h4>
                          <span className="text-[10px] text-white/30 font-mono">ID: {p._id.substring(p._id.length - 8).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 font-semibold text-white/70">
                      {p.category}
                    </td>

                    {/* Price */}
                    <td className="py-4">
                      <div className="font-mono font-bold text-white">
                        {symbol}{(p.discountedPrice ? p.discountedPrice * rate : p.price * rate).toFixed(2)}
                      </div>
                      {p.discountedPrice && (
                        <div className="font-mono text-[9px] text-white/30 line-through">
                          {symbol}{(p.price * rate).toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4">
                      <span className={`font-mono font-bold ${
                        p.stock === 0 ? 'text-red-500' :
                        p.stock <= 5 ? 'text-yellow-500' : 'text-white/60'
                      }`}>
                        {p.stock} units
                      </span>
                      {p.stock <= 5 && (
                        <span className="ml-1 text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/20">
                          LOW
                        </span>
                      )}
                    </td>

                    {/* Specs */}
                    <td className="py-4">
                      <div className="text-white/60 font-semibold">{p.specs?.Scale || '1/7'} • {p.specs?.Height || '25cm'}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{p.specs?.Material || 'ABS+PVC'}</div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-blue/30 text-white/60 hover:text-neon-blue transition-all"
                          title="Edit Figure"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30 text-red-400/70 hover:text-red-400 transition-all"
                          title="Delete Figure"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-white/30">
                      No figures found in catalog. Create one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
            <button
              key={pNum}
              onClick={() => setPage(pNum)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                page === pNum
                  ? 'btn-primary'
                  : 'bg-white/5 border border-white/15 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {pNum}
            </button>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <h2 className="font-syne font-black text-xl text-white">
                  {editingId ? 'Edit Collectible Figure' : 'Register New Collectible'}
                </h2>
                <button onClick={closeModal} className="p-1 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-6">
                
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">FIGURE TITLE</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                      placeholder="e.g. Goku Ultra Instinct"
                      className="input-neon w-full text-xs py-3"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">CATEGORY / SERIES</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="input-neon w-full text-xs py-3 cursor-pointer"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">DESCRIPTION</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    required
                    placeholder="Enter detailed collector specification history..."
                    rows="3"
                    className="input-neon w-full text-xs py-3 resize-none"
                  />
                </div>

                {/* Price, Sale Price, Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">RETAIL PRICE (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      required
                      placeholder="89.99"
                      className="input-neon w-full text-xs py-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">DISCOUNTED PRICE (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.discountedPrice}
                      onChange={e => setForm(f => ({ ...f, discountedPrice: e.target.value }))}
                      placeholder="Optional"
                      className="input-neon w-full text-xs py-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">STOCK QUANTITY</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      required
                      placeholder="20"
                      className="input-neon w-full text-xs py-3 font-mono"
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col gap-4">
                  <h4 className="text-white text-xs font-bold font-syne">Physical Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] text-white/40 tracking-widest mb-1 block">SCALE</label>
                      <input
                        type="text"
                        value={form.specs.Scale}
                        onChange={e => setForm(f => ({ ...f, specs: { ...f.specs, Scale: e.target.value } }))}
                        required
                        className="input-neon w-full text-xs py-2 bg-dark-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 tracking-widest mb-1 block">HEIGHT</label>
                      <input
                        type="text"
                        value={form.specs.Height}
                        onChange={e => setForm(f => ({ ...f, specs: { ...f.specs, Height: e.target.value } }))}
                        required
                        className="input-neon w-full text-xs py-2 bg-dark-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 tracking-widest mb-1 block">MATERIAL</label>
                      <input
                        type="text"
                        value={form.specs.Material}
                        onChange={e => setForm(f => ({ ...f, specs: { ...f.specs, Material: e.target.value } }))}
                        required
                        className="input-neon w-full text-xs py-2 bg-dark-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Image URLs */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-white/40 tracking-widest block font-bold">IMAGE URLS</label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-[10px] text-neon-blue font-bold hover:underline"
                    >
                      + Add Image
                    </button>
                  </div>
                  
                  {form.images.map((imgUrl, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={imgUrl}
                        onChange={e => handleImageUrlChange(index, e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="input-neon w-full text-xs py-2.5 font-mono"
                      />
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all text-xs"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Aesthetics: Kanji symbol and Glow theme */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">KANJI CHARACTER</label>
                    <input
                      type="text"
                      maxLength="2"
                      value={form.symbol}
                      onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                      placeholder="e.g. 孫 or 鳴"
                      className="input-neon w-full text-center text-lg py-1 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-white/40 tracking-widest mb-1.5 block font-bold">CARD GLOW GRADIENT</label>
                    <select
                      value={form.gradient}
                      onChange={e => setForm(f => ({ ...f, gradient: e.target.value }))}
                      className="input-neon w-full text-xs py-3 cursor-pointer"
                    >
                      {GRADIENTS.map(grad => <option key={grad.value} value={grad.value}>{grad.label}</option>)}
                    </select>
                  </div>
                </div>

                {err && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{err}</span>
                  </div>
                )}

                {/* Modal actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary !py-3 !px-5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMut.isPending || updateMut.isPending}
                    className="btn-primary !py-3 !px-6 text-xs font-semibold flex items-center gap-2"
                  >
                    {createMut.isPending || updateMut.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Collectible
                      </>
                    )}
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
