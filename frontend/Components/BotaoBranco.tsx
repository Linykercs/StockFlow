interface botaoBrancoProps {
    text: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function BotaoBranco({text, onClick} : botaoBrancoProps) {
    return (
        <button onClick={onClick} className="bg-branco text-verdeEscuro rounded-lg h-10 w-35 text-lg cursor-pointer border border-verdeEscuro">
            {text}
        </button>
    )
}

export default BotaoBranco