import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Gavel, Clock, TrendingUp, Plus, AlertCircle } from 'lucide-react'
import axios from 'axios'

const Auctions = () => {
  const { user } = useAuth()
  const [auctions, setAuctions] = useState([])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [bidAmount, setBidAmount] = useState({})
  const [requestForm, setRequestForm] = useState({
    product_name: '',
    description: '',
    starting_price: '',
    min_increment: '',
    duration_hours: 24
  })

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    try {
      const response = await axios.get('/api/auctions')
      setAuctions(response.data)
    } catch (error) {
      console.error('Failed to fetch auctions:', error)
    }
  }

  const handleRequestAuction = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/auctions/request', requestForm)
      setShowRequestModal(false)
      setRequestForm({
        product_name: '',
        description: '',
        starting_price: '',
        min_increment: '',
        duration_hours: 24
      })
      alert('ส่งคำขอเปิดประมูลเรียบร้อย รอการอนุมัติจากผู้ดูแลระบบ')
    } catch (error) {
      console.error('Failed to request auction:', error)
      alert('เกิดข้อผิดพลาดในการส่งคำขอ')
    }
  }

  const handlePlaceBid = async (auctionId) => {
    const amount = bidAmount[auctionId]
    if (!amount) {
      alert('กรุณาระบุราคาที่ต้องการประมูล')
      return
    }

    try {
      await axios.post(`/api/auctions/${auctionId}/bid`, {
        bid_amount: parseFloat(amount)
      })
      setBidAmount({ ...bidAmount, [auctionId]: '' })
      fetchAuctions()
      alert('ประมูลสำเร็จ')
    } catch (error) {
      console.error('Failed to place bid:', error)
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการประมูล')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'รอการอนุมัติ', color: 'bg-yellow-100 text-yellow-800' },
      active: { text: 'กำลังประมูล', color: 'bg-green-100 text-green-800' },
      ended: { text: 'สิ้นสุดแล้ว', color: 'bg-gray-100 text-gray-800' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getRemainingTime = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now

    if (diff <= 0) return 'หมดเวลา'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `เหลือ ${hours} ชม. ${minutes} นาที`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">การประมูล</h1>
            <p className="text-gray-600 mt-2">ประมูลสินค้าเกษตรในราคาที่ดีที่สุด</p>
          </div>
          {user?.role === 'seller' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>ขอเปิดประมูล</span>
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div key={auction.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gavel className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{auction.product_name}</h3>
                    <p className="text-sm text-gray-500">โดย {auction.seller_name}</p>
                  </div>
                </div>
                {getStatusBadge(auction.status)}
              </div>

              <p className="text-gray-600 text-sm mb-4">{auction.description}</p>

              <div className="space-y-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ราคาเริ่มต้น</p>
                  <p className="text-lg font-bold text-gray-800">
                    ฿ {Number(auction.starting_price).toLocaleString()}
                  </p>
                </div>

                {auction.current_bid && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคาประมูลปัจจุบัน</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-green-600">
                        ฿ {Number(auction.current_bid).toLocaleString()}
                      </p>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ผู้ประมูล: {auction.highest_bidder_name || 'ไม่ระบุ'}
                    </p>
                  </div>
                )}

                {auction.status === 'active' && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm font-semibold">
                      {getRemainingTime(auction.end_time)}
                    </p>
                  </div>
                )}
              </div>

              {user?.role === 'buyer' && auction.status === 'active' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder={`ขั้นต่ำ ฿${Number(auction.min_increment).toLocaleString()}`}
                    value={bidAmount[auction.id] || ''}
                    onChange={(e) => setBidAmount({ ...bidAmount, [auction.id]: e.target.value })}
                    className="input-field"
                  />
                  <button
                    onClick={() => handlePlaceBid(auction.id)}
                    className="w-full btn-primary"
                  >
                    <Gavel className="h-4 w-4 mr-2 inline" />
                    ประมูล
                  </button>
                </div>
              )}

              {auction.status === 'ended' && auction.winner_id === user?.id && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">คุณชนะการประมูล!</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {auctions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Gavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีการประมูล</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Auction Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ขอเปิดประมูล</h2>
            
            <form onSubmit={handleRequestAuction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  value={requestForm.product_name}
                  onChange={(e) => setRequestForm({ ...requestForm, product_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียด
                </label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคาเริ่มต้น (บาท)
                  </label>
                  <input
                    type="number"
                    value={requestForm.starting_price}
                    onChange={(e) => setRequestForm({ ...requestForm, starting_price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เพิ่มราคาขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number"
                    value={requestForm.min_increment}
                    onChange={(e) => setRequestForm({ ...requestForm, min_increment: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ระยะเวลา (ชั่วโมง)
                  </label>
                  <input
                    type="number"
                    value={requestForm.duration_hours}
                    onChange={(e) => setRequestForm({ ...requestForm, duration_hours: e.target.value })}
                    className="input-field"
                    min="1"
                    max="168"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  ส่งคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auctions
