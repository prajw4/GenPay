import axios from 'axios'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
})

// Note: JWT is stored in HTTP-only cookie; do not attach token from localStorage
// Requests will include cookies automatically because `withCredentials` is true.

export default api
