import { useEffect, useState } from "react"
import userService from "../services/userService"


export const Users = (props) => {
    
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        let mounted = true
        const fetchUsers = async () => {
            try {
                const data = await userService.list({ filter })
                if (!mounted) return
                // handle possible shapes returned by the API
                const arr = data.user || data.users || (Array.isArray(data) ? data : [])
                // exclude current user if requested
                const filtered = props.excludeUserId ? arr.filter(u => (u._id || u.id) !== props.excludeUserId) : arr
                setUsers(filtered)
            } catch (err) {
                console.error('Failed to load users', err)
            }
        }

        fetchUsers()
        return () => { mounted = false }
    }, [filter])

    return <>
        <div className="my-2">
            <input onChange={(e) => {
                setFilter(e.target.value)
            }} type="text" placeholder="Search users.." className="w-full px-2 py-1 border rounded border-slate-200"></input>
        </div>
    <div className="max-h-48 overflow-y-auto rounded bg-white shadow">
            {users.map(user => <User key={user._id} user={user} onSelect={props.onSelectUser} />)}
        </div>
    </>
}
function User({user, onSelect}) {
    return <div className="flex justify-between items-center hover:bg-slate-50 p-2 rounded cursor-pointer" onClick={() => onSelect ? onSelect(user) : null}>
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstName ? user.firstName[0] : ''}
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <div>
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>

        <div className="text-sm text-gray-500">
            {/* intentionally only showing name; username hidden per requirement */}
        </div>
    </div>
}