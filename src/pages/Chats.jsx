import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { MessageCircle, Package, Clock, AlertCircle } from 'lucide-react'
import axios from 'axios'

const Chats = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchChats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/messages/chats')
      setChats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch chats:', error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      delivering: { text: 'กำลังจัดส่ง', class: 'bg-blue-100 text-blue-800' },
      received: { text: 'ได้รับแล้ว', class: 'bg-green-100 text-green-800' },
      completed: { text: 'เสร็จสิ้น', class: 'bg-gray-100 text-gray-800' }
    }
    const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.text}
      </span>
    )
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'เมื่อสักครู่'
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    if (days < 7) return `${days} วันที่แล้ว`
    
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    })
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
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-primary-600" />
            <span>ข้อความ</span>
          </h1>
          <p className="text-gray-600 mt-2">แชทกับ{user?.role === 'buyer' ? 'ผู้ขาย' : 'ผู้ซื้อ'}เกี่ยวกับคำสั่งซื้อของคุณ</p>
        </div>

        {chats.length === 0 ? (
          <div className="card text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีการสนทนา</h3>
            <p className="text-gray-500 mb-4">
              การแชทจะเปิดใช้งานได้หลังจากแอดมินยืนยันการชำระเงิน
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>คำสั่งซื้อที่ได้รับการยืนยันแล้วจะแสดงที่นี่</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.payment_id}
                onClick={() => navigate(`/chat/${chat.payment_id}`)}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-primary-100 rounded-full flex-shrink-0">
                      <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 truncate">
                          {chat.product_name}
                        </h3>
                        {chat.unread_count > 0 && (
                          <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm text-gray-600">
                          {user?.role === 'buyer' ? `ผู้ขาย: ${chat.seller_name}` : `ผู้ซื้อ: ${chat.buyer_name}`}
                        </p>
                        <span className="text-gray-300">•</span>
                        {getStatusBadge(chat.status)}
                      </div>
                      
                      {chat.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {chat.last_message}
                        </p>
                      )}
                      
                      {chat.last_message_time && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.last_message_time)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Chats
