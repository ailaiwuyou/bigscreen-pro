<template>
  <div class="data-source-page">
    <div class="page-header">
      <h1>数据源管理</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        添加数据源
      </el-button>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="数据源类型" clearable @change="handleFilter">
        <el-option label="MySQL" value="MYSQL" />
        <el-option label="PostgreSQL" value="POSTGRESQL" />
        <el-option label="MongoDB" value="MONGODB" />
        <el-option label="REST API" value="REST_API" />
        <el-option label="GraphQL" value="GRAPHQL" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable @change="handleFilter">
        <el-option label="活跃" value="ACTIVE" />
        <el-option label="未激活" value="INACTIVE" />
        <el-option label="错误" value="ERROR" />
      </el-select>
    </div>

    <!-- 数据源列表 -->
    <el-table :data="dataSourceStore.dataSources" v-loading="dataSourceStore.loading" style="width: 100%">
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastTestedAt" label="上次测试" width="180">
        <template #default="{ row }">
          {{ row.lastTestedAt ? formatDate(row.lastTestedAt) : '未测试' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleTest(row.id)">测试</el-button>
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="dataSourceStore.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingDataSource ? '编辑数据源' : '添加数据源'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" @change="handleTypeChange">
            <el-option label="MySQL" value="MYSQL" />
            <el-option label="PostgreSQL" value="POSTGRESQL" />
            <el-option label="MongoDB" value="MONGODB" />
            <el-option label="REST API" value="REST_API" />
            <el-option label="GraphQL" value="GRAPHQL" />
          </el-select>
        </el-form-item>

        <!-- 数据库配置 -->
        <template v-if="isDatabaseType">
          <el-form-item label="主机" prop="config.host">
            <el-input v-model="form.config.host" placeholder="localhost" />
          </el-form-item>
          <el-form-item label="端口" prop="config.port">
            <el-input-number v-model="form.config.port" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="数据库" prop="config.database">
            <el-input v-model="form.config.database" placeholder="数据库名称" />
          </el-form-item>
          <el-form-item label="用户名" prop="config.username">
            <el-input v-model="form.config.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="config.password">
            <el-input v-model="form.config.password" type="password" show-password placeholder="密码" />
          </el-form-item>
        </template>

        <!-- API 配置 -->
        <template v-if="form.type === 'REST_API'">
          <el-form-item label="API URL" prop="config.url">
            <el-input v-model="form.config.url" placeholder="https://api.example.com/data" />
          </el-form-item>
          <el-form-item label="API Key" prop="config.apiKey">
            <el-input v-model="form.config.apiKey" type="password" show-password placeholder="API Key" />
          </el-form-item>
        </template>

        <!-- GraphQL 配置 -->
        <template v-if="form.type === 'GRAPHQL'">
          <el-form-item label="Endpoint" prop="config.url">
            <el-input v-model="form.config.url" placeholder="https://api.example.com/graphql" />
          </el-form-item>
          <el-form-item label="API Key" prop="config.apiKey">
            <el-input v-model="form.config.apiKey" type="password" show-password placeholder="API Key" />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingDataSource ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useDataSourceStore, type DataSource, type DataSourceConfig } from '@/stores/dataSource'

const dataSourceStore = useDataSourceStore()

// Filter
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Dialog
const showCreateDialog = ref(false)
const editingDataSource = ref<DataSource | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = ref({
  name: '',
  type: 'MYSQL' as DataSource['type'],
  config: {
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
    url: '',
    apiKey: ''
  } as DataSourceConfig
})

const rules = {
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  'config.host': [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  'config.url': [{ required: true, message: '请输入 API 地址', trigger: 'blur' }]
}

const isDatabaseType = computed(() => {
  return ['MYSQL', 'POSTGRESQL', 'MONGODB'].includes(form.value.type)
})

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    MYSQL: 'MySQL',
    POSTGRESQL: 'PostgreSQL',
    MONGODB: 'MongoDB',
    REST_API: 'REST API',
    GRAPHQL: 'GraphQL'
  }
  return map[type] || type
}

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    MYSQL: 'warning',
    POSTGRESQL: 'success',
    MONGODB: 'danger',
    REST_API: 'info',
    GRAPHQL: 'info'
  }
  return map[type] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: '活跃',
    INACTIVE: '未激活',
    ERROR: '错误',
    PENDING_CLAIM: '待确认'
  }
  return map[status] || status
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'success',
    INACTIVE: 'info',
    ERROR: 'danger',
    PENDING_CLAIM: 'warning'
  }
  return map[status] || 'info'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const handleFilter = () => {
  currentPage.value = 1
  loadDataSources()
}

const handlePageChange = (page: number) => {
  loadDataSources()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadDataSources()
}

const loadDataSources = async () => {
  await dataSourceStore.fetchDataSources({
    type: filterType.value || undefined,
    status: filterStatus.value || undefined,
    page: currentPage.value,
    pageSize: pageSize.value
  })
}

const handleTypeChange = () => {
  // Reset config based on type
  if (form.value.type === 'MYSQL') {
    form.value.config.port = 3306
  } else if (form.value.type === 'POSTGRESQL') {
    form.value.config.port = 5432
  } else if (form.value.type === 'MONGODB') {
    form.value.config.port = 27017
  }
}

const handleEdit = (row: DataSource) => {
  editingDataSource.value = row
  form.value = {
    name: row.name,
    type: row.type,
    config: { ...row.config }
  }
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (editingDataSource.value) {
          await dataSourceStore.updateDataSource(editingDataSource.value.id, {
            name: form.value.name,
            config: form.value.config
          })
          ElMessage.success('数据源更新成功')
        } else {
          await dataSourceStore.createDataSource({
            name: form.value.name,
            type: form.value.type,
            config: form.value.config
          })
          ElMessage.success('数据源创建成功')
        }
        showCreateDialog.value = false
        resetForm()
        loadDataSources()
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除此数据源吗？', '警告', {
      type: 'warning'
    })
    await dataSourceStore.deleteDataSource(id)
    ElMessage.success('删除成功')
    loadDataSources()
  } catch (error) {
    // User cancelled
  }
}

const handleTest = async (id: string) => {
  const result = await dataSourceStore.testConnection(id)
  if (result.success) {
    ElMessage.success(`连接成功 (延迟: ${result.latency}ms)`)
  } else {
    ElMessage.error(`连接失败: ${result.message}`)
  }
}

const resetForm = () => {
  editingDataSource.value = null
  form.value = {
    name: '',
    type: 'MYSQL',
    config: {
      host: 'localhost',
      port: 3306,
      database: '',
      username: '',
      password: '',
      url: '',
      apiKey: ''
    }
  }
}

onMounted(() => {
  loadDataSources()
})
</script>

<style scoped>
.data-source-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
