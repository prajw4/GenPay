import api from './api'

export default {
  async getTransactions(){
    const res = await api.get('/account/transactions')
    return res.data.transactions || []
  },
  async createTransaction(payload){
    const res = await api.post('/account/transaction', payload)
    return res.data
  }
}
