const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full animate-pulse`}></div>
        <div className={`${sizeClasses[size]} border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium animate-pulse">กำลังโหลด...</p>
    </div>
  )
}

export default LoadingSpinner
