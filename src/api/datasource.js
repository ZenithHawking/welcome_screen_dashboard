import api from './axios'

export const getTables = (connectionString) =>
    api.get(`/welcomescreens/0/datasource/test`, { params: { connectionString } })

export const getColumns = (connectionString, tableName) =>
    api.get(`/welcomescreens/0/datasource/columns`, { params: { connectionString, tableName } })

export const saveDataSource = (screenId, data) =>
    api.post(`/welcomescreens/${screenId}/datasource`, data)

export const saveFields = (screenId, fields) =>
    api.post(`/welcomescreens/${screenId}/fields/bulk`, fields)