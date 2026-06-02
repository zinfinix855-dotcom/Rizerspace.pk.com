import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Box, ShoppingCart, Tag, TrendingUp } from 'lucide-react'

export default function AdminNav() {
  const location = useLocation()
  const path = location.pathname

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Box },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/coupons', label: 'Coupons', icon: Tag },
    { to: '/admin/intelligence', label: 'Intelligence', icon: TrendingUp },
  ]


  return (
    <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-8">
      {links.map((link) => {
        const Icon = link.icon
        const active = path === link.to
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              active
                ? 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple font-black shadow-[0_0_15px_rgba(184,51,255,0.15)]'
                : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={14} />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
