
import { ArrowUp, ArrowDown, Check, User, Calendar } from 'lucide-react'
import { Answer } from '../services/questionService'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../store/useAuthStore'
import questionService from '../services/questionService'
import { useState } from 'react'

interface Props {
  answer: Answer
  canAccept: boolean
  onAccept?: (answerId: string) => void
  onVote?: (answerId: string, action: 'up' | 'down') => void
}

const AnswerCard = ({ answer, canAccept, onAccept, onVote }: Props) => {
  const { isAuthenticated } = useAuthStore()
  const [votes, setVotes] = useState(answer.votes)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (action: 'up' | 'down') => {
    if (!isAuthenticated || isVoting) return
    
    setIsVoting(true)
    try {
      await questionService.vote('answer', answer._id, action)
      setVotes(prev => action === 'up' ? prev + 1 : prev - 1)
      onVote?.(answer._id, action)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleAccept = () => {
    onAccept?.(answer._id)
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${answer.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-start space-x-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => handleVote('up')}
            disabled={!isAuthenticated || isVoting}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowUp className="h-5 w-5 text-gray-600 hover:text-green-600" />
          </button>
          <span className="text-lg font-semibold text-gray-700">{votes}</span>
          <button
            onClick={() => handleVote('down')}
            disabled={!isAuthenticated || isVoting}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDown className="h-5 w-5 text-gray-600 hover:text-red-600" />
          </button>
          
          {/* Accept button */}
          {canAccept && !answer.isAccepted && (
            <button
              onClick={handleAccept}
              className="p-2 rounded-full hover:bg-green-100 transition-colors"
              title="Accept this answer"
            >
              <Check className="h-5 w-5 text-gray-400 hover:text-green-600" />
            </button>
          )}
          
          {/* Accepted badge */}
          {answer.isAccepted && (
            <div className="p-2 rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          )}
        </div>

        {/* Answer content */}
        <div className="flex-1 min-w-0">
          {answer.isAccepted && (
            <div className="flex items-center space-x-2 mb-3">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Accepted Answer</span>
            </div>
          )}
          
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          {/* Author and date */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span>{answer.author.name}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnswerCard
