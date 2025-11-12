const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 fade-in">
      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 bounce-in">
        <Icon className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
