import request from './request'

// 提交单个AI问答
export const submitAiSingle = (data: {
  answers?: string
  options?: string
  tongueCode?: string
}) => {
  return request.post('/api/v1/ai/ask/single', data)
}

// 发送消息，获取AI回答
export const sendMessage = (content: string) => {
  return request.get('/api/v1/ai/ask', {
    params: { code: '1', content }
  })
}

// 选择选项
export const selectOption = (questionId: string, optionIndex: number) => {
  return request.post('/chat/select', { questionId, optionIndex })
}

