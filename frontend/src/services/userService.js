import api from './api'

export default {
  async signin(credentials){
    const res = await api.post('/user/signin', credentials)
    return res.data
  },
  async signup(payload){
    const res = await api.post('/user/signup', payload)
    return res.data
  },
  async getCurrentUser(){
    const res = await api.get('/user/me')
    return res.data.user
  },
  async list(query){
    const res = await api.get('/user/bulk', { params: query })
    return res.data
  }
}
