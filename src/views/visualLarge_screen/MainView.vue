<template>
  <div class="mainView-box">
    <!-- 内容区 -->
    <div class="chat-content" ref="contentRef">
      <div v-for="(item, index) in chatList" :key="index" :class="['chat-item', item.type]">
        <!-- 左侧：AI返回的问题 -->
        <div v-if="item.type === 'ai'" class="chat-bubble ai-bubble">
          <div class="question-title">{{ item.question }}</div>
          <div class="options-list">
            <div 
              v-for="(option, optIndex) in item.options" 
              :key="optIndex" 
              class="option-item"
              @click="selectOption(optIndex)"
            >
              {{ option }}
            </div>
          </div>
        </div>
        <!-- 右侧：用户发送的消息 -->
        <div v-else class="chat-bubble user-bubble">
          {{ item.message }}
        </div>
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

// 聊天记录
interface ChatItem {
  type: 'ai' | 'user'
  message?: string
  question?: string
  options?: string[]
}

const chatList = ref<ChatItem[]>([])
const inputMessage = ref('')
const contentRef = ref<HTMLElement>()

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
    // 接口返回后添加到聊天列表
    chatList.value.push({
      type: 'ai',
      question: res.data?.question || '请问还有什么问题？',
      options: res.data?.options || ['选项A', '选项B', '选项C', '选项D']
    })
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  }, 100)
}

// 选择选项
const selectOption = (index: number) => {
  console.log('选择了选项:', index)
}
</script>

<style scoped lang="less">
@import './MainView.less';
</style>
