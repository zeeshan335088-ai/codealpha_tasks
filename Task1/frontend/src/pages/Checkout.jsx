
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Checkout() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    address: ''
  })
  const [order, setOrder] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      setOrder(data)
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    } catch (err) {
      console.error(err)
    }
  }

  if (order) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl text-green-500 mb-6">✓</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">Thank you for your order, {order.customerName}!</p>
        <p className="text-gray-700 mb-8">Order ID: {order._id}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Shipping Address</label>
          <textarea
            required
            rows="4"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          ></textarea>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="flex-1 bg-sky-600 text-white py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  )
}

export default Checkout
