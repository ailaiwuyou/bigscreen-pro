<template>
  <div class="variable-panel">
    <div class="variable-panel-header">
      <h3>模板变量</h3>
      <el-button type="primary" size="small" @click="handleAddVariable">
        <el-icon><Plus /></el-icon>
        添加变量
      </el-button>
    </div>
    
    <!-- 变量列表 -->
    <div class="variable-list" v-if="variables.length > 0">
      <div
        v-for="variable in variables"
        :key="variable.id"
        class="variable-item"
        :class="{ 'is-active': activeId === variable.id }"
        @click="handleSelect(variable)"
      >
        <div class="variable-item-icon">
          <el-icon>
            <Document v-if="variable.type === 'query'" />
            <Setting v-else-if="variable.type === 'custom'" />
            <Edit v-else-if="variable.type === 'text'" />
            <Lock v-else />
          </el-icon>
        </div>
        <div class="variable-item-content">
          <div class="variable-item-name">{{ variable.name }}</div>
          <div class="variable-item-label">{{ variable.label || variable.name }}</div>
        </div>
        <div class="variable-item-type">{{ getTypeLabel(variable.type) }}</div>
        <div class="variable-item-actions">
          <el-button
            type="primary"
            link
            size="small"
            @click.stop="handleEdit(variable)"
          >
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            @click.stop="handleDelete(variable.id!)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <el-empty v-else description="暂无变量，点击添加创建" />
    
    <!-- 变量编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑变量' : '添加变量'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="变量名称" prop="name">
          <el-input v-model="formData.name" placeholder="例如: server, env" />
        </el-form-item>
        
        <el-form-item label="显示名称" prop="label">
          <el-input v-model="formData.label" placeholder="例如: 服务器, 环境" />
        </el-form-item>
        
        <el-form-item label="变量类型" prop="type">
          <el-select v-model="formData.type" placeholder="选择变量类型">
            <el-option label="查询变量" value="query" />
            <el-option label="自定义选项" value="custom" />
            <el-option label="文本输入" value="text" />
            <el-option label="常量" value="constant" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="变量的简要描述"
          />
        </el-form-item>
        
        <!-- 查询变量配置 -->
        <template v-if="formData.type === 'query'">
          <el-form-item label="数据源" prop="dataSourceId">
            <el-select v-model="formData.dataSourceId" placeholder="选择数据源">
              <el-option label="API" value="api" />
              <el-option label="MySQL" value="mysql" />
              <el-option label="PostgreSQL" value="postgresql" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="查询语句" prop="query">
            <el-input
              v-model="formData.query"
              type="textarea"
              :rows="3"
              placeholder="SELECT name FROM servers"
            />
          </el-form-item>
          
          <el-form-item label="正则过滤" prop="regex">
            <el-input v-model="formData.regex" placeholder="过滤选项的正则表达式" />
          </el-form-item>
        </template>
        
        <!-- 自定义变量配置 -->
        <template v-if="formData.type === 'custom'">
          <el-form-item label="选项" prop="options">
            <div class="custom-options">
              <div
                v-for="(option, index) in formData.options"
                :key="index"
                class="custom-option"
              >
                <el-input v-model="option.label" placeholder="显示文本" />
                <el-input v-model="option.value" placeholder="值" />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeCustomOption(index)"
                />
              </div>
              <el-button size="small" @click="addCustomOption">
                <el-icon><Plus /></el-icon> 添加选项
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item label="包含全选">
            <el-switch v-model="formData.includeAll" />
          </el-form-item>
        </template>
        
        <!-- 文本变量配置 -->
        <template v-if="formData.type === 'text'">
          <el-form-item label="默认值" prop="defaultValue">
            <el-input v-model="formData.defaultValue" placeholder="默认文本" />
          </el-form-item>
        </template>
        
        <!-- 常量变量配置 -->
        <template v-if="formData.type === 'constant'">
          <el-form-item label="常量值" prop="defaultValue">
            <el-input v-model="formData.defaultValue" placeholder="常量值" />
          </el-form-item>
        </template>
        
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="formData.defaultValue" placeholder="默认值" />
        </el-form-item>
        
        <el-form-item label="多选模式">
          <el-switch v-model="formData.multi" />
        </el-form-item>
        
        <el-form-item label="隐藏">
          <el-radio-group v-model="formData.hide">
            <el-radio label="dont">不隐藏</el-radio>
            <el-radio label="variable">隐藏变量</el-radio>
            <el-radio label="label">隐藏标签</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Document, Setting, Lock } from '@element-plus/icons-vue'
import type { Variable, FormInstance } from 'element-plus'
import type { VariableType } from '../stores/variable/types'

const variableStore = useVariableStore()

// 变量列表
const variables = computed(() => variableStore.variables)

// 当前选中的变量
const activeId = ref<string | null>(null)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  name: '',
  label: '',
  type: 'query' as VariableType,
  description: '',
  dataSourceId: '',
  query: '',
  regex: '',
  options: [{ label: '', value: '' }],
  includeAll: false,
  defaultValue: '',
  multi: false,
  hide: 'dont' as 'dont' | 'variable' | 'label',
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入变量名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '以字母开头，只包含字母数字下划线', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择变量类型', trigger: 'change' },
  ],
}

// 获取类型标签
function getTypeLabel(type: VariableType): string {
  const labels: Record<VariableType, string> = {
    query: '查询',
    custom: '自定义',
    text: '文本',
    constant: '常量',
  }
  return labels[type] || type
}

// 选择变量
function handleSelect(variable: Variable) {
  activeId.value = variable.id || null
}

// 添加变量
function handleAddVariable() {
  isEdit.value = false
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑变量
function handleEdit(variable: Variable) {
  isEdit.value = true
  editingId.value = variable.id || null
  
  // 填充表单
  formData.name = variable.name
  formData.label = variable.label || ''
  formData.type = variable.type
  formData.description = variable.description || ''
  formData.defaultValue = variable.defaultValue || ''
  formData.multi = (variable as any).multi || false
  formData.hide = variable.hide || 'dont'
  
  // 类型特定配置
  if (variable.type === 'query') {
    const qVar = variable as any
    formData.dataSourceId = qVar.dataSourceId || ''
    formData.query = qVar.query || ''
    formData.regex = qVar.regex || ''
  } else if (variable.type === 'custom') {
    const cVar = variable as any
    formData.options = cVar.options?.length ? [...cVar.options] : [{ label: '', value: '' }]
    formData.includeAll = cVar.includeAll || false
  }
  
  dialogVisible.value = true
}

// 删除变量
async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个变量吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    variableStore.removeVariable(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 添加自定义选项
function addCustomOption() {
  formData.options.push({ label: '', value: '' })
}

// 移除自定义选项
function removeCustomOption(index: number) {
  if (formData.options.length > 1) {
    formData.options.splice(index, 1)
  }
}

// 重置表单
function resetForm() {
  formData.name = ''
  formData.label = ''
  formData.type = 'query'
  formData.description = ''
  formData.dataSourceId = ''
  formData.query = ''
  formData.regex = ''
  formData.options = [{ label: '', value: '' }]
  formData.includeAll = false
  formData.defaultValue = ''
  formData.multi = false
  formData.hide = 'dont'
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (!valid) return
    
    // 构建变量数据
    const variableData: any = {
      name: formData.name,
      label: formData.label,
      type: formData.type,
      description: formData.description,
      defaultValue: formData.defaultValue || (formData.options[0]?.value || ''),
      multi: formData.multi,
      hide: formData.hide,
    }
    
    // 类型特定配置
    if (formData.type === 'query') {
      variableData.dataSourceId = formData.dataSourceId
      variableData.query = formData.query
      variableData.regex = formData.regex
    } else if (formData.type === 'custom') {
      variableData.options = formData.options.filter(o => o.label && o.value)
      variableData.includeAll = formData.includeAll
    }
    
    // 添加或更新
    if (isEdit.value && editingId.value) {
      variableStore.updateVariable(editingId.value, variableData)
      ElMessage.success('更新成功')
    } else {
      variableStore.addVariable(variableData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    resetForm()
  })
}
</script>

<style scoped lang="scss">
.variable-panel {
  padding: 16px;
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.variable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variable-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--el-fill-color);
  }
  
  &.is-active {
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary);
  }
  
  &-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-color-primary-light-8);
    border-radius: 6px;
    margin-right: 12px;
    color: var(--el-color-primary);
  }
  
  &-content {
    flex: 1;
  }
  
  &-name {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  
  &-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  
  &-type {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    padding: 2px 8px;
    background: var(--el-fill-color);
    border-radius: 4px;
    margin-right: 8px;
  }
  
  &-actions {
    display: flex;
    gap: 4px;
  }
}

.custom-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.custom-option {
  display: flex;
  gap: 8px;
  align-items: center;
  
  .el-input {
    flex: 1;
  }
}
</style>
