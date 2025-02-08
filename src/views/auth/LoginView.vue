<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { authApi } from '@/api'
import type { LoginRequest } from '@/types/api'
import { VueLogo } from '@/components/icons'
import { useUserStore } from '@/stores'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const resetFormRef = ref<FormInstance>()

// 登录表单状态
const formState = reactive<LoginRequest>({
  username: '',
  password: ''
})

const loading = ref(false)
const rememberMe = ref(false)

// 忘记密码相关状态
const forgotPasswordVisible = ref(false)
const resetLoading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const resetFormState = reactive({
  email: '',
  verification_code: '',
  new_password: '',
  confirm_password: ''
})

// 登录表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名或邮箱' }],
  password: [{ required: true, message: '请输入密码' }]
}

// 重置密码表单验证规则
const resetRules = {
  email: [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  verification_code: [{ required: true, message: '请输入验证码' }],
  new_password: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能小于6位' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码' },
    {
      validator: async (_rule: any, value: string) => {
        if (value !== resetFormState.new_password) {
          throw new Error('两次输入的密码不一致')
        }
      }
    }
  ]
}

// 登录处理
const handleSubmit = async () => {
  try {
    loading.value = true
    const response = await authApi.login(formState)

    // 保存用户信息到 store
    userStore.setUserInfo({
      token: response.access_token,
      userRole: response.user.role,
      userName: response.user.name,
      userId: response.user.id.toString()
    })

    message.success('登录成功')
    router.push('/welcome') // 登录成功后跳转到欢迎页面
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// 显示忘记密码弹窗
const showForgotPasswordModal = () => {
  forgotPasswordVisible.value = true
  resetFormState.email = ''
  resetFormState.verification_code = ''
  resetFormState.new_password = ''
  resetFormState.confirm_password = ''
}

// 发送重置密码验证码
const handleSendResetCode = async () => {
  try {
    await resetFormRef.value?.validateFields(['email'])
    sendingCode.value = true

    await authApi.sendResetCode(resetFormState.email)
    message.success('验证码已发送到您的邮箱')

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('Send reset code error:', error)
  } finally {
    sendingCode.value = false
  }
}

// 重置密码
const handleResetPassword = async () => {
  try {
    await resetFormRef.value?.validate()
    resetLoading.value = true

    await authApi.resetPassword({
      email: resetFormState.email,
      verification_code: resetFormState.verification_code,
      new_password: resetFormState.new_password
    })

    message.success('密码重置成功，请使用新密码登录')
    forgotPasswordVisible.value = false
  } catch (error) {
    console.error('Reset password error:', error)
  } finally {
    resetLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <VueLogo class="logo" />
        <h1 class="title">新生入学可视化系统</h1>
      </div>

      <a-form
        :model="formState"
        @finish="handleSubmit"
        layout="vertical"
        :rules="rules"
      >
        <a-form-item label="用户名/邮箱" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入用户名或邮箱">
            <template #prefix>
              <user-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码">
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="form-footer">
          <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
          <a @click="showForgotPasswordModal">忘记密码？</a>
        </div>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
          >
            登录
          </a-button>
        </a-form-item>

        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </a-form>
    </div>

    <!-- 忘记密码 Modal -->
    <a-modal
      v-model:visible="forgotPasswordVisible"
      title="重置密码"
      @ok="handleResetPassword"
      :confirmLoading="resetLoading"
      :maskClosable="false"
    >
      <a-form
        :model="resetFormState"
        layout="vertical"
        ref="resetFormRef"
        :rules="resetRules"
      >
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="resetFormState.email">
            <template #prefix>
              <mail-outlined />
            </template>
            <template #suffix>
              <a-button
                type="link"
                size="small"
                :disabled="countdown > 0"
                :loading="sendingCode"
                @click="handleSendResetCode"
                style="margin: -7px -11px"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </a-button>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="验证码" name="verification_code">
          <a-input v-model:value="resetFormState.verification_code">
            <template #prefix>
              <safety-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="新密码" name="new_password">
          <a-input-password v-model:value="resetFormState.new_password">
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item label="确认新密码" name="confirm_password">
          <a-input-password v-model:value="resetFormState.confirm_password">
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  background-image: url('@/assets/images/login_bg.svg');
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 100%;
}

.login-content {
  width: 100%;
  max-width: 400px;
  padding: 32px 24px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.5s ease-in-out;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .title {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #1f1f1f;
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
}

:deep(.ant-input-affix-wrapper) {
  .anticon {
    color: rgba(0, 0, 0, 0.45);
  }
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
