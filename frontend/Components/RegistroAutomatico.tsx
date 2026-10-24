function RegistroAutomatico () {
    return (
        <div className='bg-[#FFFDF8] h-40 rounded-lg p-5'>
            <p className="text-xl font-semibold pb-5">Registro automático</p>

            <div className="flex gap-20">
                <div className="flex flex-col">
                    <p className="text-[#A79C8B] text-sm">USÚARIO RESPONSÁVEL</p>
                    <p>Amanda Moniele</p>
                </div>

                <div className="flex flex-col">
                    <p className="text-[#A79C8B] text-sm">DATA E HORA</p>
                    <div className="flex items-center gap-2">
                        <span>06/10/2026</span> 
                        <span>.</span> 
                        <span>20:30</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <p className="text-[#A79C8B] text-sm">ORIGEM</p>
                    <p>Entrada por nota fiscal</p>
                </div>
            </div>
        </div>
    )
}

export default RegistroAutomatico