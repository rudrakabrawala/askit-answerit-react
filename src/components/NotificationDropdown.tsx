
import { useNotificationStore } from '../store/useNotificationStore'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'

interface Props {
  onClose: () => void
}

const NotificationDropdown = ({ onClose }: Props) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore()

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-center text-gray-500 text-sm">
          No notifications yet
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {notification.questionId ? (
                    <Link
                      to={`/question/${notification.questionId}`}
                      onClick={() => {
                        handleMarkAsRead(notification.id)
                        onClose()
                      }}
                      className="text-sm text-gray-900 hover:text-blue-600"
                    >
                      {notification.message}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-900">{notification.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
