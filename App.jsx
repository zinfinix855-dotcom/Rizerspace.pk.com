import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { toastOptions } from './utils/toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'

// Lazy-loaded pages for code splitting
const Home           = lazy(() => import('./pages/Home'))
const Catalog        = lazy(() => import('./pages/Catalog'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Wishlist       = lazy(() => import('./pages/Wishlist'))
const Cart           = lazy(() => import('./pages/Cart'))
const Checkout       = lazy(() => import('./pages/Checkout'))
const OrderHistory   = lazy(() => import('./pages/OrderHistory'))
const OrderTracking  = lazy(() => import('./pages/OrderTracking'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const VerifyEmail    = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const CollectorDashboard = lazy(() => import('./pages/CollectorDashboard'))
const PublicProfile      = lazy(() => import('./pages/PublicProfile'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts  = lazy(() => import('./pages/admin/Products'))
const AdminOrders    = lazy(() => import('./pages/admin/Orders'))
const AdminCoupons   = lazy(() => import('./pages/admin/Coupons'))
const AdminIntelligence = lazy(() => import('./pages/admin/Intelligence'))


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-900">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-neon-purple border-r-neon-blue animate-spin"/>
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-neon-cyan animate-spin" style={{animationDirection:'reverse',animationDuration:'0.8s'}}/>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<Home />} />
          <Route path="/catalog"           element={<Catalog />} />
          <Route path="/product/:id"       element={<ProductDetails />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/verify-email"      element={<VerifyEmail />} />
          <Route path="/forgot-password"   element={<ForgotPassword />} />
          <Route path="/reset-password"    element={<ResetPassword />} />
          <Route path="/rizer/:username"   element={<PublicProfile />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"       element={<CollectorDashboard />} />
            <Route path="/wishlist"        element={<Wishlist />} />
            <Route path="/cart"            element={<Cart />} />
            <Route path="/checkout"        element={<Checkout />} />
            <Route path="/orders"          element={<OrderHistory />} />
            <Route path="/orders/:id"      element={<OrderTracking />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"           element={<AdminDashboard />} />
            <Route path="/admin/products"  element={<AdminProducts />} />
            <Route path="/admin/orders"    element={<AdminOrders />} />
            <Route path="/admin/coupons"   element={<AdminCoupons />} />
            <Route path="/admin/intelligence" element={<AdminIntelligence />} />

          </Route>
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  )
}
