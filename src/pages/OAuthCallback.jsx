import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      // Handle error
      alert('เข้าสู่ระบบผ่าน OAuth ไม่สำเร็จ: ' + error)
      navigate('/login')
      return
    }

    if (token) {
      // Save token to localStorage
      localStorage.setItem('token', token)
      
      // Decode JWT to get user info (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        localStorage.setItem('user', JSON.stringify({
          id: payload.id,
          email: payload.email,
          role: payload.role
        }))

        // Redirect based on role
        if (payload.role === 'admin') {
          navigate('/admin')
        } else if (payload.role === 'seller') {
          navigate('/seller-dashboard')
        } else {
          navigate('/buyer-dashboard')
        }
      } catch (error) {
        console.error('Token decode error:', error)
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  )
}

export default OAuthCallback
