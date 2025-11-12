import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Package, User, Calendar, TrendingDown, ArrowLeft, MessageSquare, ShoppingCart, Truck, MapPin } from 'lucide-react'
import axios from 'axios'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNegotiateModal, setShowNegotiateModal] = useState(false)
  const [proposedPrice, setProposedPrice] = useState('')
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [actionType, setActionType] = useState('') // 'negotiate' or 'buynow'

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNegotiate = async (e) => {
    e.preventDefault()
    
    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      alert('กรุณาระบุราคาที่ต้องการเสนอ')
      return
    }

    if (parseFloat(proposedPrice) >= parseFloat(product.price)) {
      alert('ราคาที่เสนอต้องต่ำกว่าราคาปัจจุบัน')
      return
    }

    // Show delivery modal first
    setShowNegotiateModal(false)
    setActionType('negotiate')
    setShowDeliveryModal(true)
  }

  const handleBuyNow = async () => {
    if (window.confirm(`ยืนยันการสั่งซื้อสินค้านี้ในราคา ฿${Number(product.price).toLocaleString()} ?`)) {
      // Show delivery modal
      setActionType('buynow')
      setShowDeliveryModal(true)
    }
  }

  const handleConfirmDelivery = async () => {
    if (!deliveryMethod) {
      alert('กรุณาเลือกวิธีการจัดส่ง')
      return
    }

    if (deliveryMethod === 'seller_delivery' && !buyerAddress.trim()) {
      alert('กรุณาระบุที่อยู่สำหรับจัดส่ง')
      return
    }

    try {
      let negotiationId

      if (actionType === 'negotiate') {
        // Create negotiation with proposed price
        const response = await axios.post('/api/negotiations', {
          product_id: product.id,
          proposed_price: parseFloat(proposedPrice)
        })
        negotiationId = response.data.id
      } else {
        // Buy now - create negotiation with original price and auto-accept
        const response = await axios.post('/api/negotiations', {
          product_id: product.id,
          proposed_price: parseFloat(product.price)
        })
        negotiationId = response.data.id
        await axios.put(`/api/negotiations/${negotiationId}/accept`)
      }

      // Set delivery method
      await axios.put(`/api/negotiations/${negotiationId}/delivery-method`, {
        delivery_method: deliveryMethod,
        buyer_address: buyerAddress
      })

      // If seller_delivery, need seller confirmation first
      if (deliveryMethod === 'seller_delivery') {
        if (actionType === 'negotiate') {
          alert('✅ ส่งข้อเสนอราคาเรียบร้อย!\n\n📦 รอผู้ขายยืนยันการจัดส่ง')
        } else {
          alert('✅ สั่งซื้อเรียบร้อย!\n\n📦 รอผู้ขายยืนยันการจัดส่ง')
        }
        navigate('/negotiations')
      } else {
        // Buyer pickup - can pay immediately
        if (actionType === 'negotiate') {
          alert('✅ ส่งข้อเสนอราคาเรียบร้อย!\n\n📍 เลือกมารับเองแล้ว รอผู้ขายตอบรับ')
          navigate('/negotiations')
        } else {
          alert('✅ สั่งซื้อเรียบร้อย!\n\n📍 มารับเองแล้ว กำลังไปยังหน้าชำระเงิน...')
          navigate(`/payment/${negotiationId}`)
        }
      }

      // Reset states
      setShowDeliveryModal(false)
      setDeliveryMethod('')
      setBuyerAddress('')
      setProposedPrice('')
    } catch (error) {
      console.error('Failed to process order:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบสินค้า</h2>
            <button onClick={() => navigate('/products')} className="btn-primary mt-4">
              กลับไปหน้าสินค้า
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>กลับไปหน้าสินค้า</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Image Section */}
          <div className="lg:col-span-1">
            <div className="card bg-gradient-to-br from-primary-100 to-primary-50">
              <div className="flex items-center justify-center h-64">
                <Package className="h-32 w-32 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">ราคา</p>
                    <p className="text-3xl font-bold text-primary-600">
                      ฿ {Number(product.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">ต่อ {product.unit}</p>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">รายละเอียดสินค้า</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Package className="h-5 w-5" />
                    <span className="text-sm">ปริมาณ</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    {product.quantity} {product.unit}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <User className="h-5 w-5" />
                    <span className="text-sm">ผู้ขาย</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{product.seller_name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">เพิ่มเมื่อ</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(product.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              {user?.role === 'buyer' && product.status === 'available' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">สนใจสินค้านี้?</h3>
                      <p className="text-gray-600 text-sm">คุณสามารถสั่งซื้อเลย หรือเสนอราคาที่ต้องการได้</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleBuyNow}
                      className="btn-primary py-4 text-lg flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span>สั่งซื้อเลย</span>
                    </button>
                    <button
                      onClick={() => setShowNegotiateModal(true)}
                      className="btn-secondary py-4 text-lg flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="h-6 w-6" />
                      <span>ต่อรองราคา</span>
                    </button>
                  </div>
                </div>
              )}

              {user?.role === 'seller' && user?.id === product.seller_id && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-center">
                      นี่คือสินค้าของคุณ คุณสามารถแก้ไขได้ในหน้า "สินค้า"
                    </p>
                  </div>
                </div>
              )}

              {product.status === 'sold' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-center font-semibold">
                      สินค้านี้ขายแล้ว
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Info */}
        <div className="mt-8 card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลเพิ่มเติม</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">เกี่ยวกับการต่อรองราคา</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <TrendingDown className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>เสนอราคาที่ต่ำกว่าราคาปัจจุบัน</span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>ผู้ขายจะพิจารณาและตอบกลับ</span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>สามารถต่อรองกลับไปกลับมาได้</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">ข้อกำหนด</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• ราคาที่แสดงเป็นราคาต่อหน่วย</li>
                <li>• การชำระเงินตามที่ตกลง</li>
                <li>• ติดต่อผู้ขายเพื่อรายละเอียดเพิ่มเติม</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiate Modal */}
      {showNegotiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ต่อรองราคา</h2>
            
            <div className="mb-6">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">ราคาปัจจุบัน</p>
                <p className="text-2xl font-bold text-gray-800">
                  ฿ {Number(product.price).toLocaleString()}
                </p>
              </div>

              <form onSubmit={handleNegotiate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคาที่คุณต้องการเสนอ (บาท)
                  </label>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="input-field pl-10"
                      placeholder={`ต่ำกว่า ${Number(product.price).toLocaleString()}`}
                      required
                      min="1"
                      max={product.price - 1}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * ราคาที่เสนอต้องต่ำกว่าราคาปัจจุบัน
                  </p>
                </div>

                {proposedPrice && parseFloat(proposedPrice) < parseFloat(product.price) && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-sm text-green-800">
                      คุณจะประหยัด: <span className="font-bold">
                        ฿ {(Number(product.price) - Number(proposedPrice)).toLocaleString()}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNegotiateModal(false)
                      setProposedPrice('')
                    }}
                    className="flex-1 btn-secondary"
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    ส่งข้อเสนอ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Method Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">เลือกวิธีการรับสินค้า</h2>
            
            <div className="space-y-4 mb-6">
              {/* Seller Delivery Option */}
              <div 
                onClick={() => setDeliveryMethod('seller_delivery')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryMethod === 'seller_delivery' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Truck className={`h-6 w-6 ${deliveryMethod === 'seller_delivery' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="font-bold text-gray-800">ผู้ขายจัดส่งให้</p>
                    <p className="text-sm text-gray-600">รอผู้ขายยืนยันการจัดส่งก่อนชำระเงิน</p>
                  </div>
                </div>
                {deliveryMethod === 'seller_delivery' && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ที่อยู่สำหรับจัดส่ง *
                    </label>
                    <textarea
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      placeholder="กรุณาระบุที่อยู่สำหรับจัดส่ง&#10;เช่น: 123 ถ.สุขุมวิท แขวงคลองเตย&#10;เขตคลองเตย กรุงเทพฯ 10110&#10;เบอร์โทร: 08-1234-5678"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="5"
                    />
                  </div>
                )}
              </div>

              {/* Buyer Pickup Option */}
              <div 
                onClick={() => setDeliveryMethod('buyer_pickup')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryMethod === 'buyer_pickup' 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className={`h-6 w-6 ${deliveryMethod === 'buyer_pickup' ? 'text-green-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="font-bold text-gray-800">ผู้ซื้อมารับเอง</p>
                    <p className="text-sm text-gray-600">สามารถชำระเงินได้ทันที</p>
                  </div>
                </div>
                {deliveryMethod === 'buyer_pickup' && (
                  <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
                    <div className="flex items-start space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">สถานที่รับสินค้า:</p>
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                          {product.seller_address || 'ไม่ระบุที่อยู่ กรุณาติดต่อผู้ขายโดยตรง'}
                        </p>
                      </div>
                    </div>
                    {product.seller_phone && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-green-200">
                        <User className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">ติดต่อ:</span> {product.seller_name}
                        </p>
                      </div>
                    )}
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        💡 กรุณาติดต่อผู้ขายเพื่อนัดหมายเวลารับสินค้า
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false)
                  setDeliveryMethod('')
                  setBuyerAddress('')
                  if (actionType === 'negotiate') {
                    setShowNegotiateModal(true)
                  }
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelivery}
                className="flex-1 btn-primary py-3"
                disabled={!deliveryMethod}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
