import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideHeader: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard/index.vue'),
    meta: {
      title: '仪表盘管理',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard/editor/:id?',
    name: 'DashboardEditor',
    component: () => import('@/views/Dashboard/Editor/index.vue'),
    meta: {
      title: '仪表盘编辑器',
      requiresAuth: true
    }
  },
  {
    path: '/data-source',
    name: 'DataSource',
    component: () => import('@/views/DataSource/index.vue'),
    meta: {
      title: '数据源管理',
      requiresAuth: true
    }
  },
  {
    path: '/preview/:id',
    name: 'Preview',
    component: () => import('@/views/Preview/index.vue'),
    meta: {
      title: '预览',
      requiresAuth: false
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false
    }
  },
  {
    path: '/test-charts',
    name: 'TestCharts',
    component: () => import('@/views/TestCharts/index.vue'),
    meta: {
      title: '图表测试',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'BigScreen Pro'}`
  
  const userStore = useUserStore()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    // 已登录用户访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router