<template>
  <div class="mainView-box">
    <!-- 内容区 -->
    <div class="chat-content" ref="contentRef">
      <div v-for="(item, index) in chatList" :key="index" :class="['chat-item', item.type]">
        <!-- 左侧：题目 -->
        <div v-if="item.type === 'ai'" class="chat-bubble ai-bubble">
          <div class="question-title">{{ item.question?.title }}</div>
          <div class="question-type">题型：{{ item.question?.type }}</div>
          <div class="options-list">
            <div 
              v-for="(option, optIndex) in item.question?.options" 
              :key="optIndex" 
              :class="['option-item', { selected: item.question?.id && selectedAnswers[item.question.id] === option.code }]"
              @click="selectOption(item.question?.id, option.code, option.label)"
            >
              <span class="option-code">{{ option.code }}.</span>
              <span class="option-label">{{ option.label }}</span>
            </div>
          </div>
        </div>
        <!-- 右侧：用户选择的答案 -->
        <div v-else class="chat-bubble user-bubble">
          <div class="user-answer">{{ item.message }}</div>
        </div>
      </div>
      
      <!-- 完成提示 -->
      <div v-if="isCompleted" class="completion-tip">
        <div class="tip-icon">✓</div>
        <div class="tip-text">所有题目已完成，感谢您的参与！</div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <input 
        v-model="inputMessage" 
        class="message-input" 
        placeholder="请输入问题..."
        @keyup.enter="sendMessage"
      />
      <div class="send-btn" @click="sendMessage">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendMessage as sendMessageApi } from '@/api/chat'
import questionnaireData from './questionnaire.json'

// 题目选项
interface Option {
  code: string
  label: string
}

// 问卷题目
interface Question {
  id: number
  title: string
  type: string
  options: Option[]
}

// 聊天记录
interface ChatItem {
  type: 'ai' | 'user'
  message?: string
  question?: Question
}

const chatList = ref<ChatItem[]>([])
const inputMessage = ref('')
const contentRef = ref<HTMLElement>()
const isCompleted = ref(false)

// 用户答案存储 { 题目ID: 答案code }
const selectedAnswers = ref<Record<number, string>>({})

// 题目列表（根据接口返回排序）
const questionQueue = ref<Question[]>([])
let currentIndex = 0

// 解析接口返回数据 "1-m, 2-c, 3-a..." -> {1: 'm', 2: 'c', ...}
const parseAnswerData = (dataStr: string): Record<number, string> => {
  const result: Record<number, string> = {}
  const pairs = dataStr.split(',')
  pairs.forEach(pair => {
    const [id, answer] = pair.trim().split('-')
    if (id && answer) {
      result[Number(id)] = answer.trim()
    }
  })
  return result
}

// 根据题目ID获取题目详情
const getQuestionById = (id: number): Question | undefined => {
  return questionnaireData.surveyQuestions.find(q => q.id === id)
}

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  }, 100)
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  // 添加用户消息到右侧
  chatList.value.push({
    type: 'user',
    message: inputMessage.value
  })

  const userMsg = inputMessage.value
  inputMessage.value = ''

  // 滚动到底部
  scrollToBottom()

  try {
    // 调用真实接口
    const res = await sendMessageApi(userMsg)
    
    if (res.data) {
      // 解析返回的答案数据
      const answerMap = parseAnswerData(res.data)
      
      // 根据答案顺序排列题目
      const sortedQuestions: Question[] = []
      Object.keys(answerMap).forEach(id => {
        const question = getQuestionById(Number(id))
        if (question) {
          sortedQuestions.push(question)
        }
      })
      
      questionQueue.value = sortedQuestions
      currentIndex = 0
      
      // 显示第一题
      if (sortedQuestions.length > 0) {
        showNextQuestion()
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

// 显示下一题
const showNextQuestion = () => {
  if (currentIndex < questionQueue.value.length) {
    const question = questionQueue.value[currentIndex]
    chatList.value.push({
      type: 'ai',
      question
    })
    currentIndex++
    scrollToBottom()
  } else {
    // 所有题目完成
    isCompleted.value = true
    scrollToBottom()
  }
}

// 选择答案
const selectOption = (questionId: number | undefined, code: string, label: string) => {
  if (!questionId) return
  
  // 防止重复选择
  if (selectedAnswers.value[questionId]) return
  
  // 记录答案
  selectedAnswers.value[questionId] = code
  
  // 添加用户选择到右侧
  chatList.value.push({
    type: 'user',
    message: `${code}. ${label}`
  })
  
  scrollToBottom()
  
  // 延迟1.5秒后自动显示下一题
  setTimeout(() => {
    showNextQuestion()
  }, 1500)
}
</script>

<style scoped lang="less">
@import './MainView.less';
</style>
