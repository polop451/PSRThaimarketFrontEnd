import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { CheckCircle, Package, Landmark } from 'lucide-react'
import axios from 'axios'

const AdminCompleteSales = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [companySales, setCompanySales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPayments()
      fetchCompanySales()
    }
  }, [user])

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/admin/received')
      setPayments(response.data)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

  const fetchCompanySales = async () => {
    try {
      const response = await axios.get('/api/admin/company-sales/approved')
      setCompanySales(response.data)
    } catch (error) {
      console.error('Failed to fetch company sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (paymentId) => {
    if (window.confirm('ยืนยันการปิดการขายและโอนเงินให้ผู้ขาย?')) {
      try {
        await axios.put(`/api/payments/${paymentId}/complete`)
        alert('✅ ปิดการขายเรียบร้อย\n\nโปรดโอนเงินให้ผู้ขายตามข้อมูลที่แสดง')
        fetchPayments()
      } catch (error) {
        console.error('Failed to complete sale:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleCompleteCompanySale = async (saleId) => {
    if (window.confirm('ยืนยันการปิดการขายและโอนเงินให้ผู้ขาย?')) {
      try {
        await axios.put(`/api/admin/company-sales/${saleId}/complete-payment`)
        alert('✅ ปิดการขายเรียบร้อย\n\nโปรดโอนเงินให้ผู้ขายตามข้อมูลที่แสดง')
        fetchCompanySales()
      } catch (error) {
        console.error('Failed to complete company sale:', error)
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
            <Package className="h-8 w-8 mr-3 text-primary-600" />
            ปิดการขายและโอนเงินให้ผู้ขาย
          </h1>
          <p className="text-gray-600 mt-2">ผู้ซื้อยืนยันรับสินค้าแล้ว และบริษัทตกลงรับซื้อแล้ว รอโอนเงินให้ผู้ขาย</p>
        </div>

        {/* Regular Buyer-Seller Payments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💼 การขายผ่านผู้ซื้อ (Buyer-Seller)</h2>
          <div className="space-y-4">
            {payments.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="h-6 w-6 text-primary-600" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{payment.product_name}</h3>
                      <p className="text-sm text-gray-500">
                        ผู้ซื้อ: {payment.buyer_name} | ผู้ขาย: {payment.seller_name}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>ได้รับสินค้าแล้ว</span>
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาสินค้า</p>
                  <p className="text-lg font-bold text-gray-800">
                    ฿ {Number(payment.amount).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">ค่านายหน้า (0.1%)</p>
                  <p className="text-lg font-bold text-blue-800">
                    ฿ {Number(payment.commission).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-600 mb-1">ผู้ซื้อชำระแล้ว</p>
                  <p className="text-lg font-bold text-primary-600">
                    ฿ {Number(payment.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Seller Bank Info */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Landmark className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-gray-800">ข้อมูลบัญชีผู้ขาย (โอนเงินที่นี่)</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-600">ชื่อธนาคาร:</span>
                    <span className="font-bold text-gray-800">{payment.seller_bank_name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-600">เลขบัญชี:</span>
                    <span className="font-mono font-bold text-gray-800">{payment.seller_bank_account || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-100 rounded-lg">
                    <span className="text-gray-600 font-semibold">💰 ยอดที่ต้องโอนให้ผู้ขาย:</span>
                    <span className="text-2xl font-bold text-green-700">
                      ฿ {Number(payment.seller_amount || payment.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  ผู้ซื้อยืนยันรับสินค้าเมื่อ: {new Date(payment.buyer_received_at).toLocaleString('th-TH')}
                </div>
                <button
                  onClick={() => handleComplete(payment.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>ปิดการขาย (โอนเงินแล้ว)</span>
                </button>
              </div>
            </div>
            ))}

            {payments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่มีรายการรอปิดการขาย</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Sales */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Package className="h-6 w-6 mr-2 text-primary-600" />
            🏢 การขายกับบริษัท (Company Purchase)
          </h2>
          <div className="space-y-4">
            {companySales.map((sale) => (
              <div key={sale.id} className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{sale.product_name}</h3>
                        <p className="text-sm text-gray-600">
                          ผู้ขาย: {sale.seller_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>บริษัทอนุมัติแล้ว</span>
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ปริมาณ</p>
                    <p className="text-lg font-bold text-gray-800">
                      {Number(sale.quantity).toLocaleString()} {sale.unit}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาต่อหน่วย</p>
                    <p className="text-lg font-bold text-blue-600">
                      ฿ {Number(sale.price_per_unit).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">มูลค่ารวม</p>
                    <p className="text-lg font-bold text-green-600">
                      ฿ {Number(sale.total_price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {sale.admin_note && (
                  <div className="p-3 bg-blue-100 border-l-4 border-blue-500 rounded mb-4">
                    <p className="text-sm font-semibold text-blue-800 mb-1">หมายเหตุ:</p>
                    <p className="text-sm text-blue-700">{sale.admin_note}</p>
                  </div>
                )}

                {/* Seller Bank Info */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Landmark className="h-5 w-5 text-green-600" />
                    <h4 className="font-bold text-gray-800">ข้อมูลบัญชีผู้ขาย (โอนเงินที่นี่)</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">ชื่อธนาคาร:</span>
                      <span className="font-bold text-gray-800">{sale.seller_bank_name || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">เลขบัญชี:</span>
                      <span className="font-mono font-bold text-gray-800">{sale.seller_bank_account || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-100 rounded-lg">
                      <span className="text-gray-600 font-semibold">💰 ยอดที่ต้องโอนให้ผู้ขาย:</span>
                      <span className="text-2xl font-bold text-green-700">
                        ฿ {Number(sale.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                  <div className="text-sm text-gray-600">
                    บริษัทอนุมัติเมื่อ: {new Date(sale.updated_at).toLocaleString('th-TH')}
                  </div>
                  <button
                    onClick={() => handleCompleteCompanySale(sale.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>ปิดการขาย (โอนเงินแล้ว)</span>
                  </button>
                </div>
              </div>
            ))}

            {companySales.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่มีรายการขายกับบริษัทที่รอปิดการขาย</p>
              </div>
            )}
          </div>
        </div>

        {payments.length === 0 && companySales.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">ไม่มีรายการรอปิดการขายทั้งหมด</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCompleteSales
