import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

const CATEGORIES = ['All','Dragon Ball Z','Naruto','One Piece','Demon Slayer','Attack on Titan','Jujutsu Kaisen','My Hero Academia','Bleach','One Punch Man']
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const [search,   setSearch]   = useState(params.get('search') || '')
  const [category, setCategory] = useState(params.get('category') || 'All')
  const [sort,     setSort]     = useState(params.get('sort') || '')
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '')
  const [rating,   setRating]   = useState(params.get('rating') || '')
  const [page,     setPage]     = useState(1)

  const handleSearchChange = (value) => { setSearch(value); setPage(1) }
  const handleCategoryChange = (value) => { setCategory(value); setPage(1) }
  const handleSortChange = (value) => { setSort(value); setPage(1) }
  const handleMinPriceChange = (value) => { setMinPrice(value); setPage(1) }
  const handleMaxPriceChange = (value) => { setMaxPrice(value); setPage(1) }
  const handleRatingChange = (value) => { setRating(value); setPage(1) }

  // Sync state → URL
  useEffect(() => {
    const p = {}
    if (search)   p.search   = search
    if (category && category !== 'All') p.category = category
    if (sort)     p.sort     = sort
    if (minPrice) p.minPrice = minPrice
    if (maxPrice) p.maxPrice = maxPrice
    if (rating)   p.rating   = rating
    setParams(p)
  }, [search, category, sort, minPrice, maxPrice, rating, setParams])

  const buildQuery = () => {
    let q = `?page=${page}&limit=12`
    if (search)   q += `&search=${search}`
    if (category && category !== 'All') q += `&category=${category}`
    if (sort)     q += `&sort=${sort}`
    if (minPrice) q += `&minPrice=${minPrice}`
    if (maxPrice) q += `&maxPrice=${maxPrice}`
    if (rating)   q += `&rating=${rating}`
    return q
  }

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, sort, minPrice, maxPrice, rating, page],
    queryFn: () => api.get(`/products${buildQuery()}`).then(r => r.data),
    keepPreviousData: true,
  })

  const clearFilters = () => {
    setSearch(''); setCategory('All'); setSort(''); setMinPrice(''); setMaxPrice(''); setRating(''); setPage(1)
  }

  const hasFilters = search || category !== 'All' || sort || minPrice || maxPrice || rating

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs text-neon-purple font-semibold tracking-widest mb-1">BROWSE ALL</p>
          <h1 className="font-syne font-black text-4xl text-white">Figure <span className="gradient-text">Catalog</span></h1>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search figures, series, characters…"
              className="input-neon pl-10 w-full" />
          </div>
          <select value={sort} onChange={e => handleSortChange(e.target.value)}
            className="input-neon w-full sm:w-48 cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-secondary !px-4 whitespace-nowrap">
            <SlidersHorizontal size={15} /> Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-neon-purple" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors px-3">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              className="overflow-hidden mb-8">
              <div className="glass rounded-2xl p-6 border border-white/8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs text-white/40 tracking-widest mb-2 block">MIN PRICE ($)</label>
                  <input type="number" value={minPrice} onChange={e => handleMinPriceChange(e.target.value)} placeholder="0" className="input-neon" />
                </div>
                <div>
                  <label className="text-xs text-white/40 tracking-widest mb-2 block">MAX PRICE ($)</label>
                  <input type="number" value={maxPrice} onChange={e => handleMaxPriceChange(e.target.value)} placeholder="500" className="input-neon" />
                </div>
                <div>
                  <label className="text-xs text-white/40 tracking-widest mb-2 block">MIN RATING</label>
                  <select value={rating} onChange={e => handleRatingChange(e.target.value)} className="input-neon cursor-pointer">
                    <option value="">Any</option>
                    {[3,3.5,4,4.5,5].map(r => <option key={r} value={r}>{r}★ & up</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-8 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border ${
                category === cat
                  ? 'border-neon-purple text-white'
                  : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
              }`}
              style={category === cat ? {background:'rgba(184,51,255,0.2)'} : {}}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-white/30 mb-6">
            {data?.total || 0} figures found
            {category !== 'All' && <span className="text-neon-purple"> in {category}</span>}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({length:12}).map((_,i) => <div key={i} className="glass rounded-2xl h-72 animate-pulse border border-white/5" />)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h3 className="font-syne font-bold text-xl text-white/50 mb-2">No figures found</h3>
            <p className="text-white/30 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((p, i) => (
              <motion.div key={p._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({length: data.pages}).map((_,i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${page === i+1 ? 'btn-primary !p-0' : 'glass border border-white/10 text-white/50 hover:border-neon-purple/40'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
