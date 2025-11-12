import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import axios from 'axios'

const Products = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category: 'rice',
    description: '',
    quantity: '',
    unit: 'ton',
    price: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, formData)
      } else {
        await axios.post('/api/products', formData)
      }
      fetchProducts()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบสินค้านี้หรือไม่?')) {
      try {
        await axios.delete(`/api/products/${id}`)
        fetchProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price
    })
    setEditingId(product.id)
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'rice',
      description: '',
      quantity: '',
      unit: 'ton',
      price: ''
    })
    setEditingId(null)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">สินค้า</h1>
          {user?.role === 'seller' && (
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>เพิ่มสินค้า</span>
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="ค้นหาสินค้า..."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                {user?.id === product.seller_id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ปริมาณ:</span>
                  <span className="font-semibold">{product.quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ราคา:</span>
                  <span className="font-semibold text-primary-600">฿ {Number(product.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ผู้ขาย:</span>
                  <span className="font-semibold">{product.seller_name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = `/products/${product.id}`}
                  className="w-full btn-secondary"
                >
                  ดูรายละเอียด
                </button>
                {user?.role === 'buyer' && (
                  <button 
                    onClick={() => window.location.href = `/products/${product.id}`}
                    className="w-full btn-primary"
                  >
                    ต่อรองราคา
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบสินค้า</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อสินค้า
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภท
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="rice">ข้าว</option>
                    <option value="wheat">ข้าวสาลี</option>
                    <option value="corn">ข้าวโพด</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ปริมาณ
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หน่วย
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input-field"
                  >
                    <option value="ton">ตัน</option>
                    <option value="kg">กิโลกรัม</option>
                    <option value="bag">กระสอบ</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคา (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
