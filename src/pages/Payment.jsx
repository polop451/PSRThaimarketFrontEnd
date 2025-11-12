import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { CreditCard, Download, CheckCircle, Clock, AlertCircle, Copy, Check, Upload, Landmark } from 'lucide-react'
import axios from 'axios'

const Payment = () => {
  const { negotiation_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [slipUrl, setSlipUrl] = useState('')

  useEffect(() => {
    fetchOrCreatePayment()
  }, [negotiation_id])

  const fetchOrCreatePayment = async () => {
    try {
      // Try to get existing payment
      const response = await axios.get(`/api/payments/negotiation/${negotiation_id}`)
      console.log('Payment data:', response.data)
      console.log('Payment status:', response.data.status)
      console.log('Admin verified:', response.data.admin_verified)
      setPayment(response.data)
    } catch (error) {
      if (error.response?.status === 404) {
        // Payment doesn't exist, create it
        try {
          const createResponse = await axios.post('/api/payments/create', {
            negotiation_id: parseInt(negotiation_id)
          })
          setPayment(createResponse.data)
        } catch (createError) {
          console.error('Failed to create payment:', createError)
          alert('เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน')
          navigate('/negotiations')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = payment.qr_code_data
    link.download = `payment-${payment.reference_id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyReference = () => {
    navigator.clipboard.writeText(payment.reference_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkAsPaid = async () => {
    if (!slipUrl.trim()) {
      alert('กรุณาใส่ลิงก์รูปภาพสลิปการโอนเงิน')
      return
    }

    try {
      await axios.put(`/api/payments/${payment.id}/paid`, {
        payment_slip_url: slipUrl
      })
      alert('แจ้งชำระเงินเรียบร้อย รอผู้ดูแลระบบตรวจสอบ')
      fetchOrCreatePayment()
    } catch (error) {
      console.error('Mark as paid error:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleConfirmReceived = async () => {
    if (window.confirm('ยืนยันว่าคุณได้รับสินค้าเรียบร้อยแล้ว?')) {
      try {
        await axios.put(`/api/payments/${payment.id}/received`)
        alert('✅ ยืนยันรับสินค้าเรียบร้อย\n\nระบบจะดำเนินการโอนเงินให้ผู้ขายต่อไป')
        fetchOrCreatePayment()
      } catch (error) {
        console.error('Confirm received error:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleConfirmPayment = async () => {
    try {
      await axios.put(`/api/payments/${payment.id}/confirm`)
      alert('ยืนยันรับเงินเรียบร้อย')
      fetchOrCreatePayment()
    } catch (error) {
      console.error('Confirm payment error:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const getStatusBadge = (status, adminVerified) => {
    if (status === 'completed') {
      return {
        text: 'เสร็จสมบูรณ์',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    }
    if (status === 'received') {
      return {
        text: 'ได้รับสินค้าแล้ว',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    }
    if (status === 'delivering') {
      return {
        text: 'กำลังจัดส่ง',
        color: 'bg-purple-100 text-purple-800',
        icon: Clock
      }
    }
    if (status === 'paid' && adminVerified) {
      return {
        text: 'Admin ตรวจสอบแล้ว',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    }
    if (status === 'paid') {
      return {
        text: 'รอ Admin ตรวจสอบ',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock
      }
    }
    
    const badges = {
      pending: { text: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { text: 'ยกเลิก', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    const badge = badges[status] || badges.pending
    return badge
  }

  const renderStatus = () => {
    const badge = getStatusBadge(payment.status, payment.admin_verified)
    const Icon = badge.icon
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.color} flex items-center space-x-2`}>
        <Icon className="h-4 w-4" />
        <span>{badge.text}</span>
      </span>
    )
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

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลการชำระเงิน</h2>
            <button onClick={() => navigate('/negotiations')} className="btn-primary mt-4">
              กลับไปหน้าการต่อรอง
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <CreditCard className="h-8 w-8 mr-3 text-primary-600" />
                ชำระเงิน
              </h1>
              <p className="text-gray-600 mt-2">สแกน QR Code เพื่อชำระเงิน</p>
            </div>
            {renderStatus()}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">QR Code ชำระเงิน</h2>
              <div className="bg-white border-4 border-primary-600 rounded-xl p-6 mb-4">
                <img 
                  src={payment.qr_code_data} 
                  alt="Payment QR Code" 
                  className="w-full max-w-sm mx-auto"
                />
              </div>
              <button
                onClick={handleDownloadQR}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>ดาวน์โหลด QR Code</span>
              </button>
            </div>

            {/* Payment Details Section */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-4">รายละเอียดการชำระเงิน</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 mb-1 font-semibold flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      ราคาที่ตกลงกัน
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      ฿ {Number(payment.amount).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">ค่านายหน้า (0.1%)</p>
                    <p className="text-xl font-bold text-blue-800">
                      ฿ {Number(payment.commission).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-primary-50 border-2 border-primary-600 rounded-lg">
                    <p className="text-sm text-primary-600 mb-1 font-semibold">ยอดชำระทั้งหมด</p>
                    <p className="text-3xl font-bold text-primary-600">
                      ฿ {Number(payment.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลการโอน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">เลขบัญชี</span>
                    <span className="font-bold text-gray-800">{payment.account_number}</span>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">เลขอ้างอิง</span>
                      <button
                        onClick={handleCopyReference}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="text-sm">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="text-sm">คัดลอก</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono font-bold text-gray-800 text-lg">
                      {payment.reference_id}
                    </p>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">วันที่โอน</span>
                    <span className="font-bold text-gray-800">
                      {new Date(payment.payment_date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {user?.role === 'buyer' && payment.status === 'pending' && (
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-3">อัพโหลดสลิปการโอนเงิน</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={slipUrl}
                        onChange={(e) => setSlipUrl(e.target.value)}
                        placeholder="ใส่ลิงก์รูปภาพสลิป (เช่น จาก Google Drive, Imgur)"
                        className="input-field pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">* อัพโหลดรูปสลิปไปที่ Google Drive หรือ Imgur แล้วนำลิงก์มาใส่ที่นี่</p>
                    <button
                      onClick={handleMarkAsPaid}
                      className="w-full btn-primary py-3 text-lg"
                    >
                      แจ้งชำระเงินแล้ว
                    </button>
                  </div>
                </div>
              )}

              {payment.status === 'paid' && !payment.admin_verified && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Clock className="h-6 w-6" />
                    <span className="font-semibold">รอผู้ดูแลระบบตรวจสอบการชำระเงิน</span>
                  </div>
                  {payment.payment_slip_url && (
                    <div className="mt-3">
                      <p className="text-sm text-blue-600 mb-2">สลิปการโอนเงิน:</p>
                      <a 
                        href={payment.payment_slip_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
                      >
                        {payment.payment_slip_url}
                      </a>
                    </div>
                  )}
                </div>
              )}



              {payment.status === 'delivering' && user?.role === 'buyer' && (
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-purple-700 mb-2">
                      <Clock className="h-6 w-6" />
                      <span className="font-semibold text-lg">📦 กำลังจัดส่งสินค้า</span>
                    </div>
                    <p className="text-sm text-purple-600">
                      ผู้ขายกำลังจัดส่งสินค้าถึงคุณ
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmReceived}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-lg flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>ยืนยันว่าได้รับสินค้าแล้ว</span>
                  </button>
                </div>
              )}

              {payment.status === 'delivering' && user?.role !== 'buyer' && (
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-700 mb-2">
                    <Clock className="h-6 w-6" />
                    <span className="font-semibold text-lg">📦 กำลังจัดส่งสินค้า</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    รอผู้ซื้อยืนยันการรับสินค้า
                  </p>
                </div>
              )}

              {payment.status === 'received' && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 mb-2">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold text-lg">✅ ผู้ซื้อได้รับสินค้าแล้ว</span>
                  </div>
                  <p className="text-sm text-green-600">
                    รอผู้ดูแลระบบปิดการขายและโอนเงินให้ผู้ขาย
                  </p>
                </div>
              )}

              {payment.status === 'completed' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold">🎉 ธุรกรรมเสร็จสมบูรณ์</span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    {user?.role === 'seller' ? 'คุณได้รับเงินเรียบร้อยแล้ว' : 'ขอบคุณที่ใช้บริการ'}
                  </p>
                </div>
              )}

              {payment.status === 'confirmed' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold">การชำระเงินสำเร็จ</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 card">
            <h3 className="font-bold text-gray-800 mb-4">ขั้นตอนการชำระเงิน</h3>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
                <div>
                  <p className="font-semibold text-gray-800">เปิดแอปพลิเคชันธนาคาร</p>
                  <p className="text-gray-600 text-sm">เลือกเมนู QR Payment หรือ PromptPay</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</span>
                <div>
                  <p className="font-semibold text-gray-800">สแกน QR Code</p>
                  <p className="text-gray-600 text-sm">สแกน QR Code ด้านบน ยอดเงินจะถูกกรอกอัตโนมัติ</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</span>
                <div>
                  <p className="font-semibold text-gray-800">ใส่เลขอ้างอิง</p>
                  <p className="text-gray-600 text-sm">คัดลอกเลขอ้างอิงด้านบนไปใส่ในช่องหมายเหตุ</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</span>
                <div>
                  <p className="font-semibold text-gray-800">ยืนยันการโอน</p>
                  <p className="text-gray-600 text-sm">ตรวจสอบยอดเงินและกดยืนยัน</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">5</span>
                <div>
                  <p className="font-semibold text-gray-800">แจ้งชำระเงิน</p>
                  <p className="text-gray-600 text-sm">กลับมากดปุ่ม "แจ้งชำระเงินแล้ว"</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
