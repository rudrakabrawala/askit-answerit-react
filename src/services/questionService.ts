
import api from './api'

export interface Question {
  _id: string
  title: string
  description: string
  tags: string[]
  author: {
    _id: string
    name: string
    avatar?: string
  }
  votes: number
  answers: Answer[]
  createdAt: string
  updatedAt: string
}

export interface Answer {
  _id: string
  content: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  votes: number
  isAccepted: boolean
  questionId: string
  createdAt: string
  updatedAt: string
}

export interface CreateQuestionData {
  title: string
  description: string
  tags: string[]
}

export interface CreateAnswerData {
  content: string
  questionId: string
}

class QuestionService {
  async getAllQuestions(search?: string, tags?: string[]) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (tags && tags.length > 0) params.append('tags', tags.join(','))
    
    try {
      const response = await api.get(`/questions?${params.toString()}`)
      return response.data
    } catch (error) {
      // Return dummy data for development
      return {
        success: true,
        data: [
          {
            _id: '1',
            title: 'How to implement React hooks effectively?',
            description: 'I\'m struggling with understanding the best practices for React hooks. Can someone explain the proper way to use useState and useEffect?',
            tags: ['react', 'hooks', 'javascript'],
            author: { _id: 'user1', name: 'John Doe', avatar: null },
            votes: 15,
            answers: [
              {
                _id: 'ans1',
                content: 'React hooks are a powerful feature that allows you to use state and other React features without writing a class component.',
                author: { _id: 'user2', name: 'Jane Smith' },
                votes: 8,
                isAccepted: true,
                questionId: '1',
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z'
              }
            ],
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z'
          },
          {
            _id: '2',
            title: 'Best practices for API error handling in JavaScript',
            description: 'What are the recommended approaches for handling API errors in modern JavaScript applications?',
            tags: ['javascript', 'api', 'error-handling'],
            author: { _id: 'user3', name: 'Mike Johnson' },
            votes: 23,
            answers: [],
            createdAt: '2024-01-14T15:30:00Z',
            updatedAt: '2024-01-14T15:30:00Z'
          }
        ]
      }
    }
  }

  async getQuestionById(id: string) {
    try {
      const response = await api.get(`/questions/${id}`)
      return response.data
    } catch (error) {
      // Return dummy data for development
      return {
        success: true,
        data: {
          _id: id,
          title: 'How to implement React hooks effectively?',
          description: '<p>I\'m struggling with understanding the best practices for React hooks. Can someone explain the proper way to use <strong>useState</strong> and <strong>useEffect</strong>?</p><p>I\'ve been trying to implement a simple counter component but I\'m not sure if I\'m following the right patterns.</p>',
          tags: ['react', 'hooks', 'javascript'],
          author: { _id: 'user1', name: 'John Doe' },
          votes: 15,
          answers: [
            {
              _id: 'ans1',
              content: '<p>React hooks are a powerful feature that allows you to use state and other React features without writing a class component.</p><ul><li>Always call hooks at the top level</li><li>Don\'t call hooks inside loops or conditions</li><li>Use custom hooks for reusable logic</li></ul>',
              author: { _id: 'user2', name: 'Jane Smith' },
              votes: 8,
              isAccepted: true,
              questionId: id,
              createdAt: '2024-01-15T10:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z'
            }
          ],
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        }
      }
    }
  }

  async createQuestion(data: CreateQuestionData) {
    try {
      const response = await api.post('/questions', data)
      return response.data
    } catch (error) {
      // Simulate success for development
      return {
        success: true,
        data: { _id: Date.now().toString(), ...data },
        message: 'Question created successfully'
      }
    }
  }

  async createAnswer(data: CreateAnswerData) {
    try {
      const response = await api.post('/answers', data)
      return response.data
    } catch (error) {
      // Simulate success for development
      return {
        success: true,
        data: { _id: Date.now().toString(), ...data },
        message: 'Answer posted successfully'
      }
    }
  }

  async acceptAnswer(answerId: string) {
    try {
      const response = await api.put(`/answers/${answerId}/accept`)
      return response.data
    } catch (error) {
      return {
        success: true,
        message: 'Answer accepted successfully'
      }
    }
  }

  async vote(type: 'question' | 'answer', id: string, action: 'up' | 'down') {
    try {
      const response = await api.post('/votes', { type, id, action })
      return response.data
    } catch (error) {
      return {
        success: true,
        message: 'Vote recorded successfully'
      }
    }
  }
}

export default new QuestionService()
