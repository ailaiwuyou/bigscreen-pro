<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">仪表盘管理</h1>
        <p class="page-subtitle">创建和管理您的大屏仪表盘</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建仪表盘
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索仪表盘..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="statusFilter" placeholder="状态" clearable>
        <el-option label="全部" value="" />
        <el-option label="草稿" value="DRAFT" />
        <el-option label="已发布" value="PUBLISHED" />
        <el-option label="已归档" value="ARCHIVED" />
      </el-select>
      
      <el-select v-model="sortBy" placeholder="排序">
        <el-option label="最近更新" value="updatedAt" />
        <el-option label="最新创建" value="createdAt" />
        <el-option label="名称" value="name" />
      </el-select>
    </div>

    <!-- 仪表盘列表 -->
    <div class="dashboard-list">
      <el-row :gutter="20">
        <el-col
          v-for="dashboard in dashboardList"
          :key="dashboard.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <div class="dashboard-card" @click="handleEdit(dashboard)">
            <div class="card-preview">
              <img
                v-if="dashboard.thumbnail"
                :src="dashboard.thumbnail"
                :alt="dashboard.name"
                class="preview-image"
              />
              <div v-else class="preview-placeholder">
                <el-icon :size="48"><DataLine /></el-icon>
                <span>暂无预览</span>
              </div>
              <div class="card-status" :class="getStatusClass(dashboard.status)">
                {{ getStatusText(dashboard.status) }}
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title" :title="dashboard.name">
                {{ dashboard.name }}
              </h3>
              <p class="card-desc" :title="dashboard.description">
                {{ dashboard.description || '暂无描述' }}
              </p>
              <div class="card-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(dashboard.updatedAt) }}
                </span>
                <el-dropdown trigger="click" @command="handleCommand($event, dashboard)">
                  <el-button link type="primary" class="more-btn">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>编辑
                      </el-dropdown-item>
                      <el-dropdown-item command="preview">
                        <el-icon><View /></el-icon>预览
                      </el-dropdown-item>
                      <el-dropdown-item command="duplicate">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item divided command="delete">
                        <el-icon><Delete /></el-icon>删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 空状态 -->
    <div v-if="dashboardList.length === 0 && !loading" class="empty-state">
      <el-empty description="暂无仪表盘">
        <el-button type="primary" @click="handleCreate">
          创建第一个仪表盘
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  DataLine,
  Clock,
  More,
  Edit,
  View,
  CopyDocument,
  Delete
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useDashboardStore } from '@/stores/dashboard'

const router = useRouter()
const userStore = useUserStore()
const dashboardStore = useDashboardStore()

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('updatedAt')

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)

// 仪表盘列表 - 从 Store 获取
const dashboardList = computed(() => dashboardStore.dashboards)
const total = computed(() => dashboardStore.total)

// 方法
const handleSearch = () => {
  currentPage.value = 1
  fetchDashboards()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchDashboards()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchDashboards()
}

const fetchDashboards = async () => {
  dashboardStore.loading = true
  try {
    // 过滤空值参数
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value
    }
    if (searchQuery.value) params.keyword = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    
    await dashboardStore.fetchDashboards(params)
  } catch (error) {
    ElMessage.error('获取仪表盘列表失败')
  } finally {
    dashboardStore.loading = false
  }
}

const handleCreate = () => {
  router.push('/dashboard/editor')
}

const handleEdit = (dashboard: any) => {
  router.push(`/dashboard/editor/${dashboard.id}`)
}

const handleCommand = (command: string, dashboard: any) => {
  switch (command) {
    case 'edit':
      handleEdit(dashboard)
      break
    case 'preview':
      window.open(`/preview/${dashboard.id}`, '_blank')
      break
    case 'duplicate':
      handleDuplicate(dashboard)
      break
    case 'delete':
      handleDelete(dashboard)
      break
  }
}

const handleDuplicate = async (dashboard: any) => {
  try {
    await dashboardStore.duplicateDashboard(dashboard.id)
    fetchDashboards()
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleDelete = async (dashboard: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除仪表盘 "${dashboard.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await dashboardStore.deleteDashboard(dashboard.id)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  return `status-${(status || '').toLowerCase()}`
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchDashboards()
})
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 24px;
  min-height: calc(100vh - 60px);
  background: var(--bg-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--box-shadow-sm);
  
  .search-input {
    flex: 1;
    max-width: 320px;
  }
}

.dashboard-list {
  margin-bottom: 24px;
}

.dashboard-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--box-shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--box-shadow-md);
  }
}

.card-preview {
  position: relative;
  aspect-ratio: 16/10;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  
  span {
    margin-top: 8px;
    font-size: 14px;
  }
}

.card-status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.status-draft {
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-primary);
  }
  
  &.status-published {
    background: var(--color-success);
    color: #fff;
  }
  
  &.status-archived {
    background: var(--color-info);
    color: #fff;
  }
}

.card-info {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  
  .el-icon {
    font-size: 14px;
  }
}

.more-btn {
  padding: 4px;
  
  &:hover {
    background: var(--color-fill-base);
    border-radius: 4px;
  }
}

.empty-state {
  padding: 80px 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--box-shadow-sm);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--box-shadow-sm);
}

// 响应式
@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-bar {
    flex-wrap: wrap;
    
    .search-input {
      max-width: 100%;
    }
  }
  
  .pagination-wrapper {
    justify-content: center;
  }
}
</style>