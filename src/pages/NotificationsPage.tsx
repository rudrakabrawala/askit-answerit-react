
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useNotificationStore } from '../store/useNotificationStore'
import authService from '../services/authService'
import { formatDistanceToNow } from 'date-fns'

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, setNotifications } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await authService.getNotifications()
      if (response.success) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return '💬'
      case 'comment':
        return '💭'
      case 'mention':
        return '📢'
      case 'accepted':
        return '✅'
      default:
        return '🔔'
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600 mb-6">
              You'll see notifications here when someone interacts with your questions or answers.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Questions
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Unread ({unreadNotifications.length})
                </h2>
                <div className="space-y-3">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {notification.questionId ? (
                            <Link
                              to={`/question/${notification.questionId}`}
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <p className="font-medium">{notification.message}</p>
                            </Link>
                          ) : (
                            <p className="font-medium text-gray-900">{notification.message}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                          title="Mark as read"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div>
                {unreadNotifications.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-8">
                    Read ({readNotifications.length})
                  </h2>
                )}
                <div className="space-y-3">
                  {readNotifications.slice(0, 20).map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl flex-shrink-0 opacity-60">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {notification.questionId ? (
                            <Link
                              to={`/question/${notification.questionId}`}
                              className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <p className="font-medium">{notification.message}</p>
                            </Link>
                          ) : (
                            <p className="font-medium text-gray-700">{notification.message}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {readNotifications.length > 20 && (
                  <p className="text-center text-gray-500 mt-4">
                    Showing recent 20 notifications
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
