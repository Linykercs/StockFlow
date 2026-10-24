export function verificarValidade(dataValidade: string) {
    const hoje = new Date();

    const [dia, mes, ano] = dataValidade.split("/").map(Number);

    const validade = new Date(ano, mes - 1, dia);

    hoje.setHours(0, 0, 0, 0);
    validade.setHours(0, 0, 0, 0);

    const diferenca = validade.getTime() - hoje.getTime();

    const diasRestantes = Math.ceil(
        diferenca / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) {
        return {
            tipo: "vencido",
            texto: "Lote vencido",
        };
    }

    if (diasRestantes <= 7) {
        return {
            tipo: "proximo",
            texto: `Vence em ${diasRestantes} dias`,
        };
    }

    return {
        tipo: "normal",
        texto: "",
    };
}