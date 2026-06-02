import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { clearCart, selectCartTotal } from '../store/cartSlice'
import api from '../services/api'
import toast from '../utils/toast'

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash On Delivery (COD)', icon: '??' },
  { id: 'EasyPaisa', label: 'EasyPaisa', icon: '??' },
  { id: 'JazzCash', label: 'JazzCash', icon: '??' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: '??' },
  { id: 'Stripe', label: 'Credit / Debit Card', icon: '??' }
]

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(s => s.cart.items)
  const total = useSelector(selectCartTotal)
  const user = useSelector(s => s.auth.user)
  const { symbol, rates, code } = useSelector(s => s.currency)
  const rate = rates[code] || 1

  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('COD')
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(null)
  const [couponErr, setCouponErr] = useState('')

  const [profile, setProfile] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: ''
  })

  const [shippingForm, setShippingForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan'
  })

  const [billingForm, setBillingForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan'
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [orderNotes, setOrderNotes] = useState('')

  const fmt = (usd) => `${symbol}${(usd * rate).toFixed(2)}`
  const discountAmt = discount ? total * discount / 100 : 0
  const finalTotal = Math.max(0, total - discountAmt)

  const couponMut = useMutation({
    mutationFn: () => api.post('/coupons/verify', { code: coupon }),
    onSuccess: (res) => {
      setDiscount(res.data.data.discount)
      setCouponErr('')
      toast.success(`Coupon applied: ${res.data.data.discount}% off`)
    },
    onError: (error) => {
      const message = error?.response?.data?.error || 'Invalid coupon code'
      setCouponErr(message)
      setDiscount(null)
      toast.error(message)
    }
  })

  const orderMut = useMutation({
    mutationFn: () => api.post('/orders', {
      products: items.map(i => ({ product: i._id, quantity: i.qty })),
      customerInfo: profile,
      shippingAddress: shippingForm,
      billingAddress: sameAsShipping ? shippingForm : billingForm,
      sameAsShipping,
      orderNotes,
      paymentMethod: method,
      couponCode: discount ? coupon : undefined
    }),
    onSuccess: (res) => {
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate(`/orders/${res.data.data._id}`)
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to place order')
    }
  })

  const validateStepOne = () => {
    if (!profile.fullName || !profile.email || !profile.phone) {
      toast.error('Please complete customer information.')
      return false
    }
    if (!shippingForm.street || !shippingForm.city || !shippingForm.zip || !shippingForm.country) {
      toast.error('Please complete shipping address details.')
      return false
    }
    return true
  }

  const validateStepTwo = () => {
    if (!sameAsShipping) {
      if (!billingForm.street || !billingForm.city || !billingForm.zip || !billingForm.country) {
        toast.error('Please complete billing address details.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStepOne()) return
    if (step === 2 && !validateStepTwo()) return
    if (step < 4) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (step < 4) {
      handleNext()
      return
    }
    orderMut.mutate()
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-neon-red/80 mb-2">Premium checkout</p>
          <h1 className="font-syne font-black text-4xl text-white">Luxury Checkout Flow</h1>
          <p className="max-w-2xl mt-3 text-white/40">Complete secure billing, shipping, and payment in a refined multi-step checkout designed for high-value collectibles.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <div className="grid grid-cols-4 gap-3 mb-8">
              {['Customer','Billing','Review','Payment'].map((title, index) => (
                <div key={title} className={`rounded-3xl border p-4 text-center ${step === index + 1 ? 'border-secondary bg-secondary/10' : 'border-white/10 bg-dark-800/80'}`}>
                  <span className="block text-[11px] text-white/40 uppercase tracking-[0.3em] mb-2">Step {index + 1}</span>
                  <p className={`text-sm font-bold ${step === index + 1 ? 'text-white' : 'text-white/50'}`}>{title}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="glass rounded-3xl p-6 border border-white/8">
                  <h2 className="font-syne font-bold text-xl text-white mb-5">Customer & Shipping Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Full Name</label>
                      <input value={profile.fullName} onChange={e => setProfile(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" className="input-neon" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Email</label>
                      <input type="email" value={profile.email} onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))} placeholder="Email Address" className="input-neon" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Phone</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone Number" className="input-neon" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Street Address</label>
                      <input value={shippingForm.street} onChange={e => setShippingForm(prev => ({ ...prev, street: e.target.value }))} placeholder="Street Address" className="input-neon" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">City</label>
                        <input value={shippingForm.city} onChange={e => setShippingForm(prev => ({ ...prev, city: e.target.value }))} placeholder="City" className="input-neon" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">State / Province</label>
                        <input value={shippingForm.state} onChange={e => setShippingForm(prev => ({ ...prev, state: e.target.value }))} placeholder="State" className="input-neon" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Zip</label>
                        <input value={shippingForm.zip} onChange={e => setShippingForm(prev => ({ ...prev, zip: e.target.value }))} placeholder="Zip" className="input-neon" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Country</label>
                        <input value={shippingForm.country} onChange={e => setShippingForm(prev => ({ ...prev, country: e.target.value }))} placeholder="Country" className="input-neon" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="glass rounded-3xl p-6 border border-white/8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-syne font-bold text-xl text-white">Billing Address</h2>
                      <p className="text-white/40 text-sm">Keep billing matched to shipping or enter a separate payment address.</p>
                    </div>
                    <button type="button" className="btn-secondary text-xs !px-4" onClick={() => setSameAsShipping(!sameAsShipping)}>
                      {sameAsShipping ? 'Enter separate billing' : 'Use shipping address'}
                    </button>
                  </div>

                  {sameAsShipping ? (
                    <div className="rounded-3xl border border-white/10 bg-dark-800/80 p-5 text-sm text-white/50">
                      Billing information will be copied from shipping details.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Billing Street</label>
                        <input value={billingForm.street} onChange={e => setBillingForm(prev => ({ ...prev, street: e.target.value }))} placeholder="Street Address" className="input-neon" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">City</label>
                          <input value={billingForm.city} onChange={e => setBillingForm(prev => ({ ...prev, city: e.target.value }))} placeholder="City" className="input-neon" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">State / Province</label>
                          <input value={billingForm.state} onChange={e => setBillingForm(prev => ({ ...prev, state: e.target.value }))} placeholder="State" className="input-neon" />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Zip</label>
                          <input value={billingForm.zip} onChange={e => setBillingForm(prev => ({ ...prev, zip: e.target.value }))} placeholder="Zip" className="input-neon" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Country</label>
                          <input value={billingForm.country} onChange={e => setBillingForm(prev => ({ ...prev, country: e.target.value }))} placeholder="Country" className="input-neon" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="glass rounded-3xl p-6 border border-white/8">
                  <h2 className="font-syne font-bold text-xl text-white mb-4">Order Notes & Review</h2>
                  <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Add collector notes or shipping preferences." rows="5" className="input-neon w-full resize-none" />
                  <div className="mt-6 rounded-3xl border border-white/10 bg-dark-800/80 p-5 text-sm text-white/60">
                    <div className="flex justify-between mb-3"><span>Products</span><span>{items.length} items</span></div>
                    <div className="flex justify-between mb-3"><span>Shipping</span><span>FREE</span></div>
                    <div className="flex justify-between mb-3"><span>Coupon</span><span>{discount ? `-${discount}%` : 'None'}</span></div>
                    <div className="flex justify-between text-white font-bold"><span>Estimated Total</span><span>{fmt(finalTotal)}</span></div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="glass rounded-3xl p-6 border border-white/8">
                  <h2 className="font-syne font-bold text-xl text-white mb-4">Payment Method</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PAYMENT_METHODS.map(methodOption => (
                      <button key={methodOption.id} type="button" onClick={() => setMethod(methodOption.id)}
                        className={`rounded-3xl border p-4 text-left transition-all duration-200 ${method === methodOption.id ? 'border-secondary bg-secondary/10' : 'border-white/10 bg-dark-800/80 hover:border-white/20'}`}>
                        <div className="text-2xl mb-3">{methodOption.icon}</div>
                        <div className="text-sm font-bold text-white">{methodOption.label}</div>
                      </button>
                    ))}
                  </div>

                  {method === 'Stripe' && (
                    <div className="mt-5 grid gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Card Number</label>
                        <input placeholder="4242 4242 4242 4242" className="input-neon w-full" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">Expiry</label>
                          <input placeholder="MM / YY" className="input-neon w-full" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2 block">CVC</label>
                          <input placeholder="123" className="input-neon w-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  {method === 'Bank Transfer' && (
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                      <p className="font-bold text-white mb-2">Bank Transfer Instructions</p>
                      <p>Transfer payment to the RizerSpace bank account and email proof after placing your order.</p>
                      <p className="mt-3 font-mono text-white">IBAN: PK85 RZR 0000 1337 9876 5432 1</p>
                    </div>
                  )}

                  {(method === 'EasyPaisa' || method === 'JazzCash') && (
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                      <p className="font-bold text-white mb-2">Mobile Wallet Instructions</p>
                      <p>Send payment to +92 300 8881337 and include your order reference in the transfer details.</p>
                    </div>
                  )}

                  {method === 'COD' && (
                    <div className="mt-5 rounded-3xl border border-secondary/20 bg-white/5 p-4 text-sm text-white/60">
                      <p className="font-bold text-white mb-2">Cash On Delivery</p>
                      <p>COD orders are confirmed immediately and proceed to fulfillment.</p>
                    </div>
                  )}

                  <div className="glass rounded-3xl border border-white/10 bg-dark-900/80 p-5 mt-6">
                    <h3 className="font-bold text-white mb-3">Coupon Code</h3>
                    <div className="flex gap-3">
                      <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon" className="input-neon flex-1" />
                      <button type="button" onClick={() => couponMut.mutate()} className="btn-secondary !px-5">Apply</button>
                    </div>
                    {couponErr && <p className="text-red-400 text-xs mt-3">{couponErr}</p>}
                    {discount && <p className="text-green-400 text-xs mt-3">{discount}% discount applied</p>}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                <button type="button" onClick={handlePrev} disabled={step === 1}
                  className="btn-secondary flex-1 sm:flex-none w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed">
                  Back
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {step < 4 ? 'Continue to next step' : `Place order � ${fmt(finalTotal)}`}
                </button>
              </div>
            </form>
          </section>

          <aside className="lg:col-span-4">
            <div className="glass rounded-3xl p-6 border border-white/8 sticky top-28">
              <h3 className="font-syne font-bold text-xl text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(i => (
                  <div key={i._id} className="flex items-center justify-between text-sm text-white/60">
                    <span className="truncate mr-2">{i.title} �{i.qty}</span>
                    <span>{fmt((i.discountedPrice || i.price) * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="neon-divider mb-4" />
              <div className="space-y-2 text-sm text-white/60 mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{fmt(total)}</span></div>
                {discount && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{fmt(discountAmt)}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>FREE</span></div>
              </div>
              <div className="flex justify-between items-center text-white font-black text-lg">
                <span>Total</span>
                <span>{fmt(finalTotal)}</span>
              </div>
              {orderMut.isError && <p className="text-red-400 text-xs mt-3">{orderMut.error?.response?.data?.error || 'Order placement failed'}</p>}
              <p className="text-xs text-white/30 mt-4">Secure checkout with local payment support and premium delivery options.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
