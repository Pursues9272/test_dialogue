import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useCounterStore } from '@/stores/counter'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '/main-view',
          name: 'MainView',
          meta: {
            title: '首页'
          },
          component: () => import('../views/visualLarge_screen/MainView.vue')
        }
      ]
    },
  ]
})
router.beforeEach((to, from, next) => {
  const counterStore = useCounterStore()
  console.log('路由信息1=>', counterStore.headCount)
  counterStore.increment()
  next()
})

// router.beforeResolve((to, from, next) => {
//   console.log("路由信息1.5=>", to, from, next);
//   next();
// })

// router.afterEach((to, from) => {
//   console.log("路由信息2=>", to, from);
// })

export default router
