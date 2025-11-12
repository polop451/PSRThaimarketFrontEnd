import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { User, CheckCircle, X, Clock, AlertCircle } from 'lucide-react'
import axios from 'axios'

const AdminProfileRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/profile/admin/pending')
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`/api/profile/admin/approve/${requestId}`, { comment })
      alert('อนุมัติการเปลี่ยนแปลงข้อมูลเรียบร้อย')
      setSelectedRequest(null)
      setComment('')
      fetchRequests()
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await axios.put(`/api/profile/admin/reject/${requestId}`, { comment })
      alert('ปฏิเสธการเปลี่ยนแปลงข้อมูลเรียบร้อย')
      setSelectedRequest(null)
      setComment('')
      fetchRequests()
    } catch (error) {
      console.error('Failed to reject:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const renderDataComparison = (currentData, newData) => {
    const fields = [
      { key: 'name', label: 'ชื่อ-นามสกุล' },
      { key: 'phone', label: 'เบอร์โทร' },
      { key: 'address', label: 'ที่อยู่' },
      { key: 'id_card_number', label: 'เลขบัตรประชาชน' },
      { key: 'juristic_number', label: 'เลขนิติบุคคล' },
      { key: 'bank_account_number', label: 'เลขบัญชี' },
      { key: 'bank_name', label: 'ชื่อธนาคาร' }
    ]

    return (
      <div className="space-y-3">
        {fields.map((field) => {
          const oldValue = currentData[field.key]
          const newValue = newData[field.key]
          const hasChanged = oldValue !== newValue

          if (!oldValue && !newValue) return null

          return (
            <div key={field.key} className={`p-3 rounded-lg border ${hasChanged ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-sm font-semibold text-gray-700 mb-2">{field.label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ข้อมูลเดิม:</p>
                  <p className="text-sm text-gray-800">{oldValue || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ข้อมูลใหม่:</p>
                  <p className={`text-sm font-semibold ${hasChanged ? 'text-yellow-700' : 'text-gray-800'}`}>
                    {newValue || '-'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <User className="h-8 w-8 mr-3 text-primary-600" />
            อนุมัติการเปลี่ยนแปลงข้อมูลผู้ใช้
          </h1>
          <p className="text-gray-600 mt-2">ตรวจสอบและอนุมัติคำขอเปลี่ยนแปลงข้อมูล</p>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-6 w-6 text-primary-600" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{request.user_name}</h3>
                      <p className="text-sm text-gray-500">{request.user_email}</p>
                    </div>
                  </div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {request.user_role === 'buyer' ? 'ผู้ซื้อ' : 'ผู้ขาย'}
                  </span>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>รออนุมัติ</span>
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-3">
                  ส่งคำขอเมื่อ: {new Date(request.created_at).toLocaleString('th-TH')}
                </p>
                {renderDataComparison(request.current_data, request.new_data)}
              </div>

              {selectedRequest === request.id ? (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความคิดเห็น (ถ้ามี)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field mb-3"
                    rows="3"
                    placeholder="เพิ่มความคิดเห็น..."
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>อนุมัติ</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
                    >
                      <X className="h-5 w-5" />
                      <span>ปฏิเสธ</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(null)
                        setComment('')
                      }}
                      className="btn-secondary"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end border-t pt-4">
                  <button
                    onClick={() => setSelectedRequest(request.id)}
                    className="btn-primary"
                  >
                    ตรวจสอบและอนุมัติ
                  </button>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีคำขอรอการอนุมัติ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProfileRequests
