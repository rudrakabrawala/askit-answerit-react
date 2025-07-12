
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import QuestionCard from '../components/QuestionCard'
import SearchBar from '../components/SearchBar'
import { Question } from '../services/questionService'
import questionService from '../services/questionService'
import { useAuthStore } from '../store/useAuthStore'

const HomePage = () => {
  const { isAuthenticated } = useAuthStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Comprehensive tags covering all features and technologies
  const availableTags = [
    'react', 'javascript', 'typescript', 'nodejs', 'express', 
    'mongodb', 'mysql', 'postgresql', 'python', 'django', 'fastapi',
    'css', 'html', 'tailwind', 'bootstrap', 'sass',
    'vue', 'angular', 'svelte', 'nextjs', 'nuxt',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'jwt', 'authentication', 'authorization', 'security', 'oauth',
    'api', 'rest', 'graphql', 'grpc', 'websockets',
    'redis', 'elasticsearch', 'rabbitmq', 'kafka',
    'microservices', 'architecture', 'design-patterns',
    'testing', 'jest', 'cypress', 'playwright',
    'git', 'github', 'gitlab', 'ci-cd', 'devops',
    'performance', 'optimization', 'caching',
    'mobile', 'ios', 'android', 'react-native', 'flutter',
    'machine-learning', 'ai', 'data-science',
    'blockchain', 'web3', 'solidity',
    'frontend', 'backend', 'fullstack',
    'hooks', 'context', 'redux', 'zustand', 'state-management',
    'routing', 'forms', 'validation',
    'build-tools', 'webpack', 'vite', 'rollup',
    'deployment', 'hosting', 'cdn',
    'database', 'orm', 'sql', 'nosql',
    'async', 'promises', 'async-await',
    'error-handling', 'debugging', 'logging',
    'responsive', 'mobile-first', 'accessibility',
    'seo', 'pwa', 'service-workers',
    'unit-testing', 'integration-testing', 'e2e-testing'
  ].sort()

  useEffect(() => {
    fetchQuestions()
  }, [searchTerm, selectedTags])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const response = await questionService.getAllQuestions(searchTerm, selectedTags)
      if (response.success) {
        setQuestions(response.data)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => question.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
            <p className="text-gray-600 mt-2">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} 
              {selectedTags.length > 0 && (
                <span className="ml-2">
                  filtered by: <strong>{selectedTags.join(', ')}</strong>
                </span>
              )}
            </p>
          </div>
          {isAuthenticated && (
            <Link
              to="/ask"
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Ask Question</span>
            </Link>
          )}
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by title, content, or technology (e.g., 'React hooks', 'JWT authentication')..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              <span>Technology Filters</span>
              {selectedTags.length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {selectedTags.length}
                </span>
              )}
            </button>
          </div>

          {/* Comprehensive Tag Filters */}
          {(showFilters || selectedTags.length > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Filter by Technologies & Topics:</h3>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all ({selectedTags.length})
                  </button>
                )}
              </div>
              
              {/* Popular Tags First */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Popular Technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {['react', 'javascript', 'typescript', 'nodejs', 'python', 'css', 'mongodb', 'api', 'docker', 'aws'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Tags */}
              <div>
                <p className="text-xs text-gray-500 mb-2">All Tags:</p>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 text-lg mb-2">
                {searchTerm || selectedTags.length > 0 ? 'No questions match your search' : 'No questions found'}
              </p>
              {searchTerm || selectedTags.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-gray-500">Try adjusting your search criteria:</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear search term
                      </button>
                    )}
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear tag filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-gray-500 mb-4">Be the first to ask a question!</p>
                  {isAuthenticated ? (
                    <Link
                      to="/ask"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Ask the First Question</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <span>Login to Ask Questions</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results summary */}
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredQuestions.length} of {questions.length} questions
              {(searchTerm || selectedTags.length > 0) && (
                <span className="ml-2 font-medium">
                  {searchTerm && `matching "${searchTerm}"`}
                  {searchTerm && selectedTags.length > 0 && ' '}
                  {selectedTags.length > 0 && `tagged with: ${selectedTags.join(', ')}`}
                </span>
              )}
            </div>
            
            {/* Question Cards */}
            {filteredQuestions.map(question => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
