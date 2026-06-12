
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function ProductDetail() {
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) {
        navigate('/')
        return
      }
      const data = await res.json()
      setProduct(data)
    } catch (err) {
      console.error(err)
      navigate('/')
    }
  }

  const addToCart = async () => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: id, quantity })
      })
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      navigate('/cart')
    } catch (err) {
      console.error(err)
    }
  }

  if (!product) return <div>Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <button onClick={() => navigate('/')} className="text-blue-600 hover:underline mb-6">← Back to Products</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
        <div>
          <span className="text-sm text-blue-600 font-semibold">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-1 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-4xl font-bold text-gray-800 mb-8">${product.price.toFixed(2)}</p>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-gray-700 font-medium">Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={addToCart}
            className="w-full bg-sky-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-sky-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
