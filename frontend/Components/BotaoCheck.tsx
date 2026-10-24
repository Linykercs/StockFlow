function BotaoCheck() {
    return (
        <div className="bg-[#E3DACB] h-20 p-5 rounded-lg w-full">
            <label className="group flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" />
            <span className="w-5 h-5 rounded-full border-2 border-gray-400 
               flex items-center justify-center
               transition-all
               group-has-[:checked]:border-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500 
                 scale-0 transition-transform
                 group-has-[:checked]:scale-100"></span>
            </span>
            <div className="">
                <span>Lote L-2180</span>
                <div className="flex gap-2">
                    <span className="text-[#7A7264]">Validade 28/08/2026</span>
                    <span className="text-[#7A7264]">0 un</span>
                </div>
            </div>
        </label>

        <div>

        </div>
        </div>
    )
}

export default BotaoCheck