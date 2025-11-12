import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

const Toast = ({ type = 'success', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const types = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-200',
      textColor: 'text-green-50'
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500 to-pink-600',
      borderColor: 'border-red-200',
      textColor: 'text-red-50'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'from-yellow-500 to-orange-600',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-50'
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-50'
    }
  }

  const config = types[type] || types.info
  const Icon = config.icon

  return (
    <div className="fixed top-20 right-6 z-50 notification-enter">
      <div className={`bg-gradient-to-r ${config.bgColor} ${config.textColor} px-6 py-4 rounded-xl shadow-2xl border-2 ${config.borderColor} backdrop-blur-sm flex items-center space-x-3 max-w-md`}>
        <Icon className="h-6 w-6 flex-shrink-0 animate-bounce" />
        <p className="font-semibold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default Toast
