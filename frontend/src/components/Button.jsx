export function Button({label, onClick, loading}){
    return <button disabled={loading} onClick={onClick} type="button" className={`w-full text-white ${loading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-green-500'} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2`}>
        {loading ? 'Please wait...' : label}
    </button>
}