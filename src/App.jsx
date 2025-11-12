import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Negotiations from './pages/Negotiations'
import Auctions from './pages/Auctions'
import CompanySales from './pages/CompanySales'
import AdminPanel from './pages/AdminPanel'
import AdminPayments from './pages/AdminPayments'
import AdminProfileRequests from './pages/AdminProfileRequests'
import AdminCompleteSales from './pages/AdminCompleteSales'
import BuyerDeliveries from './pages/BuyerDeliveries'
import SellerDeliveries from './pages/SellerDeliveries'
import Chats from './pages/Chats'
import Chat from './pages/Chat'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/products/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
          <Route path="/negotiations" element={<PrivateRoute><Negotiations /></PrivateRoute>} />
          <Route path="/payment/:negotiation_id" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/deliveries" element={<PrivateRoute requiredRole="buyer"><BuyerDeliveries /></PrivateRoute>} />
          <Route path="/seller/deliveries" element={<PrivateRoute requiredRole="seller"><SellerDeliveries /></PrivateRoute>} />
          <Route path="/chats" element={<PrivateRoute><Chats /></PrivateRoute>} />
          <Route path="/chat/:paymentId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/auctions" element={<PrivateRoute><Auctions /></PrivateRoute>} />
          <Route path="/company-sales" element={<PrivateRoute><CompanySales /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminPanel /></PrivateRoute>} />
          <Route path="/admin/payments" element={<PrivateRoute requiredRole="admin"><AdminPayments /></PrivateRoute>} />
          <Route path="/admin/profile-requests" element={<PrivateRoute requiredRole="admin"><AdminProfileRequests /></PrivateRoute>} />
          <Route path="/admin/complete-sales" element={<PrivateRoute requiredRole="admin"><AdminCompleteSales /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
