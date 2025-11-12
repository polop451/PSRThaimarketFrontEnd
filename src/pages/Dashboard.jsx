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

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
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
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">ข้าวหอมมะลิ</span>
                <span className="font-semibold text-primary-600">฿ 25,000/ตัน</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">ข้าวเหนียว</span>
                <span className="font-semibold text-primary-600">฿ 22,000/ตัน</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">ข้าวโพด</span>
                <span className="font-semibold text-primary-600">฿ 8,500/ตัน</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">ข้าวสาลี</span>
                <span className="font-semibold text-primary-600">฿ 12,000/ตัน</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              แจ้งเตือนล่าสุด
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-700">มีการต่อรองราคาใหม่สำหรับสินค้าของคุณ</p>
                <p className="text-xs text-gray-500 mt-1">5 นาทีที่แล้ว</p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm text-gray-700">มีการประมูลใหม่เปิดให้เข้าร่วม</p>
                <p className="text-xs text-gray-500 mt-1">1 ชั่วโมงที่แล้ว</p>
              </div>
              <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-sm text-gray-700">ราคากลางถูกอัพเดทโดยผู้ดูแลระบบ</p>
                <p className="text-xs text-gray-500 mt-1">3 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
