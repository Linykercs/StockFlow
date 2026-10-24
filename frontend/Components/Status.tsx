interface StatusProp {
    status: string
}

function Status({ status } : StatusProp) {
    let cor = "bg-gray-200 text-gray-800";

    if (status === "Abaixo do mínimo") {
        cor = "bg-yellow-100 text-yellow-800";
    } else if (status === "Sem estoque") {
        cor = "bg-red-100 text-red-800";
    } else if (status === "Em estoque") {
        cor = "bg-green-700 text-white"
    }

    return (
        <span className={`px-5 py-2 rounded-full text-xs font-bold ${cor}`}>
            {status}
        </span>
    )
}

export default Status