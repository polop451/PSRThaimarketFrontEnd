import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wheat, User, Mail, Lock, Phone, MapPin, AlertCircle, ShoppingBag, Store, CreditCard, Building2, Landmark } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'buyer',
    // Seller-specific fields
    id_card_number: '',
    juristic_number: '',
    bank_account_number: '',
    bank_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    // Validate seller-specific fields
    if (formData.role === 'seller') {
      if (!formData.id_card_number) {
        setError('กรุณากรอกเลขบัตรประชาชน')
        return
      }
      if (formData.id_card_number.length !== 13) {
        setError('เลขบัตรประชาชนต้องมี 13 หลัก')
        return
      }
      if (!formData.bank_account_number) {
        setError('กรุณากรอกเลขบัญชีธนาคาร')
        return
      }
      if (!formData.bank_name) {
        setError('กรุณากรอกชื่อธนาคาร')
        return
      }
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-4 rounded-full">
              <Wheat className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">สมัครสมาชิก</h1>
          <p className="text-gray-600">เริ่มต้นซื้อขายข้าวและธัญพืช</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ประเภทผู้ใช้
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    formData.role === 'buyer'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ShoppingBag className={`h-8 w-8 mx-auto mb-2 ${
                    formData.role === 'buyer' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <p className="font-semibold text-gray-800">ผู้ซื้อ</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    formData.role === 'seller'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className={`h-8 w-8 mx-auto mb-2 ${
                    formData.role === 'seller' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <p className="font-semibold text-gray-800">ผู้ขาย</p>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="สมชาย ใจดี"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="089-123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ที่อยู่
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="จังหวัด, อำเภอ"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seller-specific fields */}
            {formData.role === 'seller' && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Store className="h-5 w-5 mr-2 text-primary-600" />
                  ข้อมูลสำหรับผู้ขาย
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลขบัตรประชาชน <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="id_card_number"
                        value={formData.id_card_number}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="1234567890123"
                        maxLength="13"
                        required={formData.role === 'seller'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลขนิติบุคคล (ถ้ามี)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="juristic_number"
                        value={formData.juristic_number}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="0123456789012"
                        maxLength="13"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลขบัญชีธนาคาร / PromptPay <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="xxx-x-xxxxx-x"
                        required={formData.role === 'seller'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อธนาคาร / PromptPay <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="ธนาคารกสิกรไทย / PromptPay"
                        required={formData.role === 'seller'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
