interface StatusLoteProps {
    tipo: string;
    texto: string;
}

function StatusLote({ tipo, texto }: StatusLoteProps) {

    if (tipo === "vencido") {
        return (
            <span className="bg-red-100 text-red-700 px-3 py-2 rounded-full">
                {texto}
            </span>
        );
    }

    if (tipo === "proximo") {
        return (
            <span className="bg-orange-100 text-orange-700 px-3 py-2 rounded-full">
                {texto}
            </span>
        );
    }

    return <span>—</span>;
}

export default StatusLote;