<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <h1 class="brand-name">BigScreen Pro</h1>
          <p class="brand-tagline">企业级大屏可视化构建工具</p>
        </div>
        <div class="features-list">
          <div class="feature-item">
            <el-icon><DataLine /></el-icon>
            <span>丰富的图表组件库</span>
          </div>
          <div class="feature-item">
            <el-icon><Connection /></el-icon>
            <span>多数据源实时接入</span>
          </div>
          <div class="feature-item">
            <el-icon><Edit /></el-icon>
            <span>所见即所得编辑器</span>
          </div>
          <div class="feature-item">
            <el-icon><FullScreen /></el-icon>
            <span>一键全屏展示</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-box">
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">请使用您的账号登录</p>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="email">
              <el-input
                v-model="loginForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" @click="handleForgotPassword">
                忘记密码？
              </el-link>
            </div>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="userStore.loading"
                @click="handleLogin"
              >
                {{ userStore.loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-register">
            <span>还没有账号？</span>
            <el-link type="primary" @click="handleRegister">
              立即注册
            </el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Message, Lock, DataLine, Connection, Edit, FullScreen } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const rememberMe = ref(false)

const loginForm = reactive({
  email: 'demo@bigscreen.pro',
  password: 'Demo123456'
})

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()

    const success = await userStore.login({
      email: loginForm.email,
      password: loginForm.password
    })

    if (success) {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('登录失败:', error)
  }
}

const handleRegister = () => {
  ElMessage.info('注册功能即将推出')
}

const handleForgotPassword = () => {
  ElMessage.info('密码重置功能即将推出')
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 480px;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

// Left Side
.login-left {
  padding: 60px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light-2) 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand {
  .brand-name {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .brand-tagline {
    font-size: 16px;
    opacity: 0.9;
  }
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  
  .el-icon {
    font-size: 20px;
  }
}

// Right Side
.login-right {
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-box {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.login-form {
  .el-input {
    --el-input-height: 44px;
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 14px;
  }
  
  .login-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
}

.login-register {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  
  .el-link {
    margin-left: 4px;
  }
}

// Responsive
@media (max-width: 992px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
  
  .login-left {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-right {
    padding: 40px 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
}
</style>