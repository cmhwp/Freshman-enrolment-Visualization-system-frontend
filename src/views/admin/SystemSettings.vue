<template>
  <div class="system-settings">
    <a-card title="系统设置" :bordered="false">
      <a-form :model="formState" layout="vertical">
        <!-- 基本设置 -->
        <a-divider>基本设置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="系统名称">
              <a-input v-model:value="formState.systemName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="系统版本">
              <a-input v-model:value="formState.version" disabled />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 新生报到设置 -->
        <a-divider>新生报到设置</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="报到截止时间">
              <a-date-picker
                v-model:value="formState.enrollmentDeadline"
                :show-time="{ format: 'HH:mm' }"
                format="YYYY-MM-DD HH:mm"
                placeholder="选择报到截止时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="学号前缀">
              <a-input v-model:value="formState.studentIdPrefix" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="默认学生状态">
              <a-select v-model:value="formState.defaultStudentStatus">
                <a-select-option value="pending">待报到</a-select-option>
                <a-select-option value="unreported">未报到</a-select-option>
                <a-select-option value="reported">已报到</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 注册设置 -->
        <a-divider>注册设置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开放注册">
              <a-switch v-model:checked="formState.allowRegister" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱验证">
              <a-switch v-model:checked="formState.requireEmailVerification" />
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 专业设置 -->
        <a-divider>专业设置</a-divider>
        <a-form-item>
          <a-space direction="vertical" style="width: 100%">
            <a-row v-for="(major, index) in formState.majors" :key="index" :gutter="16">
              <a-col :span="20">
                <a-input v-model:value="formState.majors[index]" placeholder="专业名称" />
              </a-col>
              <a-col :span="4">
                <a-button type="link" danger @click="removeMajor(index)">删除</a-button>
              </a-col>
            </a-row>
            <a-button type="dashed" block @click="addMajor">
              <plus-outlined /> 添加专业
            </a-button>
          </a-space>
        </a-form-item>

        <!-- 院系设置 -->
        <a-divider>院系设置</a-divider>
        <a-form-item>
          <a-space direction="vertical" style="width: 100%">
            <a-row v-for="(dept, index) in formState.departments" :key="index" :gutter="16">
              <a-col :span="20">
                <a-input v-model:value="formState.departments[index]" placeholder="院系名称" />
              </a-col>
              <a-col :span="4">
                <a-button type="link" danger @click="removeDepartment(index)">删除</a-button>
              </a-col>
            </a-row>
            <a-button type="dashed" block @click="addDepartment">
              <plus-outlined /> 添加院系
            </a-button>
          </a-space>
        </a-form-item>

        <!-- 保存按钮 -->
        <a-form-item>
          <a-button type="primary" :loading="saving" @click="handleSave">
            保存设置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { adminApi } from '@/api/admin'
import type { SystemSettings } from '@/types/api'
import dayjs from 'dayjs'

const saving = ref(false)

// 表单数据
const formState = ref<SystemSettings>({
  systemName: '新生入学可视化系统',
  version: '1.0.0',
  allowRegister: true,
  requireEmailVerification: true,
  studentIdPrefix: '2024',
  defaultStudentStatus: 'pending',
  majors: [] as string[],
  departments: [] as string[],
  enrollmentDeadline: null as dayjs.Dayjs | null
})

// 获取设置
const fetchSettings = async () => {
  try {
    const res = await adminApi.getSystemSettings()
    if (res.success) {
      Object.assign(formState.value, res.data)
      formState.value.enrollmentDeadline = res.data.enrollmentDeadline ? dayjs(res.data.enrollmentDeadline) : null
    }
  } catch (error) {
    message.error('获取系统设置失败')
  }
}

// 保存设置
const handleSave = async () => {
  try {
    saving.value = true
    const data = {
      ...formState.value,
      enrollmentDeadline: formState.value.enrollmentDeadline?.format('YYYY-MM-DD HH:mm:ss')
    }
    const res = await adminApi.updateSystemSettings(data)
    if (res.success) {
      message.success('保存成功')
    }
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 专业管理
const addMajor = () => {
  formState.value.majors.push('')
}

const removeMajor = (index: number) => {
  formState.value.majors.splice(index, 1)
}

// 院系管理
const addDepartment = () => {
  formState.value.departments.push('')
}

const removeDepartment = (index: number) => {
  formState.value.departments.splice(index, 1)
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.system-settings {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}
</style>
