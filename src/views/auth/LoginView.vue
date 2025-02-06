<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi } from '@/api'
import type { LoginRequest } from '@/types/api'
import { VueLogo } from '@/components/icons'

const router = useRouter()

const formState = reactive<LoginRequest>({
  username: '',
  password: ''
})

const loading = ref(false)

const handleSubmit = async () => {
  try {
    loading.value = true
    const response = await authApi.login(formState)

    // 保存token和用户信息
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('userRole', response.user.role)
    localStorage.setItem('userName', response.user.name)

    message.success('登录成功')

    // 根据角色跳转到不同页面
    if (response.user.role === 'student') {
      router.push({ name: 'student-scores' })
    } else {
      router.push({ name: 'home' })
    }
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
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
        class="login-form"
      >
        <a-form-item>
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="用户名：admin / user"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="密码：123456"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="login-options">
          <a-checkbox>记住我</a-checkbox>
          <a href="javascript:;">忘记密码？</a>
        </div>

        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          size="large"
          block
        >
          登录
        </a-button>

        <div class="form-footer">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </a-form>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-container {
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

.login-content {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.3s ease-out;
}

.login-header {
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

.login-form {
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
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
