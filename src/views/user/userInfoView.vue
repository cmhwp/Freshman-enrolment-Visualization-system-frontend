<template>
  <div class="user-info">
    <a-card title="个人信息" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleEdit" v-if="!isEditing">
          编辑信息
        </a-button>
        <div v-else>
          <a-button type="primary" @click="handleSave" :loading="saving" style="margin-right: 8px">
            保存
          </a-button>
          <a-button @click="handleCancel">取消</a-button>
        </div>
      </template>

      <a-form
        :model="formState"
        :disabled="!isEditing"
        layout="vertical"
        ref="formRef"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名">
              <a-input v-model:value="formState.username" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱">
              <a-input v-model:value="formState.email" disabled />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入姓名' }]">
              <a-input v-model:value="formState.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" name="gender">
              <a-select v-model:value="formState.gender">
                <a-select-option value="M">男</a-select-option>
                <a-select-option value="F">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="联系方式" name="contact">
              <a-input v-model:value="formState.contact" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所在省份" name="province">
              <a-select v-model:value="formState.province">
                <a-select-option v-for="prov in provinces" :key="prov.value" :value="prov.value">
                  {{ prov.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 学生特有信息 -->
        <template v-if="formState.role === 'student' && formState.student_profile">
          <a-divider>学籍信息</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="学号">
                <a-input v-model:value="formState.student_profile.student_id" disabled />
              </a-form-item>
            </a-col>
          </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="专业">
                  <a-input v-model:value="formState.student_profile.major" disabled />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="入学日期">
                  <a-input v-model:value="formState.student_profile.admission_date" disabled />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="预计毕业日期">
                  <a-input v-model:value="formState.student_profile.graduation_date" disabled />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="学籍状态">
              <a-tag :color="getStatusColor(formState.student_profile.status)">
                {{ getStatusText(formState.student_profile.status) }}
              </a-tag>
            </a-form-item>
          </template>
        </a-form>
      <a-divider />

      <div class="password-section">
        <h3>修改密码</h3>
        <a-button type="link" @click="showPasswordModal">
          点击修改密码
        </a-button>
      </div>
    </a-card>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:visible="passwordModalVisible"
      title="修改密码"
      @ok="handlePasswordChange"
      :confirmLoading="changingPassword"
    >
      <a-form
        :model="passwordForm"
        layout="vertical"
        ref="passwordFormRef"
      >
        <a-form-item
          label="当前密码"
          name="oldPassword"
          :rules="[{ required: true, message: '请输入当前密码' }]"
        >
          <a-input-password v-model:value="passwordForm.oldPassword" />
        </a-form-item>
        <a-form-item
          label="新密码"
          name="newPassword"
          :rules="[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度不能小于6位' }
          ]"
        >
          <a-input-password v-model:value="passwordForm.newPassword" />
        </a-form-item>
        <a-form-item
          label="确认新密码"
          name="confirmPassword"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: validateConfirmPassword }
          ]"
        >
          <a-input-password v-model:value="passwordForm.confirmPassword" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { useUserStore } from '@/stores'
import { userApi } from '@/api/user'
import { provinces } from '@/constants/provinces'
import type { StudentProfile } from '@/types/api'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const isEditing = ref(false)
const saving = ref(false)
const passwordModalVisible = ref(false)
const changingPassword = ref(false)

// 表单数据
const formState = reactive<StudentProfile>({
  id: 0,
  username: '',
  email: '',
  name: '',
  role: 'student',
  contact: '',
  province: '',
  gender: undefined,
  class_id: undefined,
  student_profile: undefined
})

// 密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取用户信息
const fetchUserProfile = async () => {
  try {
    const response = await userApi.getProfile()
    Object.assign(formState, response.data)
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 编辑操作
const handleEdit = () => {
  isEditing.value = true
}

// 保存操作
const handleSave = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true

    await userApi.updateProfile({
      name: formState.name,
      contact: formState.contact,
      province: formState.province,
      gender: formState.gender
    })

    message.success('保存成功')
    isEditing.value = false
  } catch (error) {
    console.error('Save error:', error)
  } finally {
    saving.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  fetchUserProfile() // 重新获取数据，恢复原值
}

// 显示修改密码弹窗
const showPasswordModal = () => {
  passwordModalVisible.value = true
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 验证确认密码
const validateConfirmPassword = async (_rule: any, value: string) => {
  if (value !== passwordForm.newPassword) {
    throw new Error('两次输入的密码不一致')
  }
}

// 修改密码
const handlePasswordChange = async () => {
  try {
    await passwordFormRef.value?.validate()
    changingPassword.value = true

    await userApi.updatePassword({
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword
    })

    message.success('密码修改成功')
    passwordModalVisible.value = false
  } catch (error) {
    console.error('Password change error:', error)
  } finally {
    changingPassword.value = false
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    active: '在读',
    graduated: '已毕业',
    suspended: '休学'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 获取状态标签颜色
const getStatusColor = (status: string) => {
  const colorMap = {
    active: 'green',
    graduated: 'blue',
    suspended: 'orange'
  }
  return colorMap[status as keyof typeof colorMap] || 'default'
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped lang="less">
.user-info {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;

  .password-section {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }
}
</style>
