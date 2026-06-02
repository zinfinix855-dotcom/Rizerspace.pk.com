import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Menu, X, Zap } from 'lucide-react'
import { logout } from '../store/authSlice'
import { selectCartCount } from '../store/cartSlice'
import { setCurrency, CURRENCY_LIST } from '../store/currencySlice'

export default function Navbar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user }   = useSelector(s => s.auth)
  const cartCount  = useSelector(selectCartCount)
  const { code }   = useSelector(s => s.currency)
  const wishCount  = useSelector(s => s.wishlist.items.length)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    setUserMenu(false)
  }

  const navLinks = [
    { to: '/',        label: 'Home' },
    { to: '/catalog', label: 'Catalog' },
  ]
  if (user) {
    navLinks.push({ to: '/dashboard', label: 'Cabinet' })
  }


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#b833ff,#1e90ff)'}}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-syne font-black text-xl tracking-tight">
              RIZER<span className="gradient-text">SPACE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium transition-colors duration-200 ${isActive(l.to) ? 'text-neon-purple glow-purple' : 'text-white/60 hover:text-white'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <select
              value={code}
              onChange={e => dispatch(setCurrency(e.target.value))}
              className="hidden sm:block text-xs font-bold bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/70 cursor-pointer focus:outline-none focus:border-neon-purple/50"
            >
              {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-white/60 hover:text-neon-purple transition-colors">
              <Heart size={20} />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{background:'#b833ff',fontSize:'9px'}}>
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-white/60 hover:text-neon-blue transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{background:'#1e90ff',fontSize:'9px'}}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10 hover:border-neon-purple/40 transition-all text-sm font-medium">
                  <User size={15} className="text-neon-purple" />
                  <span className="hidden sm:block text-white/80 max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                      className="absolute right-0 mt-2 w-48 glass rounded-xl border border-white/10 overflow-hidden shadow-xl">
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-neon-purple transition-colors">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors">
                        <LayoutDashboard size={15} /> My Cabinet
                      </Link>
                      {user.referralCode && (
                        <Link to={`/rizer/${user.referralCode}`} onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors">
                          <User size={15} /> Public Profile
                        </Link>
                      )}
                      <Link to="/orders" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors">
                        <ShoppingCart size={15} /> My Orders
                      </Link>


                      <div className="neon-divider" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !py-2 !px-4 !text-xs">Sign In</Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
            className="md:hidden glass border-t border-white/5 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium py-2 ${isActive(l.to) ? 'text-neon-purple' : 'text-white/60'}`}>
                  {l.label}
                </Link>
              ))}
              <select value={code} onChange={e => dispatch(setCurrency(e.target.value))}
                className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 w-full">
                {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
