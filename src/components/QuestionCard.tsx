
import { Link } from 'react-router-dom'
import { MessageCircle, ArrowUp, Calendar, User } from 'lucide-react'
import { Question } from '../services/questionService'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  question: Question
}

const QuestionCard = ({ question }: Props) => {
  // Strip HTML tags for preview
  const getTextPreview = (html: string, maxLength: number = 150) => {
    const div = document.createElement('div')
    div.innerHTML = html
    const text = div.textContent || div.innerText || ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            to={`/question/${question._id}`}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {question.title}
          </Link>
          <p className="text-gray-600 mt-2 leading-relaxed">
            {getTextPreview(question.description)}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center space-y-2 ml-6">
          <div className="flex items-center space-x-1 text-gray-500">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm font-medium">{question.votes}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{question.answers.length}</span>
          </div>
        </div>
      </div>

      {/* Author and Date */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
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
  )
}

export default QuestionCard
