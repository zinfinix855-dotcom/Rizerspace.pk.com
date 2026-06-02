import { Link } from 'react-router-dom'
import { Zap, Share2, MessageCircle, Play, Link2 } from 'lucide-react'

export default function Footer() {
  const cols = [
    { title: 'Shop', links: [['Catalog', '/catalog'], ['New Arrivals', '/catalog?sort=newest'], ['Featured', '/catalog?sort=rating'], ['Sale', '/catalog?sale=true']] },
    { title: 'Account', links: [['Login', '/login'], ['Register', '/register'], ['My Orders', '/orders'], ['Wishlist', '/wishlist']] },
    { title: 'Support', links: [['About Us', '#'], ['FAQ', '#'], ['Shipping Policy', '#'], ['Returns', '#']] },
  ]
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#b833ff,#1e90ff)'}}>
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-syne font-black text-xl">RIZER<span className="gradient-text">SPACE</span></span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              The premier destination for premium anime action figures and collectibles. Museum-grade quality delivered to your door.
            </p>
            <div className="flex gap-4 mt-6">
              {[Share2, MessageCircle, Play, Link2].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/40 hover:text-neon-purple hover:border-neon-purple/40 border border-white/10 transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h3 className="font-syne font-bold text-sm text-white/90 tracking-widest mb-5 uppercase">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/40 hover:text-neon-purple transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="neon-divider my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 RizerSpace. All rights reserved. Premium Anime Collectibles.</p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
              <a key={l} href="#" className="hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
