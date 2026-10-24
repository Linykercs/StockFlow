import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import Entrada from "../pages/Entrada";
import Login from "../pages/Login";
import Lotes from "../pages/Lotes";
import Movimentacoes from "../pages/Movimentacoes";
import NovoProduto from "../pages/NovoProduto";
import Painel from "../pages/Painel";
import Produtos from "../pages/Produtos";
import Recebimento from "../pages/Recebimento";
import Relatorios from "../pages/Relatorios";
import Saida from "../pages/Saida";
import Usuarios from "../pages/Usuarios";
import { StockProvider } from "../context/StockContext";

function App() {
  return (
    <StockProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/recebimento" element={<Recebimento />} />
          <Route element={<Layout />}>
            <Route path="/painel" element={<Painel />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/produtos/novo" element={<NovoProduto />} />
            <Route path="/produtos/:id" element={<NovoProduto />} />
            <Route path="/entrada" element={<Entrada />} />
            <Route path="/saida" element={<Saida />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </BrowserRouter>
    </StockProvider>
  );
}

export default App;
