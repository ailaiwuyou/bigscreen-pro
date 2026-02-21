import request from './request'
import type {
  ApiResponse,
  DataSource,
  DataSourceListResponse,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  ExecuteQueryRequest,
  QueryResult,
  TestConnectionResult,
  DataSourceFilter
} from './types'

// 创建数据源
export function createDataSource(data: CreateDataSourceRequest) {
  return request<ApiResponse<DataSource>>({
    url: '/data-sources',
    method: 'post',
    data
  })
}

// 获取数据源列表
export function getDataSources(params?: DataSourceFilter) {
  return request<ApiResponse<DataSourceListResponse>>({
    url: '/data-sources',
    method: 'get',
    params
  })
}

// 获取单个数据源
export function getDataSourceById(id: string) {
  return request<ApiResponse<DataSource>>({
    url: `/data-sources/${id}`,
    method: 'get'
  })
}

// 更新数据源
export function updateDataSource(id: string, data: UpdateDataSourceRequest) {
  return request<ApiResponse<DataSource>>({
    url: `/data-sources/${id}`,
    method: 'put',
    data
  })
}

// 删除数据源
export function deleteDataSource(id: string) {
  return request<ApiResponse<null>>({
    url: `/data-sources/${id}`,
    method: 'delete'
  })
}

// 测试连接
export function testConnection(id: string) {
  return request<ApiResponse<TestConnectionResult>>({
    url: `/data-sources/${id}/test`,
    method: 'post'
  })
}

// 执行查询
export function executeQuery(id: string, data: ExecuteQueryRequest) {
  return request<ApiResponse<QueryResult>>({
    url: `/data-sources/${id}/query`,
    method: 'post',
    data
  })
}