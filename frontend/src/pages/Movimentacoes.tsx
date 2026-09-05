import { useEffect, useState } from "react";
import { listarMovimentacoesRecentes } from "../services/estoqueService";
import type { Movimentacao } from "../types/estoque";

export function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarMovimentacoesRecentes()
      .then(setMovimentacoes)
      .catch(() => setErro("Não foi possível carregar as movimentações"));
  }, []);

  return (
    <div>
      <h1>Movimentações</h1>

      {erro && <p>{erro}</p>}

      <div className="cartao">
        <table className="tabela-alertas">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Usuário</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((mov) => (
              <tr key={mov.id}>
                <td>{mov.produtoNome}</td>
                <td>{mov.tipo === "ENTRADA" ? "Entrada" : "Saída"}</td>
                <td className="numero-mono">{mov.quantidade}</td>
                <td>{mov.usuarioNome}</td>
                <td>{new Date(mov.dataHora).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
