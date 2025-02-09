<template>
  <div class="dormitory-management">
    <a-card title="宿舍楼管理">
      <template #extra>
        <a-button type="primary" @click="showCreateBuildingModal">
          新建宿舍楼
        </a-button>
      </template>

      <!-- 宿舍楼列表 -->
      <a-table :columns="buildingColumns" :data-source="buildings" :loading="loading">
        <template #gender="{ text }">
          {{ text === 'M' ? '男生宿舍' : '女生宿舍' }}
        </template>
        <template #action="{ record }">
          <a-space>
            <a @click="showRoomList(record)">查看房间</a>
            <a @click="showEditBuildingModal(record)">编辑</a>
            <a-popconfirm
              title="确定要删除该宿舍楼吗？"
              @confirm="handleDeleteBuilding(record.id)"
            >
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 创建宿舍楼对话框 -->
    <a-modal
      v-model:visible="createBuildingVisible"
      title="新建宿舍楼"
      @ok="handleCreateBuilding"
      :confirmLoading="submitting"
    >
      <a-form :model="buildingForm" layout="vertical">
        <a-form-item label="宿舍楼名称" required>
          <a-input v-model:value="buildingForm.name" placeholder="如：A栋" />
        </a-form-item>
        <a-form-item label="宿舍类型" required>
          <a-select v-model:value="buildingForm.gender">
            <a-select-option value="M">男生宿舍</a-select-option>
            <a-select-option value="F">女生宿舍</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="buildingForm.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建房间对话框 -->
    <a-modal
      v-model:visible="createRoomVisible"
      title="添加房间"
      @ok="handleCreateRoom"
      :confirmLoading="submitting"
    >
      <a-form :model="roomForm" layout="vertical">
        <a-form-item label="房间号" required>
          <a-input v-model:value="roomForm.roomNumber" placeholder="如：101" />
        </a-form-item>
        <a-form-item label="容量">
          <a-input-number v-model:value="roomForm.capacity" :min="1" :max="8" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="roomForm.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 房间列表抽屉 -->
    <a-drawer
      v-model:visible="roomListVisible"
      :title="`${currentBuilding?.name || ''} 房间列表`"
      width="800"
      placement="right"
    >
      <template #extra>
        <a-button type="primary" @click="showCreateRoomModal(currentBuilding)">
          添加房间
        </a-button>
      </template>

      <a-table :columns="roomColumns" :data-source="rooms" :loading="roomsLoading">
        <template #occupancy="{ record }">
          <a-tag :color="getOccupancyColor(record)">
            {{ record.occupancy }}/{{ record.capacity }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a @click="showRoomDetails(record)">查看详情</a>
            <a @click="showEditRoomModal(record)">编辑</a>
            <a-button
              type="link"
              @click="showAssignModal(record)"
              :disabled="record.occupancy >= record.capacity"
              style="padding: 0"
            >
              分配学生
            </a-button>
            <a-popconfirm
              title="确定要删除该房间吗？"
              @confirm="handleDeleteRoom(record.id)"
            >
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-drawer>

    <!-- 房间详情抽屉 -->
    <a-drawer
      v-model:visible="roomDetailsVisible"
      :title="roomDetails ? `${roomDetails.building}-${roomDetails.room}` : '房间详情'"
      width="600"
    >
      <a-descriptions :column="1">
        <a-descriptions-item label="房间号">{{ roomDetails?.room }}</a-descriptions-item>
        <a-descriptions-item label="入住情况">
          {{ roomDetails?.occupancy }}/{{ roomDetails?.capacity }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>入住学生</a-divider>
      <a-list :data-source="roomDetails?.students">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.name" :description="`${item.studentId} | ${item.major}`">
            </a-list-item-meta>
            <a-button type="link" @click="showChangeRoomModal(item)">调整宿舍</a-button>
            <a-popconfirm
              title="确定要让该学生退宿吗？"
              @confirm="handleCheckout(item.assignmentId)"
            >
              <a class="danger-link">退宿</a>
            </a-popconfirm>
          </a-list-item>
        </template>
      </a-list>
    </a-drawer>

    <!-- 添加分配学生对话框 -->
    <a-modal
      v-model:visible="assignModalVisible"
      title="分配学生"
      @ok="handleAssignStudent"
      :confirmLoading="submitting"
    >
      <a-alert
        v-if="assignRoom"
        :message="`当前房间: ${currentBuilding?.name}-${assignRoom.roomNumber} (${assignRoom.occupancy}/${assignRoom.capacity})`"
        type="info"
        style="margin-bottom: 16px"
      />

      <a-form :model="assignForm" layout="vertical">
        <a-form-item label="选择学生" required>
          <a-select
            v-model:value="assignForm.studentId"
            show-search
            :loading="studentsLoading"
            :filter-option="filterStudents"
            placeholder="请选择学生"
            style="width: 100%"
          >
            <a-select-option
              v-for="student in unassignedStudents"
              :key="student.id"
              :value="student.id"
            >
              {{ student.name }} ({{ student.student_id }}) - {{ student.major }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑宿舍楼对话框 -->
    <a-modal
      v-model:visible="editBuildingVisible"
      title="编辑宿舍楼"
      @ok="handleUpdateBuilding"
      :confirmLoading="submitting"
    >
      <a-form :model="buildingForm" layout="vertical">
        <a-form-item label="宿舍楼名称" required>
          <a-input v-model:value="buildingForm.name" placeholder="如：A栋" />
        </a-form-item>
        <a-form-item label="宿舍类型" required>
          <a-select v-model:value="buildingForm.gender">
            <a-select-option value="M">男生宿舍</a-select-option>
            <a-select-option value="F">女生宿舍</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="buildingForm.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑房间对话框 -->
    <a-modal
      v-model:visible="editRoomVisible"
      title="编辑房间"
      @ok="handleUpdateRoom"
      :confirmLoading="submitting"
    >
      <a-form :model="roomForm" layout="vertical">
        <a-form-item label="房间号" required>
          <a-input v-model:value="roomForm.roomNumber" placeholder="如：101" />
        </a-form-item>
        <a-form-item label="容量">
          <a-input-number v-model:value="roomForm.capacity" :min="1" :max="8" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="roomForm.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 调整宿舍对话框 -->
    <a-modal
      v-model:visible="changeRoomVisible"
      title="调整宿舍"
      @ok="handleChangeRoom"
      :confirmLoading="submitting"
    >
      <a-form :model="changeRoomForm" layout="vertical">
        <a-form-item label="选择新宿舍" required>
          <a-select
            v-model:value="changeRoomForm.newRoomId"
            placeholder="请选择新宿舍"
            :loading="roomsLoading"
          >
            <a-select-option
              v-for="room in availableRooms"
              :key="room.id"
              :value="room.id"
            >
              {{ room.buildingName }}-{{ room.roomNumber }}
              ({{ room.occupancy }}/{{ room.capacity }})
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { dormitoryApi } from '@/api/admin'
import type { DormitoryBuilding, DormitoryRoom, RoomDetails, CreateBuildingRequest, StudentProfile, CreateRoomRequest, RoomStudent } from '@/types/api'

// 表格列定义
const buildingColumns = [
  { title: '宿舍楼', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'gender', key: 'gender', slots: { customRender: 'gender' } },
  { title: '房间数', dataIndex: 'roomCount', key: 'roomCount' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', slots: { customRender: 'action' } }
]

const roomColumns = [
  { title: '房间号', dataIndex: 'roomNumber', key: 'roomNumber' },
  { title: '入住情况', key: 'occupancy', slots: { customRender: 'occupancy' } },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', slots: { customRender: 'action' } }
]

// 数据状态
const loading = ref(false)
const buildings = ref<DormitoryBuilding[]>([])
const rooms = ref<DormitoryRoom[]>([])
const roomsLoading = ref(false)
const currentBuilding = ref<DormitoryBuilding | null>(null)
const roomDetails = ref<RoomDetails | null>(null)
const availableRooms = ref<DormitoryRoom[]>([])
// 模态框状态
const createBuildingVisible = ref(false)
const createRoomVisible = ref(false)
const roomListVisible = ref(false)
const roomDetailsVisible = ref(false)
const submitting = ref(false)
const assignModalVisible = ref(false)
const assignRoom = ref<DormitoryRoom | null>(null)

// 表单数据
const buildingForm = ref<Partial<DormitoryBuilding>>({
  name: '',
  gender: 'M' as 'M' | 'F',
  description: '',
  id: undefined
})

const roomForm = ref<Partial<DormitoryRoom>>({
  roomNumber: '',
  buildingId: 0,
  capacity: 4,
  description: ''
})

const studentsLoading = ref(false)
const unassignedStudents = ref<StudentProfile[]>([])
const assignForm = ref({
  studentId: undefined as number | undefined
})

// 新增状态
const editBuildingVisible = ref(false)
const editRoomVisible = ref(false)
const changeRoomVisible = ref(false)
const changeRoomForm = ref({
  assignmentId: undefined as number | undefined,
  newRoomId: undefined as number | undefined
})

// 获取宿舍楼列表
const fetchBuildings = async () => {
  loading.value = true
  try {
    const res = await dormitoryApi.getBuildings()
    if (res.success) {
      buildings.value = res.data
    }
  } catch (error) {
    message.error('获取宿舍楼列表失败')
  } finally {
    loading.value = false
  }
}

// 创建宿舍楼
const handleCreateBuilding = async () => {
  if (!buildingForm.value.name || !buildingForm.value.gender) {
    message.warning('请填写必要信息')
    return
  }

  submitting.value = true
  try {
    const res = await dormitoryApi.createBuilding(buildingForm.value as CreateBuildingRequest)
    if (res.success) {
      message.success('创建成功')
      createBuildingVisible.value = false
      fetchBuildings()
    }
  } catch (error) {
    message.error('创建失败')
  } finally {
    submitting.value = false
  }
}

// 显示房间列表
const showRoomList = async (building: DormitoryBuilding) => {
  currentBuilding.value = building
  roomListVisible.value = true
  roomsLoading.value = true
  try {
    const res = await dormitoryApi.getRooms(building.id)
    if (res.success) {
      rooms.value = res.data
    }
  } catch (error) {
    message.error('获取房间列表失败')
  } finally {
    roomsLoading.value = false
  }
}

// 创建房间
const handleCreateRoom = async () => {
  if (!currentBuilding.value || !roomForm.value.roomNumber) return
  submitting.value = true
  try {
    const createData: CreateRoomRequest = {
      buildingId: currentBuilding.value.id,
      roomNumber: roomForm.value.roomNumber,
      capacity: roomForm.value.capacity || 4,
      description: roomForm.value.description || ''
    }
    const res = await dormitoryApi.createRoom(createData)
    if (res.success) {
      message.success('创建成功')
      createRoomVisible.value = false
      showRoomList(currentBuilding.value)
    }
  } catch (error) {
    message.error('创建失败')
  } finally {
    submitting.value = false
  }
}

// 显示房间详情
const showRoomDetails = async (room: DormitoryRoom) => {
  try {
    const res = await dormitoryApi.getRoomDetails(room.buildingId, room.roomNumber)
    if (res.success) {
      roomDetails.value = res.data
      roomDetailsVisible.value = true
      // 刷新房间列表以更新入住情况
      if (currentBuilding.value) {
        showRoomList(currentBuilding.value)
      }
    }
  } catch (error) {
    message.error('获取房间详情失败')
  }
}

// 显示创建宿舍楼对话框
const showCreateBuildingModal = () => {
  buildingForm.value = {
    name: '',
    gender: 'M' as 'M' | 'F',
    description: '',
    id: undefined
  }
  createBuildingVisible.value = true
}

// 显示创建房间对话框
const showCreateRoomModal = (building: DormitoryBuilding | null) => {
  if (!building) return
  currentBuilding.value = building
  roomForm.value = {
    roomNumber: '',
    buildingId: building.id,
    capacity: 4,
    description: ''
  }
  createRoomVisible.value = true
}

// 显示分配学生对话框
const showAssignModal = async (room: DormitoryRoom) => {
  if (room.occupancy >= room.capacity) {
    message.warning('该房间已满')
    return
  }
  assignRoom.value = room
  assignModalVisible.value = true
  assignForm.value.studentId = undefined
  await fetchUnassignedStudents(room.buildingId)
}

// 获取入住情况标签颜色
const getOccupancyColor = (room: DormitoryRoom) => {
  const ratio = room.occupancy / room.capacity
  if (ratio >= 1) return 'red'
  if (ratio >= 0.8) return 'orange'
  if (ratio > 0) return 'green'
  return 'default'
}

// 获取未分配宿舍的学生
const fetchUnassignedStudents = async (buildingId: number) => {
  studentsLoading.value = true
  try {
    const res = await dormitoryApi.getUnassignedStudents(buildingId)
    console.log(res)
    if (res.success) {
      unassignedStudents.value = res.data
    }
  } catch (error) {
    message.error('获取学生列表失败')
  } finally {
    studentsLoading.value = false
  }
}

// 学生选择器的过滤方法
const filterStudents = (input: string, option: any) => {
  const student = option.children || ''
  return student.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 分配学生
const handleAssignStudent = async () => {
  if (!assignForm.value.studentId || !assignRoom.value) {
    message.warning('请选择学生')
    return
  }

  submitting.value = true
  try {
    const res = await dormitoryApi.assignRoom({
      studentId: assignForm.value.studentId,
      roomId: assignRoom.value.id
    })
    if (res.success) {
      message.success('分配成功')
      assignModalVisible.value = false
      // 刷新房间列表和详情
      if (currentBuilding.value) {
        showRoomList(currentBuilding.value)
      }
      if (assignRoom.value) {
        showRoomDetails(assignRoom.value)
      }
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '分配失败')
  } finally {
    submitting.value = false
  }
}

// 新增方法
const showEditBuildingModal = (building: DormitoryBuilding) => {
  buildingForm.value = { ...building }
  editBuildingVisible.value = true
}

const showEditRoomModal = (room: DormitoryRoom) => {
  roomForm.value = { ...room }
  editRoomVisible.value = true
}

const handleUpdateBuilding = async () => {
  if (!buildingForm.value.id) return
  submitting.value = true
  try {
    const res = await dormitoryApi.updateBuilding(
      buildingForm.value.id,
      buildingForm.value
    )
    if (res.success) {
      message.success('更新成功')
      editBuildingVisible.value = false
      fetchBuildings()
    }
  } catch (error) {
    message.error('更新失败')
  } finally {
    submitting.value = false
  }
}

const handleUpdateRoom = async () => {
  if (!roomForm.value.id) return
  submitting.value = true
  try {
    const res = await dormitoryApi.updateRoom(
      roomForm.value.id,
      roomForm.value
    )
    if (res.success) {
      message.success('更新成功')
      editRoomVisible.value = false
      if (currentBuilding.value) {
        showRoomList(currentBuilding.value)
      }
    }
  } catch (error) {
    message.error('更新失败')
  } finally {
    submitting.value = false
  }
}

const handleDeleteBuilding = async (id: number) => {
  try {
    const res = await dormitoryApi.deleteBuilding(id)
    if (res.success) {
      message.success('删除成功')
      fetchBuildings()
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '删除失败')
  }
}

const handleDeleteRoom = async (id: number) => {
  try {
    const res = await dormitoryApi.deleteRoom(id)
    if (res.success) {
      message.success('删除成功')
      if (currentBuilding.value) {
        showRoomList(currentBuilding.value)
      }
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '删除失败')
  }
}

const handleCheckout = async (assignmentId: number) => {
  try {
    const res = await dormitoryApi.checkout(assignmentId)
    if (res.success) {
      message.success('退宿成功')
      // 刷新房间列表和详情
      if (currentBuilding.value) {
        showRoomList(currentBuilding.value)
      }
      if (roomDetails.value) {
        const room: DormitoryRoom = {
          id: roomDetails.value.id,
          buildingId: roomDetails.value.buildingId,
          buildingName: roomDetails.value.building,
          roomNumber: roomDetails.value.roomNumber,
          capacity: roomDetails.value.capacity,
          occupancy: roomDetails.value.occupancy,
          description: ''
        }
        showRoomDetails(room)
      }
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '退宿失败')
  }
}

const handleChangeRoom = async () => {
  if (!changeRoomForm.value.assignmentId || !changeRoomForm.value.newRoomId) {
    console.log(changeRoomForm.value)
    message.warning('请选择新宿舍')
    return
  }
  console.log(changeRoomForm.value)
  submitting.value = true
  try {
    const res = await dormitoryApi.changeRoom(
      changeRoomForm.value.assignmentId,
      { newRoomId: changeRoomForm.value.newRoomId }
    )
    if (res.success) {
      message.success('调整成功')
      changeRoomVisible.value = false
      if (roomDetails.value) {
        const room: DormitoryRoom = {
          id: roomDetails.value.id,
          buildingId: roomDetails.value.buildingId,
          buildingName: roomDetails.value.building,
          roomNumber: roomDetails.value.roomNumber,
          capacity: roomDetails.value.capacity,
          occupancy: roomDetails.value.occupancy,
          description: ''
        }
        showRoomDetails(room)
      }
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '调整失败')
  } finally {
    submitting.value = false
  }
}

// 显示调整宿舍对话框
const showChangeRoomModal = async (student: RoomStudent) => {
  console.log('student:', student) // 调试用
  changeRoomForm.value = {
    assignmentId: student.assignmentId,
    newRoomId: undefined
  }
  // 获取可用房间
  try {
    const res = await dormitoryApi.getRooms(currentBuilding.value?.id || 0)
    if (res.success) {
      // 过滤出未满的房间
      availableRooms.value = res.data.filter(room => room.occupancy < room.capacity)
    }
  } catch (error) {
    message.error('获取可用房间失败')
  }
  changeRoomVisible.value = true
}

onMounted(() => {
  fetchBuildings()
})
</script>

<style scoped>
.dormitory-management {
  padding: 24px;
}
.danger-link {
  color: #ff4d4f;
}
.danger-link:hover {
  color: #ff7875;
}
</style>
