
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor'
import TagInput from '../components/TagInput'
import questionService from '../services/questionService'
import { useNotificationStore } from '../store/useNotificationStore'

const AskQuestionPage = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotificationStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{title?: string, description?: string, tags?: string}>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }
    
    if (!description.trim() || description === '<p><br></p>') {
      newErrors.description = 'Description is required'
    } else if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const response = await questionService.createQuestion({
        title: title.trim(),
        description,
        tags
      })
      
      if (response.success) {
        addNotification({
          type: 'answer',
          message: 'Your question has been posted successfully!',
          questionId: response.data._id,
          userId: 'system',
          userName: 'System',
          read: false
        })
        navigate('/')
      }
    } catch (error) {
      console.error('Error creating question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
          <p className="text-gray-600 mt-2">
            Get help from the community by asking a detailed question
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Be specific and imagine you're asking a question to another person"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Description *
            </label>
            <div className={`border rounded-lg ${errors.description ? 'border-red-300' : 'border-gray-300'}`}>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Provide detailed information about your question. Include what you've tried and what specific help you need."
                className="min-h-[300px]"
              />
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Use the toolbar to format your question with code blocks, lists, and links
            </p>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add up to 5 tags to describe your question (press Enter or comma to add)"
            />
            {errors.tags && (
              <p className="mt-2 text-sm text-red-600">{errors.tags}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Add tags like 'javascript', 'react', 'css' to help others find your question
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for asking a great question:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Make your title specific and descriptive</li>
            <li>• Include relevant code snippets or error messages</li>
            <li>• Explain what you've already tried</li>
            <li>• Use proper tags to help others find your question</li>
            <li>• Be respectful and provide context</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AskQuestionPage
