interface botaoVerdeProps {
    text: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function BotaoVerde({text, onClick } : botaoVerdeProps) {
    return (
        <button onClick={onClick} className="bg-verdeEscuro text-white rounded-lg h-10 w-35 text-lg cursor-pointer">
            {text}
        </button>
    )
}

export default BotaoVerde