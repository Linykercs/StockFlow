import { useEffect, useState } from "react";
import { buscarDashboard } from "../services/estoqueService";
import type { DashboardResumo } from "../types/estoque";
import { Badge } from "../components/ui/Badge";
import "./Dashboard.css";

export function Dashboard() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarDashboard()
      .then(setResumo)
      .catch(() => setErro("Não foi possível carregar o dashboard"));
  }, []);

  if (erro) {
    return <p>{erro}</p>;
  }

  if (!resumo) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="dashboard__cartoes">
        <div className="cartao">
          <p>Produtos cadastrados</p>
          <strong className="numero-mono">{resumo.totalProdutos}</strong>
        </div>
        <div className="cartao">
          <p>Lotes em estoque</p>
          <strong className="numero-mono">{resumo.lotesEmEstoque}</strong>
        </div>
        <div className="cartao">
          <p>Estoque baixo</p>
          <strong className="numero-mono">{resumo.lotesEstoqueBaixo}</strong>
        </div>
        <div className="cartao">
          <p>Vencendo / vencidos</p>
          <strong className="numero-mono">{resumo.lotesVencendo + resumo.lotesVencidos}</strong>
        </div>
      </div>

      <h2>Alertas</h2>
      <div className="cartao">
        {resumo.alertas.length === 0 ? (
          <p>Nenhum alerta no momento.</p>
        ) : (
          <table className="tabela-alertas">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Validade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resumo.alertas.map((lote) => (
                <tr key={lote.id}>
                  <td>{lote.produtoNome}</td>
                  <td className="numero-mono">{lote.quantidade}</td>
                  <td>{lote.dataValidade ?? "-"}</td>
                  <td>
                    <Badge status={lote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
