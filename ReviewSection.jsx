import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Trash2 } from 'lucide-react'
import api from '../services/api'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <Star size={22} fill={(hover || value) >= i ? '#b833ff' : 'none'}
            className={(hover || value) >= i ? 'text-neon-purple' : 'text-white/20'} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ productId }) {
  const { user } = useSelector(s => s.auth)
  const qc       = useQueryClient()
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [err, setErr]         = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/product/${productId}`).then(r => r.data.data),
  })

  const submitMut = useMutation({
    mutationFn: () => api.post('/reviews', { productId, rating, comment }),
    onSuccess: () => { qc.invalidateQueries(['reviews', productId]); setRating(0); setComment(''); setErr('') },
    onError: (e) => setErr(e.response?.data?.error || 'Failed to submit review'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries(['reviews', productId]),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rating) return setErr('Please select a star rating')
    if (!comment.trim()) return setErr('Please write a comment')
    setErr('')
    submitMut.mutate()
  }

  return (
    <div className="mt-12">
      <h3 className="font-syne font-bold text-xl text-white mb-6">Customer Reviews</h3>

      {/* Write a review */}
      {user ? (
        <div className="glass rounded-2xl p-6 mb-8 border border-white/8">
          <h4 className="font-semibold text-sm text-white/70 mb-4 tracking-wide">WRITE A REVIEW</h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <StarRating value={rating} onChange={setRating} />
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this figure..."
              rows={3} className="input-neon resize-none" />
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button type="submit" disabled={submitMut.isPending}
              className="btn-primary self-start flex items-center gap-2">
              <Send size={14} /> {submitMut.isPending ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 mb-8 border border-white/8 text-center text-sm text-white/40">
          <a href="/login" className="text-neon-purple hover:underline">Sign in</a> to write a review
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="text-white/40 text-sm">Loading reviews…</div>
      ) : data?.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-white/30 text-sm border border-white/5">
          No reviews yet. Be the first to review this figure!
        </div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-4">
            {data?.map(rv => (
              <motion.div key={rv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/8">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-white">{rv.user?.name || 'Anonymous'}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} fill={i <= rv.rating ? '#b833ff' : 'none'}
                          className={i <= rv.rating ? 'text-neon-purple' : 'text-white/20'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30">{new Date(rv.createdAt).toLocaleDateString()}</span>
                    {(user?._id === rv.user?._id || user?.role === 'admin') && (
                      <button onClick={() => deleteMut.mutate(rv._id)}
                        className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{rv.comment}</p>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
