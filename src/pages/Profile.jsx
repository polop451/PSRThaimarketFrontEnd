import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { User, Mail, Phone, MapPin, CreditCard, Building2, Landmark, AlertCircle, CheckCircle, Clock, Save } from 'lucide-react'
import axios from 'axios'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    id_card_number: '',
    juristic_number: '',
    bank_account_number: '',
    bank_name: ''
  })
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
    fetchRequests()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile/me')
      setProfile(response.data)
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        id_card_number: response.data.id_card_number || '',
        juristic_number: response.data.juristic_number || '',
        bank_account_number: response.data.bank_account_number || '',
        bank_name: response.data.bank_name || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/profile/my-requests')
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (user?.role === 'seller') {
      if (!formData.id_card_number || formData.id_card_number.length !== 13) {
        setError('กรุณากรอกเลขบัตรประชาชน 13 หลัก')
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

    try {
      await axios.post('/api/profile/update-request', formData)
      alert('ส่งคำขออัพเดทข้อมูลเรียบร้อย รอผู้ดูแลระบบอนุมัติ')
      setEditMode(false)
      fetchRequests()
    } catch (error) {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'รอการอนุมัติ', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { text: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{badge.text}</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <User className="h-8 w-8 mr-3 text-primary-600" />
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-gray-600 mt-2">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Current Profile */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">ข้อมูลปัจจุบัน</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-primary"
                >
                  แก้ไขข้อมูล
                </button>
              )}
            </div>

            {!editMode ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <User className="h-5 w-5" />
                      <span className="text-sm">ชื่อ-นามสกุล</span>
                    </div>
                    <p className="font-semibold text-gray-800">{profile?.name}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Mail className="h-5 w-5" />
                      <span className="text-sm">อีเมล</span>
                    </div>
                    <p className="font-semibold text-gray-800">{profile?.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Phone className="h-5 w-5" />
                      <span className="text-sm">เบอร์โทร</span>
                    </div>
                    <p className="font-semibold text-gray-800">{profile?.phone}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm">ที่อยู่</span>
                    </div>
                    <p className="font-semibold text-gray-800">{profile?.address}</p>
                  </div>
                </div>

                {user?.role === 'seller' && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลผู้ขาย</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <CreditCard className="h-5 w-5" />
                          <span className="text-sm">เลขบัตรประชาชน</span>
                        </div>
                        <p className="font-semibold text-gray-800">{profile?.id_card_number || '-'}</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <Building2 className="h-5 w-5" />
                          <span className="text-sm">เลขนิติบุคคล</span>
                        </div>
                        <p className="font-semibold text-gray-800">{profile?.juristic_number || '-'}</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <Landmark className="h-5 w-5" />
                          <span className="text-sm">เลขบัญชี</span>
                        </div>
                        <p className="font-semibold text-gray-800">{profile?.bank_account_number || '-'}</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <Landmark className="h-5 w-5" />
                          <span className="text-sm">ธนาคาร</span>
                        </div>
                        <p className="font-semibold text-gray-800">{profile?.bank_name || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {user?.role === 'seller' && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลผู้ขาย</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เลขบัตรประชาชน <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="id_card_number"
                          value={formData.id_card_number}
                          onChange={handleChange}
                          className="input-field"
                          maxLength="13"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เลขนิติบุคคล (ถ้ามี)
                        </label>
                        <input
                          type="text"
                          name="juristic_number"
                          value={formData.juristic_number}
                          onChange={handleChange}
                          className="input-field"
                          maxLength="13"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เลขบัญชีธนาคาร <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="bank_account_number"
                          value={formData.bank_account_number}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อธนาคาร <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>ส่งคำขออัพเดท</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false)
                      setError('')
                      fetchProfile()
                    }}
                    className="btn-secondary"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Update Requests History */}
          {requests.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">ประวัติคำขออัพเดท</h2>
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleString('th-TH')}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    {request.admin_comment && (
                      <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">ความคิดเห็นจาก Admin:</p>
                        <p className="text-sm text-gray-800">{request.admin_comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
