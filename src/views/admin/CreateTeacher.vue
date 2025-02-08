<template>
  <div class="create-teacher">
    <a-card title="创建教师账号" :bordered="false">
      <a-form
        :model="formState"
        :rules="rules"
        layout="vertical"
        ref="formRef"
        @finish="handleSubmit"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="formState.username" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="formState.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="密码" name="password">
              <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="性别" name="gender" :rules="[{ required: true, message: '请选择性别' }]">
              <a-select v-model:value="formState.gender" placeholder="请选择性别">
                <a-select-option value="M">男</a-select-option>
                <a-select-option value="F">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所在省份" name="province" :rules="[{ required: true, message: '请选择省份' }]">
              <a-select v-model:value="formState.province" placeholder="请选择省份">
                <a-select-option v-for="prov in provinces" :key="prov.value" :value="prov.value">
                  {{ prov.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属院系" name="department">
              <a-select v-model:value="formState.department" placeholder="请选择院系">
                <a-select-option v-for="dept in departments" :key="dept" :value="dept">
                  {{ dept }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职称" name="title">
              <a-select v-model:value="formState.title" placeholder="请选择职称">
                <a-select-option v-for="title in titles" :key="title" :value="title">
                  {{ title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="研究方向" name="research_area">
          <a-select v-model:value="formState.research_area" placeholder="请选择研究方向">
            <a-select-option v-for="area in researchAreas" :key="area" :value="area">
              {{ area }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="submitting">
            创建教师账号
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { adminApi } from '@/api/admin'
import { departments, titles, researchAreas } from '@/constants/teacherRelate'
import { provinces } from '@/constants/provinces'

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formState = reactive({
  username: '',
  email: '',
  password: '',
  name: '',
  gender: undefined,
  province: undefined,
  department: '',
  title: '',
  research_area: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 4, message: '用户名长度不能小于4位' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度不能小于6位' }
  ],
  name: [{ required: true, message: '请输入姓名' }],
  gender: [{ required: true, message: '请选择性别' }],
  province: [{ required: true, message: '请选择省份' }],
  department: [{ required: true, message: '请选择院系' }],
  title: [{ required: true, message: '请选择职称' }]
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitting.value = true
    const response = await adminApi.createTeacher({
      username: formState.username,
      email: formState.email,
      password: formState.password,
      name: formState.name,
      gender: formState.gender,
      province: formState.province,
      teacher_profile: {
        department: formState.department,
        title: formState.title,
        research_area: formState.research_area
      }
    })

    if (response.success) {
      message.success('教师账号创建成功')
      formRef.value?.resetFields()
    } else {
      message.error(response.message || '创建失败')
    }
  } catch (error: any) {
    message.error(error.message || '创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-teacher {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}
</style>
