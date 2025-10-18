
export const Balance = ({value}) => {
    const numeric = Number(value) || 0
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="font-bold text-lg mb-2">Your Balance</div>
            <div className="font-bold text-black text-3xl md:text-4xl truncate w-full text-center">Rs {numeric.toFixed(2)}</div>
        </div>
    )
}