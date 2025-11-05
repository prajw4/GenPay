import { useSearchParams } from "react-router-dom"
import axios from "axios";
import api from '../services/api'
import { useState } from "react";
import { useNotify } from '../context/NotificationContext'
export const SendMoney = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false)
    const { push } = useNotify()
    

    return <div class="flex justify-center h-screen bg-gray-100">
        <div className="h-full flex flex-col justify-center">
            <div
                class="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
                <div class="flex flex-col space-y-1.5 p-6">
                <h2 class="text-3xl font-bold text-center">Send Money</h2>
                </div>
                <div class="p-6">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <span class="text-2xl text-white">{name[0].toUpperCase()}</span>
                    </div>
                    <h3 class="text-2xl font-semibold">{name}</h3>
                </div>
                <div class="space-y-4">
                    <div class="space-y-2">
                    <label
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        for="amount"
                    >
                        Amount (in Rs)
                    </label>
                    <input
                    onChange={(e)=>{
                        setAmount(e.target.value);
                    }}
                        type="number"
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        id="amount"
                        placeholder="Enter amount"
                    />
                    </div>
                    <button onClick={async ()=>{
                        setLoading(true)
                        try{
                            await api.post('/account/transfer', { to: id, amount })
                            push('Transfer initiated', 'success')
                        }catch(err){
                            console.error('Transfer failed', err)
                            push('Transfer failed — backend may be down', 'error')
                        } finally { setLoading(false) }
                    }} class="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-gray-800 text-white hover:bg-green-500">
                        {loading ? 'Please wait...' : 'Initiate Transfer'}
                    </button>
                </div>
                </div>
        </div>
      </div>
    </div>
}