<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi } from '@/api'
import type { RegisterRequest } from '@/types/api'
import { provinces } from '@/constants/provinces'
import { VueLogo } from '@/components/icons'


const router = useRouter()
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const allowRegister = ref(false)
const formState = reactive<RegisterRequest & { confirmPassword: string }>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  name: '',
  verification_code: '',
  contact: '',
  province: '',
  gender: 'M'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 4, message: '用户名至少4个字符' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: async (_rule: any, value: string) => {
        if (value !== formState.password) {
          throw new Error('两次输入的密码不一致')
        }
      }
    }
  ],
  name: [{ required: true, message: '请输入姓名' }],
  verification_code: [{ required: true, message: '请输入验证码' }]
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendCode = async () => {
  try {
    if (!formState.email) {
      message.error('请先输入邮箱')
      return
    }
    sendingCode.value = true
    await authApi.sendVerification(formState.email)
    message.success('验证码已发送')
    startCountdown()
  } catch (error) {
    console.error('Send code error:', error)
  } finally {
    sendingCode.value = false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    const registerData = {
      username: formState.username,
      email: formState.email,
      password: formState.password,
      role: formState.role,
      name: formState.name,
      verification_code: formState.verification_code,
      contact: formState.contact,
      province: formState.province,
      gender: formState.gender
    }
    await authApi.register(registerData)
    message.success('注册成功')
    router.push('/login')
  } catch (error) {
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}

// 获取是否允许注册
const getRegisterStatus = async () => {
  const response = await authApi.getRegisterStatus()
  allowRegister.value = response.data.allowRegister
}

onMounted(() => {
  getRegisterStatus()
})
</script>

<template>
  <div class="register-container" v-if="allowRegister">
    <div class="register-content">
      <div class="register-header">
        <VueLogo class="logo" />
        <h1 class="title">新生入学可视化系统</h1>
      </div>

      <a-form
        :model="formState"
        @finish="handleSubmit"
        layout="vertical"
        :rules="rules"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入用户名" />
        </a-form-item>

        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱">
            <template #addonAfter>
              <a-button
                type="link"
                :disabled="countdown > 0"
                :loading="sendingCode"
                @click="handleSendCode"
                style="margin: -7px -11px"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </a-button>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="验证码" name="verification_code">
          <a-input
            v-model:value="formState.verification_code"
            placeholder="请输入验证码"
          />
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
          />
        </a-form-item>

        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="请确认密码"
          />
        </a-form-item>

        <a-form-item label="姓名" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入姓名" />
        </a-form-item>

        <a-form-item label="性别" name="gender">
          <a-radio-group v-model:value="formState.gender">
            <a-radio value="M">男</a-radio>
            <a-radio value="F">女</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="联系方式" name="contact">
          <a-input v-model:value="formState.contact" placeholder="请输入联系方式" />
        </a-form-item>

        <a-form-item label="省份" name="province">
          <a-select v-model:value="formState.province" placeholder="请选择省份">
            <a-select-option v-for="province in provinces" :key="province.value" :value="province.value">
              {{ province.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
            size="large"
          >
            注册
          </a-button>
        </a-form-item>

        <div class="form-footer">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </a-form>
    </div>
    </div>
  <div class="register-container" v-else>
    <div class="register-content">
      <h1>当前不允许注册</h1>
    </div>
  </div>
</template>

<style scoped lang="less">
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login_bg.svg');
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 100%;
}

.register-content {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  margin: 40px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.3s ease-out;
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;

  .logo {
    width: 28px;
    margin-right: 8px;
  }

  .title {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #1f1f1f;
  }
}

.form-footer {
  margin-top: 24px;
  text-align: center;

  a {
    color: #1890ff;

    &:hover {
      text-decoration: underline;
    }
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
