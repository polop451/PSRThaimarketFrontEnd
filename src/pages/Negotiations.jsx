import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { MessageSquare, TrendingDown, TrendingUp, Check, X, CreditCard, Truck, MapPin } from 'lucide-react'
import axios from 'axios'

const Negotiations = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [negotiations, setNegotiations] = useState([])
  const [counterPrice, setCounterPrice] = useState({})
  const [deliveryCounterPrice, setDeliveryCounterPrice] = useState({})

  useEffect(() => {
    fetchNegotiations()
  }, [])

  const fetchNegotiations = async () => {
    try {
      const response = await axios.get('/api/negotiations')
      console.log('All negotiations from API:', response.data)
      
      // Filter out negotiations that have been paid and verified (status: delivering, received, completed)
      const filteredNegotiations = response.data.filter(negotiation => {
        const shouldShow = !negotiation.payment_status || 
                          negotiation.payment_status === 'pending' || 
                          negotiation.payment_status === 'paid'
        
        console.log(`Negotiation ID ${negotiation.id}: payment_status=${negotiation.payment_status}, shouldShow=${shouldShow}`)
        return shouldShow
      })
      
      console.log('Filtered negotiations:', filteredNegotiations)
      setNegotiations(filteredNegotiations)
    } catch (error) {
      console.error('Failed to fetch negotiations:', error)
    }
  }

  const handleCreateNegotiation = async (productId, originalPrice) => {
    const price = prompt('กรุณาระบุราคาที่ต้องการเสนอ:')
    if (price) {
      try {
        await axios.post('/api/negotiations', {
          product_id: productId,
          proposed_price: parseFloat(price)
        })
        fetchNegotiations()
      } catch (error) {
        console.error('Failed to create negotiation:', error)
        alert('เกิดข้อผิดพลาดในการส่งข้อเสนอ')
      }
    }
  }

  const handleCounterOffer = async (negotiationId) => {
    const price = counterPrice[negotiationId]
    if (!price) {
      alert('กรุณาระบุราคาที่ต้องการเสนอใหม่')
      return
    }

    try {
      await axios.put(`/api/negotiations/${negotiationId}/counter`, {
        counter_price: parseFloat(price)
      })
      setCounterPrice({ ...counterPrice, [negotiationId]: '' })
      fetchNegotiations()
    } catch (error) {
      console.error('Failed to counter offer:', error)
      alert('เกิดข้อผิดพลาดในการเสนอราคาใหม่')
    }
  }

  const handleAccept = async (negotiationId) => {
    try {
      await axios.put(`/api/negotiations/${negotiationId}/accept`)
      fetchNegotiations()
      alert('ยอมรับข้อเสนอเรียบร้อย')
    } catch (error) {
      console.error('Failed to accept negotiation:', error)
      alert('เกิดข้อผิดพลาดในการยอมรับข้อเสนอ')
    }
  }

  const handleReject = async (negotiationId) => {
    if (window.confirm('คุณต้องการปฏิเสธข้อเสนอนี้หรือไม่?')) {
      try {
        await axios.put(`/api/negotiations/${negotiationId}/reject`)
        fetchNegotiations()
      } catch (error) {
        console.error('Failed to reject negotiation:', error)
      }
    }
  }

  const handleConfirmDelivery = async (negotiationId) => {
    if (window.confirm('ยืนยันว่าคุณจะจัดส่งสินค้าให้ผู้ซื้อตามที่อยู่ที่ระบุในราคาเดิม?')) {
      try {
        await axios.put(`/api/negotiations/${negotiationId}/confirm-delivery`)
        alert('✅ ยืนยันการจัดส่งเรียบร้อย\n\nผู้ซื้อสามารถชำระเงินได้แล้ว')
        fetchNegotiations()
      } catch (error) {
        console.error('Failed to confirm delivery:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleCounterDeliveryPrice = async (negotiationId) => {
    const price = deliveryCounterPrice[negotiationId]
    if (!price) {
      alert('กรุณาระบุราคาที่ต้องการเสนอใหม่ (รวมค่าจัดส่ง)')
      return
    }

    try {
      await axios.put(`/api/negotiations/${negotiationId}/counter-delivery-price`, {
        delivery_counter_price: parseFloat(price)
      })
      alert('✅ เสนอราคาใหม่เรียบร้อย\n\nรอผู้ซื้อยืนยัน')
      setDeliveryCounterPrice({ ...deliveryCounterPrice, [negotiationId]: '' })
      fetchNegotiations()
    } catch (error) {
      console.error('Failed to counter delivery price:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleAcceptDeliveryPrice = async (negotiationId) => {
    if (window.confirm('ยืนยันการยอมรับราคาใหม่จากผู้ขาย?')) {
      try {
        await axios.put(`/api/negotiations/${negotiationId}/accept-delivery-price`)
        alert('✅ ยอมรับราคาใหม่เรียบร้อย\n\nสามารถชำระเงินได้แล้ว')
        fetchNegotiations()
      } catch (error) {
        console.error('Failed to accept delivery price:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleBuyerCounterDeliveryPrice = async (negotiationId) => {
    const price = deliveryCounterPrice[negotiationId]
    if (!price) {
      alert('กรุณาระบุราคาที่ต้องการเสนอกลับ')
      return
    }

    try {
      await axios.put(`/api/negotiations/${negotiationId}/buyer-counter-delivery-price`, {
        delivery_counter_price: parseFloat(price)
      })
      alert('✅ เสนอราคากลับเรียบร้อย\n\nรอผู้ขายพิจารณา')
      setDeliveryCounterPrice({ ...deliveryCounterPrice, [negotiationId]: '' })
      fetchNegotiations()
    } catch (error) {
      console.error('Failed to counter delivery price:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleBuyerRejectDelivery = async (negotiationId) => {
    if (window.confirm('ยืนยันการยกเลิกการสั่งซื้อนี้?\n\nการต่อรองจะถูกยกเลิก')) {
      try {
        await axios.put(`/api/negotiations/${negotiationId}/buyer-reject-delivery`)
        alert('❌ ยกเลิกการสั่งซื้อเรียบร้อย')
        fetchNegotiations()
      } catch (error) {
        console.error('Failed to reject delivery:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const handleRejectDelivery = async (negotiationId) => {
    if (window.confirm('ยืนยันการปฏิเสธการจัดส่ง?\n\nการต่อรองนี้จะถูกยกเลิก')) {
      try {
        await axios.put(`/api/negotiations/${negotiationId}/reject-delivery`)
        alert('❌ ปฏิเสธการจัดส่งเรียบร้อย')
        fetchNegotiations()
      } catch (error) {
        console.error('Failed to reject delivery:', error)
        alert('เกิดข้อผิดพลาด')
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'รอการตอบรับ', color: 'bg-yellow-100 text-yellow-800' },
      countered: { text: 'เสนอราคาใหม่', color: 'bg-blue-100 text-blue-800' },
      accepted: { text: 'ยอมรับแล้ว', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">การต่อรองราคา</h1>
          <p className="text-gray-600 mt-2">จัดการการต่อรองซื้อขายของคุณ</p>
        </div>

        <div className="space-y-4">
          {negotiations.map((negotiation) => (
            <div key={negotiation.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-8 w-8 text-primary-600" />
                  <div>
                    <h3 className="font-bold text-gray-800">{negotiation.product_name}</h3>
                    <p className="text-sm text-gray-500">
                      {user.role === 'buyer' ? `ผู้ขาย: ${negotiation.seller_name}` : `ผู้ซื้อ: ${negotiation.buyer_name}`}
                    </p>
                  </div>
                </div>
                {getStatusBadge(negotiation.status)}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาเดิม</p>
                  <p className="text-lg font-bold text-gray-800">
                    ฿ {Number(negotiation.original_price).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาที่เสนอ</p>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                    <p className="text-lg font-bold text-blue-600">
                      ฿ {Number(negotiation.proposed_price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {negotiation.counter_price && !negotiation.delivery_counter_price && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาเสนอใหม่</p>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <p className="text-lg font-bold text-purple-600">
                        ฿ {Number(negotiation.counter_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {negotiation.delivery_counter_price && (
                  <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                    <p className="text-xs text-yellow-700 mb-1">ราคารวมค่าจัดส่ง</p>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-yellow-600" />
                      <p className="text-lg font-bold text-yellow-700">
                        ฿ {Number(negotiation.delivery_counter_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Seller Actions */}
              {user.role === 'seller' && negotiation.status === 'pending' && (
                <div className="flex items-center space-x-3 mt-4">
                  <input
                    type="number"
                    placeholder="เสนอราคาใหม่"
                    value={counterPrice[negotiation.id] || ''}
                    onChange={(e) => setCounterPrice({ ...counterPrice, [negotiation.id]: e.target.value })}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => handleCounterOffer(negotiation.id)}
                    className="btn-secondary"
                  >
                    <TrendingUp className="h-4 w-4 mr-1 inline" />
                    เสนอราคาใหม่
                  </button>
                  <button
                    onClick={() => handleAccept(negotiation.id)}
                    className="btn-primary"
                  >
                    <Check className="h-4 w-4 mr-1 inline" />
                    ยอมรับ
                  </button>
                  <button
                    onClick={() => handleReject(negotiation.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    <X className="h-4 w-4 mr-1 inline" />
                    ปฏิเสธ
                  </button>
                </div>
              )}

              {/* Buyer Actions for Countered Offers */}
              {user.role === 'buyer' && negotiation.status === 'countered' && (
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => handleAccept(negotiation.id)}
                    className="btn-primary"
                  >
                    <Check className="h-4 w-4 mr-1 inline" />
                    ยอมรับราคาใหม่
                  </button>
                  <button
                    onClick={() => handleReject(negotiation.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    <X className="h-4 w-4 mr-1 inline" />
                    ปฏิเสธ
                  </button>
                </div>
              )}

              {/* Payment Button for Accepted Negotiations */}
              {negotiation.status === 'accepted' && negotiation.delivery_method && (
                <div className="space-y-3 mt-4">
                  {/* Delivery Method Info */}
                  <div className={`p-4 rounded-lg border-2 ${
                    negotiation.delivery_method === 'seller_delivery' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {negotiation.delivery_method === 'seller_delivery' ? (
                        <>
                          <Truck className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">ผู้ขายจัดส่งให้</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">ผู้ซื้อมารับเอง</span>
                        </>
                      )}
                    </div>
                    
                    {negotiation.delivery_method === 'seller_delivery' && user.role === 'buyer' && (
                      <div className="text-sm text-blue-700 mt-2">
                        <p className="font-medium mb-1">ที่อยู่จัดส่ง:</p>
                        <p className="text-blue-600 whitespace-pre-line">{negotiation.buyer_address}</p>
                        
                        {/* Show counter price if seller proposed new price */}
                        {negotiation.delivery_counter_price && !negotiation.delivery_price_accepted && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 font-semibold mb-2">
                              💰 ผู้ขายเสนอราคาใหม่ (รวมค่าจัดส่ง)
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-600">ราคาเดิม:</span>
                              <span className="text-gray-800 font-bold">
                                ฿ {Number(negotiation.counter_price || negotiation.proposed_price).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-600">ราคาที่ผู้ขายเสนอ:</span>
                              <span className="text-yellow-700 font-bold text-lg">
                                ฿ {Number(negotiation.delivery_counter_price).toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Buyer can counter back */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ต่อรองราคากลับ (ถ้าต้องการ)
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  placeholder="ระบุราคาที่ต้องการ"
                                  value={deliveryCounterPrice[negotiation.id] || ''}
                                  onChange={(e) => setDeliveryCounterPrice({ 
                                    ...deliveryCounterPrice, 
                                    [negotiation.id]: e.target.value 
                                  })}
                                  className="input-field flex-1"
                                  min="0"
                                />
                                <button
                                  onClick={() => handleBuyerCounterDeliveryPrice(negotiation.id)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg whitespace-nowrap"
                                >
                                  <TrendingDown className="h-4 w-4 mr-1 inline" />
                                  เสนอกลับ
                                </button>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptDeliveryPrice(negotiation.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                              >
                                <Check className="h-4 w-4 mr-2 inline" />
                                ยอมรับราคานี้
                              </button>
                              <button
                                onClick={() => handleBuyerRejectDelivery(negotiation.id)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                              >
                                <X className="h-4 w-4 mr-2 inline" />
                                ยกเลิกสั่งซื้อ
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {!negotiation.delivery_confirmed && !negotiation.delivery_counter_price && (
                          <p className="mt-2 text-yellow-700 bg-yellow-100 p-2 rounded">
                            ⏳ รอผู้ขายตอบรับการจัดส่ง
                          </p>
                        )}
                        {negotiation.delivery_confirmed && (
                          <p className="mt-2 text-green-700 bg-green-100 p-2 rounded">
                            ✅ ผู้ขายยืนยันการจัดส่งแล้ว
                          </p>
                        )}
                      </div>
                    )}

                    {negotiation.delivery_method === 'seller_delivery' && user.role === 'seller' && (
                      <div className="text-sm text-blue-700 mt-2">
                        <p className="font-medium mb-1">ที่อยู่ผู้ซื้อ:</p>
                        <p className="text-blue-600 whitespace-pre-line mb-3">{negotiation.buyer_address}</p>
                        
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                          <p className="text-gray-600 text-xs mb-1">ราคาที่ตกลงกัน:</p>
                          <p className="text-gray-800 font-bold text-lg">
                            ฿ {Number(negotiation.counter_price || negotiation.proposed_price).toLocaleString()}
                          </p>
                        </div>

                        {!negotiation.delivery_confirmed && !negotiation.delivery_counter_price && (
                          <div className="space-y-2">
                            <div className="flex space-x-2 mb-2">
                              <input
                                type="number"
                                placeholder="เสนอราคาใหม่ (รวมค่าจัดส่ง)"
                                value={deliveryCounterPrice[negotiation.id] || ''}
                                onChange={(e) => setDeliveryCounterPrice({ 
                                  ...deliveryCounterPrice, 
                                  [negotiation.id]: e.target.value 
                                })}
                                className="input-field flex-1"
                                min={negotiation.counter_price || negotiation.proposed_price}
                              />
                              <button
                                onClick={() => handleCounterDeliveryPrice(negotiation.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg whitespace-nowrap"
                              >
                                <TrendingUp className="h-4 w-4 mr-1 inline" />
                                เสนอราคาใหม่
                              </button>
                            </div>
                            <button
                              onClick={() => handleConfirmDelivery(negotiation.id)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                              <Check className="h-4 w-4 mr-2 inline" />
                              ยืนยันจัดส่งในราคาเดิม
                            </button>
                            <button
                              onClick={() => handleRejectDelivery(negotiation.id)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                              <X className="h-4 w-4 mr-2 inline" />
                              ปฏิเสธการจัดส่ง
                            </button>
                          </div>
                        )}

                        {negotiation.delivery_counter_price && !negotiation.delivery_price_accepted && (
                          <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-yellow-800 font-semibold mb-2">
                                💬 กำลังต่อรองราคา
                              </p>
                              <p className="text-gray-600 text-sm mb-1">
                                ราคาปัจจุบันที่เสนอ: <span className="font-bold text-yellow-700">
                                  ฿ {Number(negotiation.delivery_counter_price).toLocaleString()}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                รอผู้ซื้อพิจารณา (ต่อรองกลับหรือยอมรับ)
                              </p>
                            </div>

                            {/* Seller can counter again */}
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                placeholder="ต่อรองราคาใหม่อีกครั้ง"
                                value={deliveryCounterPrice[negotiation.id] || ''}
                                onChange={(e) => setDeliveryCounterPrice({ 
                                  ...deliveryCounterPrice, 
                                  [negotiation.id]: e.target.value 
                                })}
                                className="input-field flex-1"
                                min={negotiation.counter_price || negotiation.proposed_price}
                              />
                              <button
                                onClick={() => handleCounterDeliveryPrice(negotiation.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg whitespace-nowrap"
                              >
                                <TrendingUp className="h-4 w-4 mr-1 inline" />
                                เสนอใหม่
                              </button>
                            </div>

                            {/* Cancel button for seller when waiting buyer response */}
                            <button
                              onClick={() => handleRejectDelivery(negotiation.id)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                              <X className="h-4 w-4 mr-2 inline" />
                              ยกเลิกการขาย
                            </button>
                          </div>
                        )}

                        {negotiation.delivery_confirmed && (
                          <p className="text-green-700 bg-green-100 p-2 rounded">
                            ✅ คุณยืนยันการจัดส่งแล้ว
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Button - Show only if buyer_pickup OR delivery confirmed */}
                  {user.role === 'buyer' && (
                    negotiation.delivery_method === 'buyer_pickup' || negotiation.delivery_confirmed
                  ) && (
                    <button
                      onClick={() => navigate(`/payment/${negotiation.id}`)}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      ชำระเงิน
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  สร้างเมื่อ: {new Date(negotiation.created_at).toLocaleString('th-TH')}
                </p>
              </div>
            </div>
          ))}

          {negotiations.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีการต่อรองราคา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Negotiations
