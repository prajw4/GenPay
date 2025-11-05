import axios from 'axios'

const api = axios.create({
	// In production the frontend will call the backend at the same origin, so use a
	// relative path by default. For development you may set VITE_API_URL to the
	// full backend URL (e.g. http://localhost:3000/api/v1).
	baseURL: import.meta.env.VITE_API_URL || '/api/v1',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
})

// Note: JWT is stored in HTTP-only cookie; do not attach token from localStorage
// Requests will include cookies automatically because `withCredentials` is true.

export default api
