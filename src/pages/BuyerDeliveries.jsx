import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Package, CheckCircle, Clock, Truck } from 'lucide-react'
import axios from 'axios'

const BuyerDeliveries = () => {
  const { user } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'buyer') {
      fetchDeliveries()
    }
  }, [user])

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get('/api/payments/my-payments')
      // กรองเฉพาะรายการที่อยู่ในสถานะ delivering
      const deliveringItems = response.data.filter(payment => payment.status === 'delivering')
      setDeliveries(deliveringItems)
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReceived = async (paymentId, productName) => {
    if (window.confirm(`ยืนยันว่าคุณได้รับสินค้า "${productName}" เรียบร้อยแล้ว?\n\nหลังจากยืนยัน ระบบจะดำเนินการโอนเงินให้ผู้ขายต่อไป`)) {
      try {
        await axios.put(`/api/payments/${paymentId}/received`)
        alert('✅ ยืนยันรับสินค้าเรียบร้อย\n\nขอบคุณที่ใช้บริการ\nระบบจะดำเนินการโอนเงินให้ผู้ขายต่อไป')
        fetchDeliveries()
      } catch (error) {
        console.error('Confirm received error:', error)
        alert('เกิดข้อผิดพลาด')
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Truck className="h-8 w-8 mr-3 text-primary-600" />
            รายการสินค้าที่กำลังจัดส่ง
          </h1>
          <p className="text-gray-600 mt-2">ยืนยันการรับสินค้าเมื่อได้รับแล้ว</p>
        </div>

        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Package className="h-6 w-6 text-primary-600" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{delivery.product_name}</h3>
                      <p className="text-sm text-gray-500">
                        ผู้ขาย: {delivery.seller_name}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Truck className="h-4 w-4" />
                  <span>กำลังจัดส่ง</span>
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาสินค้า</p>
                  <p className="text-lg font-bold text-gray-800">
                    ฿ {Number(delivery.amount).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">ค่านายหน้า (0.1%)</p>
                  <p className="text-lg font-bold text-blue-800">
                    ฿ {Number(delivery.commission).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-600 mb-1">ยอดที่ชำระ</p>
                  <p className="text-lg font-bold text-primary-600">
                    ฿ {Number(delivery.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Timeline */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">สถานะการดำเนินการ</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">ชำระเงินแล้ว</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(delivery.paid_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">Admin ตรวจสอบแล้ว</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(delivery.admin_verified_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-5 w-5 text-purple-500 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-purple-700 font-medium">รอการรับสินค้า</p>
                      <p className="text-gray-500 text-xs">
                        กรุณายืนยันเมื่อได้รับสินค้าเรียบร้อยแล้ว
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start space-x-2">
                  <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      📦 สินค้ากำลังอยู่ระหว่างการจัดส่ง
                    </p>
                    <p className="text-xs text-blue-700">
                      เมื่อคุณได้รับสินค้าเรียบร้อยแล้ว กรุณากดปุ่ม "ยืนยันรับสินค้า" ด้านล่าง
                      เพื่อให้ระบบดำเนินการโอนเงินให้ผู้ขายต่อไป
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleConfirmReceived(delivery.id, delivery.product_name)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>ยืนยันรับสินค้าแล้ว</span>
                </button>
              </div>
            </div>
          ))}

          {deliveries.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่มีรายการสินค้าที่กำลังจัดส่ง</p>
              <p className="text-gray-400 text-sm">สินค้าที่ชำระเงินแล้วจะแสดงที่นี่</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyerDeliveries
