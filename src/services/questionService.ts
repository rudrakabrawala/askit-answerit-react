import { supabase } from '@/integrations/supabase/client'

export interface Question {
  id: string
  title: string
  description: string
  tags: string[]
  author_id: string
  author_username: string
  created_at: string
  updated_at: string
  vote_count?: number
  answer_count?: number
  has_accepted_answer?: boolean
}

export interface Answer {
  id: string
  content: string
  question_id: string
  author_id: string
  author_username: string
  is_accepted: boolean
  created_at: string
  updated_at: string
  vote_count?: number
}

export interface Vote {
  id: string
  user_id: string
  target_id: string
  target_type: 'question' | 'answer'
  vote_type: 'up' | 'down'
  created_at: string
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
  async getVoteCount(targetType: 'question' | 'answer', targetId: string): Promise<number> {
    try {
      const { data: upVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('vote_type', 'up')

      const { data: downVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('vote_type', 'down')

      return (upVotes?.length || 0) - (downVotes?.length || 0)
    } catch (error) {
      return 0
    }
  }

  async getAnswerCount(questionId: string): Promise<number> {
    try {
      const { data } = await supabase
        .from('answers')
        .select('*', { count: 'exact' })
        .eq('question_id', questionId)
      
      return data?.length || 0
    } catch (error) {
      return 0
    }
  }

  async hasAcceptedAnswer(questionId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', questionId)
        .eq('is_accepted', true)
        .maybeSingle()
      
      return !!data
    } catch (error) {
      return false
    }
  }

  async getAllQuestions(search?: string, tags?: string[], unanswered?: boolean, page: number = 1, limit: number = 20) {
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags)
      }

      if (unanswered) {
        const { data: questionIds } = await supabase
          .from('answers')
          .select('question_id')
        
        const answeredIds = questionIds?.map(a => a.question_id) || []
        if (answeredIds.length > 0) {
          query = query.not('id', 'in', `(${answeredIds.join(',')})`)
        }
      }

      const { data, error, count } = await query

      if (error) throw error

      // Get vote counts and answer counts for each question
      const questionsWithCounts = await Promise.all(
        (data || []).map(async (question) => {
          const [voteCount, answerCount, hasAccepted] = await Promise.all([
            this.getVoteCount('question', question.id),
            this.getAnswerCount(question.id),
            this.hasAcceptedAnswer(question.id)
          ])

          return {
            ...question,
            vote_count: voteCount,
            answer_count: answerCount,
            has_accepted_answer: hasAccepted
          }
        })
      )

      return {
        success: true,
        data: questionsWithCounts,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      return {
        success: false,
        data: [],
        error: 'Failed to fetch questions'
      }
    }
  }

  async getQuestionById(id: string) {
    try {
      const { data: question, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const [voteCount, answers] = await Promise.all([
        this.getVoteCount('question', id),
        this.getAnswersForQuestion(id)
      ])

      return {
        success: true,
        data: {
          ...question,
          vote_count: voteCount,
          answers: answers.data || []
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      return {
        success: false,
        error: 'Question not found'
      }
    }
  }

  async getAnswersForQuestion(questionId: string) {
    try {
      const { data: answers, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)
        .order('is_accepted', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error

      const answersWithVotes = await Promise.all(
        (answers || []).map(async (answer) => {
          const voteCount = await this.getVoteCount('answer', answer.id)
          return {
            ...answer,
            vote_count: voteCount
          }
        })
      )

      return {
        success: true,
        data: answersWithVotes
      }
    } catch (error) {
      console.error('Error fetching answers:', error)
      return {
        success: false,
        data: [],
        error: 'Failed to fetch answers'
      }
    }
  }

  async createQuestion(data: CreateQuestionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          title: data.title,
          description: data.description,
          tags: data.tags,
          author_id: user.id,
          author_username: profile.username
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: question
      }
    } catch (error) {
      console.error('Error creating question:', error)
      return {
        success: false,
        error: 'Failed to create question'
      }
    }
  }

  async createAnswer(data: CreateAnswerData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { data: answer, error } = await supabase
        .from('answers')
        .insert({
          content: data.content,
          question_id: data.questionId,
          author_id: user.id,
          author_username: profile.username
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for question author
      const { data: question } = await supabase
        .from('questions')
        .select('author_id, title')
        .eq('id', data.questionId)
        .single()

      if (question && question.author_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: question.author_id,
            type: 'answer',
            message: `${profile.username} answered your question "${question.title}"`,
            question_id: data.questionId,
            answer_id: answer.id,
            from_user_id: user.id,
            from_username: profile.username
          })
      }

      return {
        success: true,
        data: answer
      }
    } catch (error) {
      console.error('Error creating answer:', error)
      return {
        success: false,
        error: 'Failed to create answer'
      }
    }
  }

  async voteOnTarget(targetType: 'question' | 'answer', targetId: string, voteType: 'up' | 'down') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .maybeSingle()

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Update vote if different type
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            target_id: targetId,
            target_type: targetType,
            vote_type: voteType
          })
      }

      return { success: true }
    } catch (error) {
      console.error('Error voting:', error)
      return {
        success: false,
        error: 'Failed to vote'
      }
    }
  }

  async acceptAnswer(answerId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: answer } = await supabase
        .from('answers')
        .select('question_id')
        .eq('id', answerId)
        .single()

      if (!answer) throw new Error('Answer not found')

      // Check if user owns the question
      const { data: question } = await supabase
        .from('questions')
        .select('author_id')
        .eq('id', answer.question_id)
        .single()

      if (!question || question.author_id !== user.id) {
        throw new Error('Only question author can accept answers')
      }

      // Unaccept all other answers for this question
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', answer.question_id)

      // Accept this answer
      await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId)

      return { success: true }
    } catch (error) {
      console.error('Error accepting answer:', error)
      return {
        success: false,
        error: 'Failed to accept answer'
      }
    }
  }

  async deleteQuestion(questionId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const { data: question } = await supabase
        .from('questions')
        .select('author_id')
        .eq('id', questionId)
        .single()

      if (!question) throw new Error('Question not found')

      // Check if user owns question or is admin
      if (question.author_id !== user.id && profile?.role !== 'admin') {
        throw new Error('Not authorized to delete this question')
      }

      await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      return { success: true }
    } catch (error) {
      console.error('Error deleting question:', error)
      return {
        success: false,
        error: 'Failed to delete question'
      }
    }
  }

  async deleteAnswer(answerId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const { data: answer } = await supabase
        .from('answers')
        .select('author_id')
        .eq('id', answerId)
        .single()

      if (!answer) throw new Error('Answer not found')

      // Check if user owns answer or is admin
      if (answer.author_id !== user.id && profile?.role !== 'admin') {
        throw new Error('Not authorized to delete this answer')
      }

      await supabase
        .from('answers')
        .delete()
        .eq('id', answerId)

      return { success: true }
    } catch (error) {
      console.error('Error deleting answer:', error)
      return {
        success: false,
        error: 'Failed to delete answer'
      }
    }
  }
}

export default new QuestionService()