import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { TrendingUp, Package, MessageSquare, Gavel, DollarSign } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    negotiations: 0,
    auctions: 0,
    sales: 0
  })
  const [marketPrices, setMarketPrices] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // ดึงข้อมูลทั้ง 3 endpoints พร้อมกัน
      const [statsRes, pricesRes, notificationsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/market-prices'),
        axios.get('/api/dashboard/notifications')
      ])
      
      setStats(statsRes.data)
      setMarketPrices(pricesRes.data)
      setNotifications(notificationsRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)
    
    if (diffInSeconds < 60) return 'เมื่อสักครู่'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`
    return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`
  }

  const getNotificationColor = (type) => {
    const colors = {
      negotiation: 'blue',
      negotiation_response: 'green',
      new_auction: 'purple',
      auction_ending: 'orange',
      outbid: 'red',
      company_sale: 'indigo',
      pending_approval: 'yellow',
      new_negotiation: 'teal'
    }
    return colors[type] || 'gray'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            สวัสดี, {user?.name}
          </h1>
          <p className="text-gray-600">
            ยินดีต้อนรับสู่ระบบซื้อขายข้าวและธัญพืช
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">สินค้าทั้งหมด</p>
                <p className="text-3xl font-bold">{stats.products}</p>
              </div>
              <Package className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">การต่อรอง</p>
                <p className="text-3xl font-bold">{stats.negotiations}</p>
              </div>
              <MessageSquare className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">การประมูล</p>
                <p className="text-3xl font-bold">{stats.auctions}</p>
              </div>
              <Gavel className="h-12 w-12 text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">ยอดขาย</p>
                <p className="text-3xl font-bold">{stats.sales}</p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
              ภาพรวมตลาด
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg h-12"></div>
                ))}
              </div>
            ) : marketPrices.length > 0 ? (
              <div className="space-y-3">
                {marketPrices.map((price, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="text-gray-700 font-medium">{price.product_name}</span>
                      <span className="text-xs text-gray-500 ml-2">({price.category})</span>
                    </div>
                    <span className="font-semibold text-primary-600">
                      ฿ {parseFloat(price.price).toLocaleString()}/ตัน
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ยังไม่มีข้อมูลราคากลาง</p>
                <p className="text-sm mt-1">รอ Admin ตั้งค่าราคากลาง</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              แจ้งเตือนล่าสุด
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg h-16"></div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => {
                  const color = getNotificationColor(notification.type)
                  return (
                    <div 
                      key={index} 
                      className={`p-3 bg-${color}-50 border-l-4 border-${color}-500 rounded hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => notification.link && (window.location.href = notification.link)}
                    >
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.timestamp)}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ยังไม่มีการแจ้งเตือน</p>
                <p className="text-sm mt-1">กิจกรรมต่างๆ จะแสดงที่นี่</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
