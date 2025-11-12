import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Package, Truck, MapPin, Clock, CheckCircle, User, Phone } from 'lucide-react'
import axios from 'axios'

const SellerDeliveries = () => {
  const { user } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get('/api/payments/seller/deliveries')
      console.log('Seller deliveries:', response.data)
      setDeliveries(response.data)
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status, deliveryMethod) => {
    const badges = {
      delivering: {
        seller_delivery: { text: 'รอจัดส่ง', class: 'bg-orange-100 text-orange-800', icon: Truck },
        buyer_pickup: { text: 'รอผู้ซื้อมารับ', class: 'bg-blue-100 text-blue-800', icon: Package }
      },
      received: {
        seller_delivery: { text: 'ผู้ซื้อรับแล้ว', class: 'bg-green-100 text-green-800', icon: CheckCircle },
        buyer_pickup: { text: 'ผู้ซื้อรับแล้ว', class: 'bg-green-100 text-green-800', icon: CheckCircle }
      },
      completed: {
        seller_delivery: { text: 'เสร็จสิ้น', class: 'bg-gray-100 text-gray-800', icon: CheckCircle },
        buyer_pickup: { text: 'เสร็จสิ้น', class: 'bg-gray-100 text-gray-800', icon: CheckCircle }
      }
    }

    const badge = badges[status]?.[deliveryMethod] || { text: status, class: 'bg-gray-100 text-gray-800', icon: Package }
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    )
  }

  const getDeliveryTypeCard = (deliveryMethod) => {
    if (deliveryMethod === 'seller_delivery') {
      return (
        <div className="flex items-center space-x-2 text-orange-600">
          <Truck className="h-5 w-5" />
          <span className="font-semibold">ผู้ขายจัดส่งให้</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Package className="h-5 w-5" />
          <span className="font-semibold">ผู้ซื้อมารับเอง</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">รายการจัดส่ง</h1>
          <p className="text-gray-600 mt-2">สินค้าที่ต้องจัดส่งหรือรอผู้ซื้อมารับ</p>
        </div>

        {deliveries.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่มีรายการจัดส่ง</h3>
            <p className="text-gray-500">ยังไม่มีสินค้าที่ต้องจัดส่งหรือรอผู้ซื้อมารับในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {delivery.product_name}
                    </h3>
                    {getDeliveryTypeCard(delivery.delivery_method)}
                  </div>
                  <div>
                    {getStatusBadge(delivery.status, delivery.delivery_method)}
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    ข้อมูลผู้ซื้อ
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">ชื่อ:</span> {delivery.buyer_name}
                    </p>
                    {delivery.buyer_phone && (
                      <p className="text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium mr-2">เบอร์โทร:</span>
                        <a href={`tel:${delivery.buyer_phone}`} className="text-blue-600 hover:underline">
                          {delivery.buyer_phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address (if seller_delivery) */}
                {delivery.delivery_method === 'seller_delivery' && delivery.buyer_address && (
                  <div className="bg-orange-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                      ที่อยู่จัดส่ง
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">{delivery.buyer_address}</p>
                  </div>
                )}

                {/* Pickup Location (if buyer_pickup) */}
                {delivery.delivery_method === 'buyer_pickup' && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      สถานที่รับสินค้า
                    </h4>
                    <p className="text-gray-700">
                      {delivery.seller_address || 'กรุณาติดต่อผู้ซื้อเพื่อนัดหมายรับสินค้า'}
                    </p>
                  </div>
                )}

                {/* Price Info */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาสินค้า</p>
                    <p className="text-lg font-bold text-gray-800">
                      ฿ {Number(delivery.original_price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาที่ตกลงกัน</p>
                    <p className="text-lg font-bold text-green-600">
                      ฿ {Number(delivery.final_price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">รายได้ที่คุณได้รับ</p>
                    <p className="text-lg font-bold text-blue-600">
                      ฿ {Number(delivery.seller_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {delivery.status === 'delivering' && 'รอดำเนินการจัดส่ง'}
                      {delivery.status === 'received' && `ผู้ซื้อยืนยันรับสินค้าแล้ว: ${new Date(delivery.received_at).toLocaleDateString('th-TH')}`}
                      {delivery.status === 'completed' && `เสร็จสิ้น: ${new Date(delivery.completed_at).toLocaleDateString('th-TH')}`}
                    </span>
                  </div>
                </div>

                {/* Action Hints */}
                {delivery.status === 'delivering' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {delivery.delivery_method === 'seller_delivery' ? (
                        <span>💡 <strong>เตือน:</strong> กรุณาจัดส่งสินค้าไปยังที่อยู่ที่ระบุด้านบน ผู้ซื้อจะยืนยันรับสินค้าเมื่อได้รับแล้ว</span>
                      ) : (
                        <span>💡 <strong>เตือน:</strong> กรุณาติดต่อผู้ซื้อเพื่อนัดหมายรับสินค้า ผู้ซื้อจะยืนยันรับสินค้าหลังรับไปแล้ว</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDeliveries
