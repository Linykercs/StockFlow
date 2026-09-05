import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import "./Layout.css";

export function Layout() {
  const { usuario, sair } = useAuth();

  return (
    <div className="layout-app">
      <aside className="menu-lateral">
        <h2 className="menu-lateral__marca">StockFlow</h2>
        <nav className="menu-lateral__nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/produtos">Produtos</NavLink>
          <NavLink to="/movimentacoes">Movimentações</NavLink>
        </nav>
        <div className="menu-lateral__usuario">
          <p>{usuario?.nome}</p>
          <p className="menu-lateral__perfil">{usuario?.perfil}</p>
          <Button variante="secondary" onClick={sair}>
            Sair
          </Button>
        </div>
      </aside>
      <main className="layout-conteudo">
        <Outlet />
      </main>
    </div>
  );
}
