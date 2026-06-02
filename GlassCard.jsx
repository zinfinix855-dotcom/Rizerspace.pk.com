import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass rounded-2xl ${hover ? 'glass-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
