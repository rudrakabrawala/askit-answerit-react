
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, MessageCircle } from 'lucide-react'
import { Question } from '../services/questionService'
import questionService from '../services/questionService'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import VoteButtons from '../components/VoteButtons'
import AnswerCard from '../components/AnswerCard'
import RichTextEditor from '../components/RichTextEditor'
import { formatDistanceToNow } from 'date-fns'

const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState('')
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const [votes, setVotes] = useState(0)

  useEffect(() => {
    if (id) {
      fetchQuestion()
    }
  }, [id])

  const fetchQuestion = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const response = await questionService.getQuestionById(id)
      if (response.success) {
        setQuestion(response.data)
        setVotes(response.data.votes)
      }
    } catch (error) {
      console.error('Error fetching question:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoteQuestion = async (action: 'up' | 'down') => {
    if (!question) return
    
    try {
      await questionService.vote('question', question._id, action)
      setVotes(prev => action === 'up' ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question || !answerContent.trim() || answerContent === '<p><br></p>') return

    setIsSubmittingAnswer(true)
    try {
      const response = await questionService.createAnswer({
        content: answerContent,
        questionId: question._id
      })

      if (response.success) {
        // Add notification for question author
        if (question.author._id !== user?.id) {
          addNotification({
            type: 'answer',
            message: `${user?.name} answered your question "${question.title}"`,
            questionId: question._id,
            userId: user?.id || '',
            userName: user?.name || '',
            read: false
          })
        }

        setAnswerContent('')
        fetchQuestion() // Refresh to get the new answer
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmittingAnswer(false)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!question) return

    try {
      await questionService.acceptAnswer(answerId)
      
      // Update the question state to mark the answer as accepted
      setQuestion(prev => {
        if (!prev) return prev
        return {
          ...prev,
          answers: prev.answers.map(answer => ({
            ...answer,
            isAccepted: answer._id === answerId
          }))
        }
      })

      // Add notification for answer author
      const acceptedAnswer = question.answers.find(a => a._id === answerId)
      if (acceptedAnswer && acceptedAnswer.author._id !== user?.id) {
        addNotification({
          type: 'accepted',
          message: `${user?.name} accepted your answer to "${question.title}"`,
          questionId: question._id,
          answerId: answerId,
          userId: user?.id || '',
          userName: user?.name || '',
          read: false
        })
      }
    } catch (error) {
      console.error('Error accepting answer:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isQuestionOwner = user?.id === question.author._id
  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Question */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-6">
            {/* Vote Buttons */}
            <VoteButtons
              votes={votes}
              onVote={handleVoteQuestion}
            />

            {/* Question Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
              
              <div 
                className="prose prose-lg max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Author and Date */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{question.author.name}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
          </div>

          {question.answers.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No answers yet. Be the first to help!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sort answers: accepted first, then by votes */}
              {question.answers
                .sort((a, b) => {
                  if (a.isAccepted && !b.isAccepted) return -1
                  if (!a.isAccepted && b.isAccepted) return 1
                  return b.votes - a.votes
                })
                .map((answer) => (
                  <AnswerCard
                    key={answer._id}
                    answer={answer}
                    canAccept={isQuestionOwner && !hasAcceptedAnswer}
                    onAccept={handleAcceptAnswer}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {isAuthenticated ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-6">
                <RichTextEditor
                  value={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Provide a detailed answer to help the questioner..."
                  className="min-h-[250px]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingAnswer || !answerContent.trim() || answerContent === '<p><br></p>'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">You need to be logged in to post an answer.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login to Answer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionDetailPage
