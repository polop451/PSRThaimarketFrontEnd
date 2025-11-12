import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Wheat, ShoppingCart, MessageSquare, Gavel, Building2, Shield, CreditCard, User, Package, Truck, MessageCircle } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Wheat className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              PSRThaiMarket
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link to="/products" className="nav-link">
              <ShoppingCart className="h-5 w-5" />
              <span>สินค้า</span>
            </Link>
            
            <Link to="/negotiations" className="nav-link">
              <MessageSquare className="h-5 w-5" />
              <span>ต่อรอง</span>
            </Link>
            
            <Link to="/auctions" className="nav-link">
              <Gavel className="h-5 w-5" />
              <span>ประมูล</span>
            </Link>
            
            <Link to="/company-sales" className="nav-link">
              <Building2 className="h-5 w-5" />
              <span>ขายกับบริษัท</span>
            </Link>
            
            {user?.role === 'buyer' && (
              <>
                <Link to="/deliveries" className="nav-link">
                  <Truck className="h-5 w-5" />
                  <span>รายการจัดส่ง</span>
                </Link>
                <Link to="/chats" className="nav-link relative">
                  <MessageCircle className="h-5 w-5" />
                  <span>ข้อความ</span>
                </Link>
              </>
            )}
            
            {user?.role === 'seller' && (
              <>
                <Link to="/seller/deliveries" className="nav-link">
                  <Package className="h-5 w-5" />
                  <span>รายการจัดส่ง</span>
                </Link>
                <Link to="/chats" className="nav-link">
                  <MessageCircle className="h-5 w-5" />
                  <span>ข้อความ</span>
                </Link>
              </>
            )}
            
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="nav-link">
                  <Shield className="h-5 w-5" />
                  <span>จัดการ</span>
                </Link>
                <Link to="/admin/payments" className="nav-link">
                  <CreditCard className="h-5 w-5" />
                  <span>ตรวจสอบชำระเงิน</span>
                </Link>
                <Link to="/admin/complete-sales" className="nav-link">
                  <Package className="h-5 w-5" />
                  <span>ปิดการขาย</span>
                </Link>
                <Link to="/admin/profile-requests" className="nav-link">
                  <User className="h-5 w-5" />
                  <span>อนุมัติโปรไฟล์</span>
                </Link>
              </>
            )}

            <div className="flex items-center space-x-3 pl-6 ml-3 border-l-2 border-gray-200">
              <Link to="/profile" className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 rounded-xl transition-all duration-200 hover:scale-110">
                <User className="h-5 w-5" />
              </Link>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 font-medium">
                  {user?.role === 'seller' ? '👤 ผู้ขาย' : user?.role === 'buyer' ? '🛒 ผู้ซื้อ' : '🛡️ Admin'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 hover:scale-110 group"
              >
                <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
