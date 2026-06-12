
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function ProductList() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/product/${product._id}`}>
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
            </Link>
            <div className="p-6">
              <span className="text-sm text-blue-600 font-semibold">{product.category}</span>
              <Link to={`/product/${product._id}`}>
                <h2 className="text-xl font-bold text-gray-800 mt-1 mb-2">{product.name}</h2>
              </Link>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-800">${product.price.toFixed(2)}</span>
                <Link to={`/product/${product._id}`} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
