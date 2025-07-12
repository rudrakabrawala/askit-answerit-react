
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

interface Props {
  votes: number
  onVote: (action: 'up' | 'down') => void
  disabled?: boolean
}

const VoteButtons = ({ votes, onVote, disabled = false }: Props) => {
  const { isAuthenticated } = useAuthStore()
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (action: 'up' | 'down') => {
    if (!isAuthenticated || disabled || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote(action)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => handleVote('up')}
        disabled={!isAuthenticated || disabled || isVoting}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowUp className="h-6 w-6 text-gray-600 hover:text-green-600" />
      </button>
      <span className="text-xl font-semibold text-gray-700">{votes}</span>
      <button
        onClick={() => handleVote('down')}
        disabled={!isAuthenticated || disabled || isVoting}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowDown className="h-6 w-6 text-gray-600 hover:text-red-600" />
      </button>
    </div>
  )
}

export default VoteButtons
