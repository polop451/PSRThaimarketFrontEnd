import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { CheckCircle, Eye, Clock, CreditCard } from 'lucide-react'
import axios from 'axios'

const AdminPayments = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPayments()
    }
  }, [user])

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/admin/all')
      setPayments(response.data)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (paymentId) => {
    if (window.confirm('ยืนยันการตรวจสอบการชำระเงินนี้?\n\nหลังจากยืนยัน สถานะจะเปลี่ยนเป็น "กำลังจัดส่ง"')) {
      try {
        await axios.put(`/api/payments/${paymentId}/verify`)
        alert('✅ ตรวจสอบการชำระเงินเรียบร้อย\n\nสถานะเปลี่ยนเป็น "กำลังจัดส่ง" แล้ว\nรอผู้ซื้อยืนยันการรับสินค้า')
        fetchPayments()
      } catch (error) {
        console.error('Failed to verify payment:', error)
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
            <CreditCard className="h-8 w-8 mr-3 text-primary-600" />
            ตรวจสอบการชำระเงิน
          </h1>
          <p className="text-gray-600 mt-2">รอการตรวจสอบจากผู้ดูแลระบบ</p>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="h-6 w-6 text-primary-600" />
                    <h3 className="font-bold text-gray-800 text-lg">
                      {payment.product_name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ผู้ซื้อ: </span>
                      <span className="font-semibold text-gray-800">{payment.buyer_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ผู้ขาย: </span>
                      <span className="font-semibold text-gray-800">{payment.seller_name}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>รอตรวจสอบ</span>
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาสินค้า</p>
                  <p className="text-lg font-bold text-gray-800">
                    ฿ {Number(payment.amount).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">ค่านายหน้า</p>
                  <p className="text-lg font-bold text-blue-800">
                    ฿ {Number(payment.commission).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-600 mb-1">ยอดที่ชำระ</p>
                  <p className="text-lg font-bold text-primary-600">
                    ฿ {Number(payment.total_amount).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">เลขอ้างอิง</p>
                  <p className="text-xs font-mono font-bold text-gray-800 break-all">
                    {payment.reference_id}
                  </p>
                </div>
              </div>

              {payment.payment_slip_url && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-semibold mb-2">สลิปการโอนเงิน:</p>
                  <div className="flex items-center justify-between">
                    <a 
                      href={payment.payment_slip_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline text-sm flex items-center space-x-1 break-all"
                    >
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span>ดูสลิป</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Seller Bank Info Preview */}
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700 font-semibold mb-3">
                  📋 ข้อมูลสำหรับการโอนเงินให้ผู้ขาย:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span className="text-gray-600">ธนาคารผู้ขาย:</span>
                    <span className="font-bold text-gray-800">{payment.seller_bank_name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded">
                    <span className="text-gray-600">เลขบัญชีผู้ขาย:</span>
                    <span className="font-mono font-bold text-gray-800">{payment.seller_bank_account || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-purple-100 rounded">
                    <span className="text-gray-600">ยอดที่ต้องโอนให้ผู้ขาย:</span>
                    <span className="text-lg font-bold text-purple-700">
                      ฿ {Number(payment.seller_amount || payment.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  * หลังอนุมัติ กรุณาดำเนินการโอนเงินให้ผู้ขายตามข้อมูลด้านบน
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  แจ้งชำระเมื่อ: {new Date(payment.paid_at).toLocaleString('th-TH')}
                </div>
                <button
                  onClick={() => handleVerify(payment.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>ยืนยันการชำระเงิน</span>
                </button>
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีรายการรอตรวจสอบ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPayments
