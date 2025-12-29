import api from './api'

export default {
  async list({ page = 1, pageSize = 20 } = {}) {
    const limit = pageSize
    const offset = (page - 1) * pageSize
    const res = await api.get('/transactions', { params: { limit, offset } })
    return res.data
  },
  async create(payload){
    const res = await api.post('/transactions', payload)
    return res.data.transaction
  }
}
