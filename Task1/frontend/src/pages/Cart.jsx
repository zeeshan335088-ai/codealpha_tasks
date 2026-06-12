
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Cart() {
  const [cart, setCart] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      setCart(data)
    } catch (err) {
      console.error(err)
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    try {
      const res = await fetch(`/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })
      const data = await res.json()
      setCart(data)
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    } catch (err) {
      console.error(err)
    }
  }

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`/api/cart/remove/${itemId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      setCart(data)
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    } catch (err) {
      console.error(err)
    }
  }

  const getTotal = () => {
    if (!cart) return 0
    return cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  if (!cart) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link to="/" className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6">
                <img src={item.product.image} alt={item.product.name} className="w-32 h-32 object-cover rounded-lg" />
                <div className="flex-1">
                  <Link to={`/product/${item.product._id}`} className="text-xl font-bold text-gray-800 hover:text-blue-600">
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600">${item.product.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-sky-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-sky-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/"
              className="w-full block text-center text-blue-600 mt-4 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
