import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import HomeView from '@/views/HomeView.vue'
import ProductsView from '@/views/ProductsView.vue'
import VentasView from '@/views/VentasView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? '/dashboard' : '/login'
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView
      },
      {
        path: 'products',
        name: 'Products',
        component: ProductsView,
      },
      {
        path: 'sales',
        name: 'Sales',
        component: VentasView,
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  await authStore.initializeAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router;
