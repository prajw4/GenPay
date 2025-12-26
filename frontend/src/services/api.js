import axios from 'axios'


let apiBase;
if (import.meta.env.DEV) {
  apiBase = '/api/v1'
} else {
  apiBase = import.meta.env.VITE_API_URL ?? '/api/v1'
}

const api = axios.create({
	baseURL: apiBase,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
})


export default api
