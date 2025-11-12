import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { MessageCircle, Send, ArrowLeft, Package, User, Clock } from 'lucide-react'
import axios from 'axios'

const Chat = () => {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 3 seconds (only if not completed)
    const interval = setInterval(() => {
      if (paymentStatus !== 'completed') {
        fetchMessages()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [paymentId, paymentStatus])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/payment/${paymentId}`)
      setMessages(response.data.messages)
      setPaymentStatus(response.data.payment_status)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      if (error.response?.status === 403) {
        alert('ยังไม่สามารถใช้แชทได้ รอแอดมินยืนยันการชำระเงินก่อน')
        navigate(-1)
      }
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await axios.post(`/api/messages/payment/${paymentId}`, {
        message: newMessage
      })
      
      setMessages([...messages, response.data])
      setNewMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('ไม่สามารถส่งข้อความได้')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return 'เมื่อสักครู่'
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อความ...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/chats')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>กลับไปรายการแชท</span>
          </button>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    แชทเกี่ยวกับคำสั่งซื้อ
                  </h1>
                  <p className="text-sm text-gray-600">
                    Payment ID: #{paymentId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 card flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="h-16 w-16 mb-4" />
                <p className="text-lg">ยังไม่มีข้อความ</p>
                <p className="text-sm">เริ่มต้นการสนทนาได้เลย</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.sender_id === user.id
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {!isOwnMessage && (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500 font-medium">
                          {isOwnMessage ? 'คุณ' : msg.sender_name}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4">
            {paymentStatus === 'completed' ? (
              <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
                <p className="text-gray-600">
                  🔒 การซื้อขายเสร็จสิ้นแล้ว ไม่สามารถส่งข้อความได้
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  นี่คือประวัติการสนทนาเท่านั้น
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 input-field"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-primary px-6 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                  <span>ส่ง</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
