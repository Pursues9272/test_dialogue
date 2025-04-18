import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const headCount = ref(1)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
    headCount.value++
  }

  return { count, headCount, doubleCount, increment }
})
