
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-sky-400">E-Commerce</h3>
            <p className="text-slate-400">Your one-stop shop for all your needs. Quality products, great prices, and fast delivery!</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/cart" className="text-slate-400 hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Email: info@ecommerce.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>Address: 123 Main St, City, Country</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-8 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
