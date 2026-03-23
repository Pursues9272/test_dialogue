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
              :class="['option-item', { selected: isOptionSelected(item.question?.id, option.code), disabled: isQuestionAnswered(item.question?.id) && item.question?.type === '单选' }]"
              @click="selectOption(item.question?.id, option.code, option.label, item.question?.type)"
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
        @keyup.enter="handleAction"
        :disabled="isAnswering"
      />
      <div class="send-btn" @click="handleAction">
        <svg v-if="!isAnswering" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        <svg v-else-if="isAnswering && !isCompleted" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        <span v-if="isAnswering" class="btn-text">{{ isCompleted ? '完成' : '下一题' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { sendMessage as sendMessageApi, submitAiSingle } from '@/api/chat'
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

// 用户答案存储 { 题目ID: 答案code[] (多选) 或 答案code (单选) }
const selectedAnswers = ref<Record<number, string | string[]>>({})

// 题目列表（根据接口返回排序）
const questionQueue = ref<Question[]>([])
let currentIndex = 0

// 当前是否在答题状态
const isAnswering = computed(() => questionQueue.value.length > 0 && currentIndex < questionQueue.value.length)

// 解析接口返回数据
// 格式1: "1-m, 2-c, 3-a..." -> {1: 'm', 2: 'c', ...}
// 格式2: "3,4,6,9,10,12,13,14" -> {3: '', 4: '', ...}
const parseAnswerData = (dataStr: string): Record<number, string> => {
  const result: Record<number, string> = {}
  
  // 判断数据格式：如果包含"-"则是格式1，否则是格式2
  const hasDash = dataStr.includes('-')
  
  if (hasDash) {
    // 格式1: "1-m, 2-c, 3-a..."
    const pairs = dataStr.split(',')
    pairs.forEach(pair => {
      const [id, answer] = pair.trim().split('-')
      if (id && answer) {
        result[Number(id)] = answer.trim()
      }
    })
  } else {
    // 格式2: "3,4,6,9,10,12,13,14"
    const ids = dataStr.split(',')
    ids.forEach(id => {
      const num = Number(id.trim())
      if (!isNaN(num)) {
        result[num] = ''
      }
    })
  }
  
  return result
}

// 根据题目ID获取题目详情
const getQuestionById = (id: number): Question | undefined => {
  return questionnaireData.surveyQuestions.find(q => q.id === id)
}

// 判断选项是否被选中
const isOptionSelected = (questionId: number | undefined, code: string): boolean => {
  if (!questionId) return false
  const answer = selectedAnswers.value[questionId]
  if (Array.isArray(answer)) {
    return answer.includes(code)
  }
  return answer === code
}

// 判断题目是否已答题
const isQuestionAnswered = (questionId: number | undefined): boolean => {
  if (!questionId) return false
  return !!selectedAnswers.value[questionId]
}

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  }, 100)
}

// 处理按钮点击/回车
const handleAction = async () => {
  if (isAnswering.value) {
    // 答题状态
    if (isCompleted.value) {
      // 已完成：提交所有答案
      await submitAllAnswers()
    } else {
      // 未完成：提交答案进入下一题
      submitAnswer()
    }
  } else {
    // 非答题状态：发送消息
    await sendMessage()
  }
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
      
      // 清空之前的答案
      selectedAnswers.value = {}
      
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
const selectOption = (questionId: number | undefined, code: string, label: string, questionType?: string) => {
  if (!questionId) return
  
  const currentQuestion = questionQueue.value[currentIndex - 1]
  if (!currentQuestion) return
  
  const type = questionType || currentQuestion.type
  
  // 单选题如果已经答过，不允许再次选择
  if (type === '单选' && isQuestionAnswered(questionId)) {
    return
  }
  
  if (type === '单选') {
    // 单选：直接选中并提交
    selectedAnswers.value[questionId] = code
    
    // 添加用户选择到右侧（只显示标签内容）
    chatList.value.push({
      type: 'user',
      message: label
    })
    
    scrollToBottom()
    
    // 单选自动进入下一题
    setTimeout(() => {
      showNextQuestion()
    }, 500)
  } else {
    // 多选：切换选中状态
    const currentAnswer = selectedAnswers.value[questionId]
    
    if (Array.isArray(currentAnswer)) {
      if (currentAnswer.includes(code)) {
        // 取消选中
        selectedAnswers.value[questionId] = currentAnswer.filter(c => c !== code)
      } else {
        // 添加选中
        selectedAnswers.value[questionId] = [...currentAnswer, code]
      }
    } else {
      // 首次选择多选
      selectedAnswers.value[questionId] = [code]
    }
  }
}

// 提交多选答案
const submitAnswer = () => {
  const currentQuestion = questionQueue.value[currentIndex - 1]
  if (!currentQuestion) return
  
  const questionId = currentQuestion.id
  const answer = selectedAnswers.value[questionId]
  
  if (!answer || (Array.isArray(answer) && answer.length === 0)) {
    console.warn('请先选择答案')
    return
  }
  
  // 获取选中的选项标签
  let answerText = ''
  if (Array.isArray(answer)) {
    const labels = answer.map(code => {
      const option = currentQuestion.options.find(opt => opt.code === code)
      return option?.label || ''
    })
    answerText = labels.join(', ')
  } else {
    const option = currentQuestion.options.find(opt => opt.code === answer)
    answerText = option?.label || ''
  }
  
  // 添加用户选择到右侧
  chatList.value.push({
    type: 'user',
    message: answerText
  })
  
  scrollToBottom()
  
  // 进入下一题
  setTimeout(() => {
    showNextQuestion()
  }, 500)
}

// 提交所有答案
const submitAllAnswers = async () => {
  if (questionQueue.value.length === 0) return
  
  // 构建options参数: 1-a.2-b.3-c
  const optionsParts: string[] = []
  Object.keys(selectedAnswers.value).forEach(questionId => {
    const answer = selectedAnswers.value[Number(questionId)]
    if (answer) {
      const options = Array.isArray(answer) ? answer : [answer]
      const formatted = `${questionId}-${options.join('.')}`
      optionsParts.push(formatted)
    }
  })
  
  try {
    const res = await submitAiSingle({
      options: optionsParts.join('.')
    })
    
    console.log('提交成功:', res)
    
    // 添加提交成功提示
    chatList.value.push({
      type: 'ai',
      message: '提交成功！感谢您的参与。'
    })
    
    scrollToBottom()
  } catch (error) {
    console.error('提交失败:', error)
    
    // 添加提交失败提示
    chatList.value.push({
      type: 'ai',
      message: '提交失败，请稍后重试。'
    })
    
    scrollToBottom()
  }
}

</script>

<style scoped lang="less">
@import './MainView.less';
</style>
