
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from './ui/button'
import { User, LogOut } from 'lucide-react'

function Header() {
  const [cartCount, setCartCount] = useState(0)
  const { user, logout } = useAuth()

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart')
      const cart = await res.json()
      setCartCount(cart.items.reduce((sum, item) => sum + item.quantity, 0))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCartCount()
    window.addEventListener('cartUpdated', fetchCartCount)
    return () => window.removeEventListener('cartUpdated', fetchCartCount)
  }, [])

  return (
    <header className="bg-slate-900 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">E-Commerce</Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-slate-300 hover:text-sky-400 transition-colors">Products</Link>
          <Link to="/cart" className="text-slate-300 hover:text-sky-400 transition-colors relative">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-sky-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login">
                    <Button variant="outline" className="text-slate-900">
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
