import axios from 'axios'

// Resolve API base dynamically so the app works in both local and production
// - If VITE_API_URL is set (in production or dev overrides), use it
// - Otherwise use a relative path so the frontend can talk to a backend
//   hosted on the same origin (e.g., when deployed behind the same domain)
const apiBase = import.meta.env.VITE_API_URL ?? '/api/v1'

const api = axios.create({
	baseURL: apiBase,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
})

// Note: JWT is stored in HTTP-only cookie; do not attach token from localStorage
// Requests will include cookies automatically because `withCredentials` is true.

export default api
