interface CardLoteProps {
    texto: string,
    quantidade: string
}

function CardLote ({texto, quantidade} : CardLoteProps) {
    return (
        <div className="border border-borderInput bg-white w-90 h-25 rounded-lg flex flex-col p-5">
            <span className="text-[#7A7264]">{texto}</span>
            <span className="text-2xl font-semibold">{quantidade}</span>
        </div>
    )
}

export default CardLote