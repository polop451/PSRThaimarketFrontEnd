import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Building2, Package, CheckCircle, XCircle, Clock } from 'lucide-react'
import axios from 'axios'

const CompanySales = () => {
  const { user } = useAuth()
  const [companySales, setCompanySales] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [showSellModal, setShowSellModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchCompanySales()
    if (user?.role === 'seller') {
      fetchMyProducts()
    }
  }, [user])

  const fetchCompanySales = async () => {
    try {
      const response = await axios.get('/api/company-sales')
      // Filter out completed and rejected sales
      const activeSales = response.data.filter(sale => 
        sale.status === 'pending' || sale.status === 'approved' || sale.status === 'negotiating'
      )
      setCompanySales(activeSales)
    } catch (error) {
      console.error('Failed to fetch company sales:', error)
    }
  }

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get('/api/products/my-products')
      setMyProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch my products:', error)
    }
  }

  const handleSellToCompany = async (productId) => {
    try {
      await axios.post('/api/company-sales', { product_id: productId })
      setShowSellModal(false)
      setSelectedProduct(null)
      fetchCompanySales()
      alert('ส่งคำขอขายให้บริษัทเรียบร้อย รอการตรวจสอบจากผู้ดูแลระบบ')
    } catch (error) {
      console.error('Failed to create company sale:', error)
      alert('เกิดข้อผิดพลาดในการส่งคำขอ')
    }
  }

  const handleAcceptAdminOffer = async (saleId) => {
    if (window.confirm('ยืนยันการรับราคาที่บริษัทเสนอ?')) {
      try {
        await axios.put(`/api/company-sales/${saleId}/accept-admin-offer`)
        fetchCompanySales()
        alert('รับข้อเสนอราคาเรียบร้อย รอบริษัทโอนเงิน')
      } catch (error) {
        console.error('Failed to accept admin offer:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleCounterOffer = async (saleId, currentPrice) => {
    const priceStr = prompt(`ราคาที่บริษัทเสนอ: ฿${Number(currentPrice).toLocaleString()}/หน่วย\n\nคุณต้องการเสนอราคาใหม่ (ต่อหน่วย):`)
    if (priceStr) {
      const price_per_unit = parseFloat(priceStr)
      if (isNaN(price_per_unit) || price_per_unit <= 0) {
        alert('กรุณาระบุราคาที่ถูกต้อง')
        return
      }
      try {
        await axios.put(`/api/company-sales/${saleId}/counter-offer`, { price_per_unit })
        fetchCompanySales()
        alert('ส่งข้อเสนอราคาใหม่เรียบร้อย รอบริษัทตอบกลับ')
      } catch (error) {
        console.error('Failed to counter offer:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const getStatusBadge = (status, negotiationStatus) => {
    let badgeInfo
    
    if (status === 'negotiating') {
      if (negotiationStatus === 'admin_offered') {
        badgeInfo = {
          text: 'บริษัทเสนอราคา',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock
        }
      } else if (negotiationStatus === 'seller_countered') {
        badgeInfo = {
          text: 'คุณต่อรองกลับแล้ว',
          color: 'bg-orange-100 text-orange-800',
          icon: Clock
        }
      } else {
        badgeInfo = {
          text: 'กำลังต่อรอง',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock
        }
      }
    } else {
      const badges = {
        pending: { text: 'รอการตรวจสอบ', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        approved: { text: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        rejected: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800', icon: XCircle }
      }
      badgeInfo = badges[status] || badges.pending
    }
    
    const Icon = badgeInfo.icon
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeInfo.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{badgeInfo.text}</span>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Building2 className="h-8 w-8 mr-3 text-primary-600" />
              ขายกับบริษัท
            </h1>
            <p className="text-gray-600 mt-2">ขายสินค้าโดยตรงให้กับบริษัทของเรา</p>
          </div>
          {user?.role === 'seller' && (
            <button
              onClick={() => setShowSellModal(true)}
              className="btn-primary"
            >
              ขายสินค้าให้บริษัท
            </button>
          )}
        </div>

        {/* Company Information */}
        <div className="card mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-primary-600 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">บริษัท ธัญพืชไทย จำกัด</h2>
              <p className="text-gray-700 mb-4">
                เราเป็นผู้นำในการรับซื้อข้าวและธัญพืชคุณภาพสูง 
                พร้อมให้ราคายุติธรรมและการชำระเงินรวดเร็ว
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">เบอร์ติดต่อ</p>
                  <p className="font-semibold text-gray-800">02-123-4567</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">อีเมล</p>
                  <p className="font-semibold text-gray-800">contact@grain-thai.com</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">เวลาทำการ</p>
                  <p className="font-semibold text-gray-800">จ-ศ 8:00-17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">รายการขาย</h2>
          
          {companySales.map((sale) => (
            <div key={sale.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-primary-600" />
                  <div>
                    <h3 className="font-bold text-gray-800">{sale.product_name}</h3>
                    <p className="text-sm text-gray-500">ผู้ขาย: {sale.seller_name}</p>
                  </div>
                </div>
                {getStatusBadge(sale.status, sale.negotiation_status)}
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ปริมาณ</p>
                  <p className="font-semibold text-gray-800">
                    {sale.quantity} {sale.unit}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาต่อหน่วยเดิม</p>
                  <p className="font-semibold text-gray-600">
                    ฿ {Number(sale.price_per_unit).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">มูลค่ารวมเดิม</p>
                  <p className="font-semibold text-gray-600">
                    ฿ {Number(sale.total_price).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">วันที่ส่งคำขอ</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(sale.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>

              {/* Show admin's counter offer */}
              {sale.admin_counter_price_per_unit && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                  <p className="text-sm font-semibold text-blue-800 mb-2">🏢 ข้อเสนอราคาจากบริษัท:</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-blue-600">ราคาต่อหน่วย</p>
                      <p className="text-xl font-bold text-blue-700">฿ {Number(sale.admin_counter_price_per_unit).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">มูลค่ารวม</p>
                      <p className="text-xl font-bold text-blue-700">฿ {Number(sale.admin_counter_total_price).toLocaleString()}</p>
                    </div>
                  </div>
                  {sale.admin_note && (
                    <p className="text-sm text-blue-700">หมายเหตุ: {sale.admin_note}</p>
                  )}
                  
                  {/* Action buttons for admin offer */}
                  {sale.negotiation_status === 'admin_offered' && user?.role === 'seller' && (
                    <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-blue-200">
                      <button
                        onClick={() => handleCounterOffer(sale.id, sale.admin_counter_price_per_unit)}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <span>ต่อรองราคาใหม่</span>
                      </button>
                      <button
                        onClick={() => handleAcceptAdminOffer(sale.id)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>รับราคานี้</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Show seller's counter offer */}
              {sale.seller_counter_price_per_unit && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded mb-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">👤 ข้อเสนอราคาของคุณ:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-600">ราคาต่อหน่วย</p>
                      <p className="text-xl font-bold text-green-700">฿ {Number(sale.seller_counter_price_per_unit).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">มูลค่ารวม</p>
                      <p className="text-xl font-bold text-green-700">฿ {Number(sale.seller_counter_total_price).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-2">รอบริษัททำการตอบรับ...</p>
                </div>
              )}

              {sale.admin_note && !sale.admin_counter_price_per_unit && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm font-semibold text-blue-800 mb-1">หมายเหตุจากผู้ดูแล:</p>
                  <p className="text-sm text-blue-700">{sale.admin_note}</p>
                </div>
              )}
            </div>
          ))}

          {companySales.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีรายการขายกับบริษัท</p>
            </div>
          )}
        </div>
      </div>

      {/* Sell to Company Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">เลือกสินค้าที่ต้องการขาย</h2>
            
            {myProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">คุณยังไม่มีสินค้าที่สามารถขายได้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <div className="flex space-x-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            ปริมาณ: <span className="font-semibold">{product.quantity} {product.unit}</span>
                          </span>
                          <span className="text-primary-600">
                            ราคา: <span className="font-semibold">฿ {Number(product.price).toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSellModal(false)
                  setSelectedProduct(null)
                }}
                className="btn-secondary"
              >
                ยกเลิก
              </button>
              {selectedProduct && (
                <button
                  onClick={() => handleSellToCompany(selectedProduct.id)}
                  className="btn-primary"
                >
                  ส่งคำขอขาย
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanySales
