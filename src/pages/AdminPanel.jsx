import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { Shield, Gavel, Building2, DollarSign, CheckCircle, XCircle, Edit2 } from 'lucide-react'
import axios from 'axios'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('auctions')
  const [auctionRequests, setAuctionRequests] = useState([])
  const [companySales, setCompanySales] = useState([])
  const [basePrices, setBasePrices] = useState([])
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState(null)

  useEffect(() => {
    fetchAuctionRequests()
    fetchCompanySales()
    fetchBasePrices()
  }, [])

  const fetchAuctionRequests = async () => {
    try {
      const response = await axios.get('/api/admin/auction-requests')
      setAuctionRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch auction requests:', error)
    }
  }

  const fetchCompanySales = async () => {
    try {
      const response = await axios.get('/api/admin/company-sales')
      setCompanySales(response.data)
    } catch (error) {
      console.error('Failed to fetch company sales:', error)
    }
  }

  const fetchBasePrices = async () => {
    try {
      const response = await axios.get('/api/admin/base-prices')
      setBasePrices(response.data)
    } catch (error) {
      console.error('Failed to fetch base prices:', error)
    }
  }

  const handleApproveAuction = async (id) => {
    try {
      await axios.put(`/api/admin/auctions/${id}/approve`)
      fetchAuctionRequests()
      alert('อนุมัติการประมูลเรียบร้อย')
    } catch (error) {
      console.error('Failed to approve auction:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleRejectAuction = async (id) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
    if (reason) {
      try {
        await axios.put(`/api/admin/auctions/${id}/reject`, { reason })
        fetchAuctionRequests()
        alert('ปฏิเสธการประมูลเรียบร้อย')
      } catch (error) {
        console.error('Failed to reject auction:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleApproveCompanySale = async (id) => {
    const note = prompt('หมายเหตุ (ถ้ามี):')
    try {
      await axios.put(`/api/admin/company-sales/${id}/approve`, { note })
      fetchCompanySales()
      alert('อนุมัติการขายเรียบร้อย')
    } catch (error) {
      console.error('Failed to approve company sale:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleRejectCompanySale = async (id) => {
    const note = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
    if (note) {
      try {
        await axios.put(`/api/admin/company-sales/${id}/reject`, { note })
        fetchCompanySales()
        alert('ปฏิเสธการขายเรียบร้อย')
      } catch (error) {
        console.error('Failed to reject company sale:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleCounterOfferCompanySale = async (id, currentPrice) => {
    const priceStr = prompt(`ราคาปัจจุบัน: ฿${Number(currentPrice).toLocaleString()}/หน่วย\n\nเสนอราคาใหม่ (ต่อหน่วย):`)
    if (priceStr) {
      const price_per_unit = parseFloat(priceStr)
      if (isNaN(price_per_unit) || price_per_unit <= 0) {
        alert('กรุณาระบุราคาที่ถูกต้อง')
        return
      }
      const note = prompt('หมายเหตุ (ถ้ามี):')
      try {
        await axios.put(`/api/admin/company-sales/${id}/counter-offer`, { price_per_unit, note })
        fetchCompanySales()
        alert('ส่งข้อเสนอราคาใหม่เรียบร้อย รอผู้ขายตอบรับ')
      } catch (error) {
        console.error('Failed to counter offer:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleAcceptSellerCounter = async (id) => {
    if (window.confirm('ยืนยันการรับข้อเสนอราคาจากผู้ขาย?')) {
      const note = prompt('หมายเหตุ (ถ้ามี):')
      try {
        await axios.put(`/api/admin/company-sales/${id}/accept-seller-counter`, { note })
        fetchCompanySales()
        alert('รับข้อเสนอราคาเรียบร้อย')
      } catch (error) {
        console.error('Failed to accept seller counter:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleUpdateBasePrice = async (e) => {
    e.preventDefault()
    try {
      if (selectedPrice.id) {
        await axios.put(`/api/admin/base-prices/${selectedPrice.id}`, {
          price: selectedPrice.price
        })
      } else {
        await axios.post('/api/admin/base-prices', selectedPrice)
      }
      setShowPriceModal(false)
      setSelectedPrice(null)
      fetchBasePrices()
      alert('อัพเดทราคากลางเรียบร้อย')
    } catch (error) {
      console.error('Failed to update base price:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary-600" />
            แผงควบคุมผู้ดูแลระบบ
          </h1>
          <p className="text-gray-600 mt-2">จัดการระบบและอนุมัติคำขอต่างๆ</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('auctions')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'auctions'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Gavel className="h-5 w-5 inline mr-2" />
            คำขอเปิดประมูล
          </button>
          <button
            onClick={() => setActiveTab('company-sales')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'company-sales'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Building2 className="h-5 w-5 inline mr-2" />
            การขายกับบริษัท
          </button>
          <button
            onClick={() => setActiveTab('base-prices')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'base-prices'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <DollarSign className="h-5 w-5 inline mr-2" />
            ราคากลาง
          </button>
        </div>

        {/* Auction Requests Tab */}
        {activeTab === 'auctions' && (
          <div className="space-y-4">
            {auctionRequests.filter(a => a.status === 'pending').map((auction) => (
              <div key={auction.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{auction.product_name}</h3>
                    <p className="text-sm text-gray-500">ผู้ขาย: {auction.seller_name}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    รอการอนุมัติ
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{auction.description}</p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาเริ่มต้น</p>
                    <p className="font-semibold">฿ {Number(auction.starting_price).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">เพิ่มราคาขั้นต่ำ</p>
                    <p className="font-semibold">฿ {Number(auction.min_increment).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ระยะเวลา</p>
                    <p className="font-semibold">{auction.duration_hours} ชั่วโมง</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleRejectAuction(auction.id)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>ปฏิเสธ</span>
                  </button>
                  <button
                    onClick={() => handleApproveAuction(auction.id)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>อนุมัติ</span>
                  </button>
                </div>
              </div>
            ))}

            {auctionRequests.filter(a => a.status === 'pending').length === 0 && (
              <div className="text-center py-12">
                <Gavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่มีคำขอเปิดประมูลที่รออนุมัติ</p>
              </div>
            )}
          </div>
        )}

        {/* Company Sales Tab */}
        {activeTab === 'company-sales' && (
          <div className="space-y-4">
            {companySales.filter(s => s.status === 'pending' || s.status === 'negotiating').map((sale) => (
              <div key={sale.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{sale.product_name}</h3>
                    <p className="text-sm text-gray-500">ผู้ขาย: {sale.seller_name} | โทร: {sale.seller_phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sale.status === 'negotiating' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sale.status === 'negotiating' ? 'กำลังต่อรอง' : 'รอการตรวจสอบ'}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ปริมาณ</p>
                    <p className="font-semibold">{sale.quantity} {sale.unit}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาต่อหน่วยเดิม</p>
                    <p className="font-semibold text-gray-600">฿ {Number(sale.price_per_unit).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">มูลค่ารวมเดิม</p>
                    <p className="font-semibold text-gray-600">฿ {Number(sale.total_price).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">วันที่ส่งคำขอ</p>
                    <p className="font-semibold">{new Date(sale.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>

                {/* Show admin's counter offer */}
                {sale.admin_counter_price_per_unit && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">🏢 ข้อเสนอราคาจากบริษัท:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-blue-600">ราคาต่อหน่วย</p>
                        <p className="text-lg font-bold text-blue-700">฿ {Number(sale.admin_counter_price_per_unit).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">มูลค่ารวม</p>
                        <p className="text-lg font-bold text-blue-700">฿ {Number(sale.admin_counter_total_price).toLocaleString()}</p>
                      </div>
                    </div>
                    {sale.admin_note && (
                      <p className="text-sm text-blue-700 mt-2">หมายเหตุ: {sale.admin_note}</p>
                    )}
                  </div>
                )}

                {/* Show seller's counter offer */}
                {sale.seller_counter_price_per_unit && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded mb-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">👤 ข้อเสนอราคาจากผู้ขาย:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-green-600">ราคาต่อหน่วย</p>
                        <p className="text-lg font-bold text-green-700">฿ {Number(sale.seller_counter_price_per_unit).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600">มูลค่ารวม</p>
                        <p className="text-lg font-bold text-green-700">฿ {Number(sale.seller_counter_total_price).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  {sale.negotiation_status === 'seller_countered' ? (
                    // Seller has countered - admin can accept or counter again
                    <>
                      <button
                        onClick={() => handleRejectCompanySale(sale.id)}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>ปฏิเสธ</span>
                      </button>
                      <button
                        onClick={() => handleCounterOfferCompanySale(sale.id, sale.seller_counter_price_per_unit)}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <span>ต่อรองราคาใหม่</span>
                      </button>
                      <button
                        onClick={() => handleAcceptSellerCounter(sale.id)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>รับราคานี้และซื้อ</span>
                      </button>
                    </>
                  ) : (
                    // Initial or admin has offered - show normal options
                    <>
                      <button
                        onClick={() => handleRejectCompanySale(sale.id)}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>ปฏิเสธ</span>
                      </button>
                      <button
                        onClick={() => handleCounterOfferCompanySale(sale.id, sale.price_per_unit)}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <span>ต่อรองราคา</span>
                      </button>
                      <button
                        onClick={() => handleApproveCompanySale(sale.id)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>อนุมัติและซื้อ</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {companySales.filter(s => s.status === 'pending').length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่มีคำขอขายกับบริษัทที่รอตรวจสอบ</p>
              </div>
            )}
          </div>
        )}

        {/* Base Prices Tab */}
        {activeTab === 'base-prices' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setSelectedPrice({ product_name: '', category: 'rice', price: '' })
                  setShowPriceModal(true)
                }}
                className="btn-primary"
              >
                เพิ่มราคากลาง
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {basePrices.map((price) => (
                <div key={price.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{price.product_name}</h3>
                      <p className="text-sm text-gray-500">{price.category}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPrice(price)
                        setShowPriceModal(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคากลาง</p>
                    <p className="text-2xl font-bold text-primary-600">
                      ฿ {Number(price.price).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    อัพเดทล่าสุด: {new Date(price.updated_at).toLocaleString('th-TH')}
                  </p>
                </div>
              ))}
            </div>

            {basePrices.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีราคากลาง</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedPrice?.id ? 'แก้ไขราคากลาง' : 'เพิ่มราคากลาง'}
            </h2>
            
            <form onSubmit={handleUpdateBasePrice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  value={selectedPrice.product_name}
                  onChange={(e) => setSelectedPrice({ ...selectedPrice, product_name: e.target.value })}
                  className="input-field"
                  required
                  disabled={selectedPrice?.id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภท
                </label>
                <select
                  value={selectedPrice.category}
                  onChange={(e) => setSelectedPrice({ ...selectedPrice, category: e.target.value })}
                  className="input-field"
                  disabled={selectedPrice?.id}
                >
                  <option value="rice">ข้าว</option>
                  <option value="wheat">ข้าวสาลี</option>
                  <option value="corn">ข้าวโพด</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคากลาง (บาท/ตัน)
                </label>
                <input
                  type="number"
                  value={selectedPrice.price}
                  onChange={(e) => setSelectedPrice({ ...selectedPrice, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceModal(false)
                    setSelectedPrice(null)
                  }}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
