<template>
  <a-modal
    :title="`${type === 'teacher' ? '教师' : '学生'}导入`"
    :visible="visible"
    @cancel="handleCancel"
    :footer="null"
    width="600px"
  >
    <div class="import-container">
      <!-- 步骤说明 -->
      <div class="steps-container">
        <a-steps :current="currentStep">
          <a-step title="下载模板" />
          <a-step title="填写数据" />
          <a-step title="上传文件" />
        </a-steps>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <template v-if="currentStep === 0">
          <div class="template-download">
            <a-button type="primary" @click="handleDownloadTemplate">
              下载导入模板
            </a-button>
            <p class="tip">请使用最新模板，避免格式问题</p>
          </div>
        </template>

        <template v-else-if="currentStep === 1">
          <div class="data-fill">
            <h3>填写说明：</h3>
            <ul>
              <li>请严格按照模板格式填写数据</li>
              <li>标记 * 的字段为必填项</li>
              <li>请确保数据的准确性</li>
            </ul>
          </div>
        </template>

        <template v-else>
          <div class="file-upload">
            <a-upload
              :customRequest="handleUpload"
              :showUploadList="false"
              accept=".xlsx"
              :disabled="loading"
            >
              <a-button :loading="loading">
                {{ loading ? '正在导入...' : '选择文件并上传' }}
              </a-button>
            </a-upload>

            <!-- 导入结果展示 -->
            <div v-if="importResult" class="import-result">
              <a-alert
                :message="`导入完成！成功：${importResult.success}条，失败：${importResult.failed}条`"
                :type="importResult.failed > 0 ? 'warning' : 'success'"
                show-icon
              />
              <div v-if="importResult.errors.length" class="error-list">
                <h4>错误详情：</h4>
                <ul>
                  <li v-for="(error, index) in importResult.errors" :key="index">
                    {{ error }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 步骤控制按钮 -->
      <div class="step-actions">
        <a-button
          v-if="currentStep > 0"
          style="margin-right: 8px"
          @click="prev"
        >
          上一步
        </a-button>
        <a-button
          v-if="currentStep < 2"
          type="primary"
          @click="next"
        >
          下一步
        </a-button>
        <a-button
          v-else
          type="primary"
          @click="handleCancel"
        >
          完成
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { message } from 'ant-design-vue'
import { adminApi } from '@/api/admin'
import { downloadFile } from '@/utils/file'
import type { ImportResult } from '@/api/admin'

const props = defineProps<{
  visible: boolean
  type: 'teacher' | 'student'
}>()

const emit = defineEmits(['update:visible', 'success'])

const currentStep = ref(0)
const loading = ref(false)
const importResult = ref<ImportResult>()

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const res = await (props.type === 'teacher'
      ? adminApi.downloadTeacherTemplate()
      : adminApi.downloadStudentTemplate())
    if (res instanceof Blob) {
      downloadFile(res, `${props.type}_import_template.xlsx`)
      message.success('模板下载成功')
    }
  } catch (error) {
    message.error('下载模板失败')
  }
}

// 文件上传
const handleUpload = async ({ file }: { file: File }) => {
  try {
    loading.value = true
    const res = await (props.type === 'teacher'
      ? adminApi.importTeachers(file)
      : adminApi.importStudents(file))

    if (res.success && res.data) {
      importResult.value = res.data
      emit('success', {
        success: res.data.success,
        failed: res.data.failed
      })
    }
  } catch (error: any) {
    message.error(error.message || '导入失败')
  } finally {
    loading.value = false
  }
}

// 步骤控制
const next = () => {
  currentStep.value += 1
}

const prev = () => {
  currentStep.value -= 1
}

// 关闭弹窗
const handleCancel = () => {
  currentStep.value = 0
  importResult.value = undefined
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.import-container {
  .steps-container {
    margin-bottom: 24px;
  }

  .step-content {
    min-height: 200px;
    margin-bottom: 24px;
    padding: 24px;
    background-color: #fafafa;
    border-radius: 4px;

    .template-download,
    .data-fill,
    .file-upload {
      text-align: center;
    }

    .tip {
      margin-top: 16px;
      color: #666;
    }

    .data-fill {
      text-align: left;

      ul {
        padding-left: 20px;
        li {
          margin-bottom: 8px;
        }
      }
    }

    .import-result {
      margin-top: 16px;
      text-align: left;

      .error-list {
        margin-top: 16px;
        padding: 16px;
        background-color: #fff;
        border-radius: 4px;

        h4 {
          color: #ff4d4f;
          margin-bottom: 8px;
        }

        ul {
          padding-left: 20px;
          li {
            color: #ff4d4f;
            margin-bottom: 4px;
          }
        }
      }
    }
  }

  .step-actions {
    text-align: right;
  }
}
</style>
