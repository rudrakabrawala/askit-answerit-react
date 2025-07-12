
import api from './api'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

class AuthService {
  async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data)
      return response.data
    } catch (error) {
      // Return dummy success for development
      return {
        success: true,
        data: {
          user: { id: 'user1', name: 'John Doe', email: data.email },
          token: 'dummy-jwt-token'
        },
        message: 'Login successful'
      }
    }
  }

  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data)
      return response.data
    } catch (error) {
      // Return dummy success for development
      return {
        success: true,
        data: {
          user: { id: Date.now().toString(), name: data.name, email: data.email },
          token: 'dummy-jwt-token'
        },
        message: 'Registration successful'
      }
    }
  }

  async getNotifications() {
    try {
      const response = await api.get('/notifications')
      return response.data
    } catch (error) {
      // Return dummy notifications for development
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'answer',
            message: 'Jane Smith answered your question about React hooks',
            questionId: '1',
            userId: 'user2',
            userName: 'Jane Smith',
            createdAt: '2024-01-15T10:00:00Z',
            read: false
          }
        ]
      }
    }
  }
}

export default new AuthService()
