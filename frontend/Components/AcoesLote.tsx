interface AcoesLoteProps {
    tipo: string;
}

function AcoesLote({ tipo }: AcoesLoteProps) {

    return (
        <div className="flex gap-2">

            {tipo === "vencido" && (
                <button className="bg-[#B94732] text-white px-4 py-2 rounded-lg cursor-pointer">
                    Dar baixa
                </button>
            )}

            {tipo === "proximo" && (
                <button className="border border-gray-300 bg-branco px-4 py-2 rounded-lg cursor-pointer">
                    Priorizar venda
                </button>
            )}

            <button className="border border-gray-300 bg-branco px-4 py-2 rounded-lg cursor-pointer">
                Ver
            </button>

        </div>
    );
}

export default AcoesLote;