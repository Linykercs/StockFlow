import { verificarValidade } from "./verificarValidade";

interface Produto {
    estoque: number;
    estoqueMinimo: number;
    dataValidade: string;
}

export function verificarSituacao(produto: Produto) {

    const validade = verificarValidade(produto.dataValidade);

    if (validade.tipo === "vencido") {
        return {
            tipo: "vencido",
            texto: "Vencido"
        };
    }

    if (validade.tipo === "proximo") {
        return {
            tipo: "proximo",
            texto: validade.texto
        };
    }

    if (produto.estoque < produto.estoqueMinimo) {
        return {
            tipo: "minimo",
            texto: "Abaixo do mínimo"
        };
    }

    return {
        tipo: "normal",
        texto: ""
    };
}