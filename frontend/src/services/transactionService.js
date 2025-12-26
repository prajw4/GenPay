import api from './api'

export default {
  async list(){
    const res = await api.get('/transactions')
    return res.data.transactions || []
  },
  async create(payload){
    const res = await api.post('/transactions', payload)
    return res.data.transaction
  }
}
