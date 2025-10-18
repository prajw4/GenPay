import api from './api'

export default {
  async summarizeExpenses(payload){
    const res = await api.post('/ai/summarize', payload)
    return res.data
  }
}
