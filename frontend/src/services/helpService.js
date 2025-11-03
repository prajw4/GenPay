import api from './api'

const helpService = {
  async ask(question) {
    const response = await api.post('/help/ask', { question })
    return response.data
  }
}

export default helpService
