import type { ReactNode } from "react";
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
import { AuthProvider, podeGerenciar, useAuth } from "../context/AuthContext";
import { StockProvider, useStock } from "../context/StockContext";
import type { PerfilUsuario } from "../types/Api";

// só deixa entrar logado; perfis limita a tela a quem tem permissão (RN05 e usuários)
function Protegida({ children, perfis }: { children: ReactNode; perfis?: PerfilUsuario[] }) {
  const { usuario, carregando } = useAuth();
  const { loading, loadError } = useStock();
  if (carregando) return <div className="empty-state min-h-screen">Carregando...</div>;
  if (!usuario) return <Navigate to="/" replace />;
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to="/painel" replace />;
  if (loading) return <div className="empty-state min-h-screen">Carregando dados do estoque...</div>;
  if (loadError) return <div className="empty-state min-h-screen text-vermelhoEscuro">{loadError}</div>;
  return children;
}

function PaginaDeLogin() {
  const { usuario } = useAuth();
  return usuario ? <Navigate to="/painel" replace /> : <Login />;
}

function Rotas() {
  const { usuario } = useAuth();
  const gestores: PerfilUsuario[] = ["ADMINISTRADOR", "GERENTE"];
  return (
    <Routes>
      <Route path="/" element={<PaginaDeLogin />} />
      <Route path="/recebimento" element={<Protegida><Recebimento /></Protegida>} />
      <Route element={<Protegida><Layout /></Protegida>}>
        <Route path="/painel" element={<Painel />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/novo" element={podeGerenciar(usuario) ? <NovoProduto /> : <Navigate to="/produtos" replace />} />
        <Route path="/produtos/:id" element={<NovoProduto />} />
        <Route path="/entrada" element={<Entrada />} />
        <Route path="/saida" element={<Saida />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/movimentacoes" element={<Movimentacoes />} />
        <Route path="/relatorios" element={<Protegida perfis={gestores}><Relatorios /></Protegida>} />
        <Route path="/usuarios" element={<Protegida perfis={["ADMINISTRADOR"]}><Usuarios /></Protegida>} />
      </Route>
      <Route path="*" element={<Navigate to="/painel" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <BrowserRouter>
          <Rotas />
        </BrowserRouter>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
