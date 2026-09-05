import { useEffect, useState } from "react";
import { listarProdutos } from "../services/estoqueService";
import type { Produto } from "../types/estoque";

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarProdutos()
      .then(setProdutos)
      .catch(() => setErro("Não foi possível carregar os produtos"));
  }, []);

  return (
    <div>
      <h1>Produtos</h1>

      {erro && <p>{erro}</p>}

      <div className="cartao">
        <table className="tabela-alertas">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Unidade</th>
              <th>Estoque mínimo</th>
              <th>Quantidade total</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.nome}</td>
                <td>{produto.categoria ?? "-"}</td>
                <td>{produto.unidadeMedida}</td>
                <td className="numero-mono">{produto.estoqueMinimo}</td>
                <td className="numero-mono">{produto.quantidadeTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
