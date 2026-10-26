import { NavLink, useNavigate } from "react-router-dom";
import { BsBoxSeam, BsBoxes, BsClockHistory, BsGraphUpArrow, BsPeople, BsSpeedometer2 } from "react-icons/bs";
import { HiOutlineArrowRightOnRectangle, HiOutlineArrowsRightLeft, HiOutlineQrCode } from "react-icons/hi2";
import logo from "../src/assets/logo.png";
import { nomeDoPerfil, useAuth } from "../context/AuthContext";
import type { PerfilUsuario } from "../types/Api";

const todos: PerfilUsuario[] = ["ADMINISTRADOR", "GERENTE", "OPERADOR"];
const menu = [
  { to: "/painel", label: "Painel", icon: BsSpeedometer2, perfis: todos },
  { to: "/produtos", label: "Produtos", icon: BsBoxSeam, perfis: todos },
  { to: "/entrada", label: "Entradas e saídas", icon: HiOutlineArrowsRightLeft, perfis: todos },
  { to: "/recebimento", label: "Receber carga", icon: HiOutlineQrCode, perfis: todos },
  { to: "/lotes", label: "Lotes", icon: BsBoxes, perfis: todos },
  { to: "/movimentacoes", label: "Movimentações", icon: BsClockHistory, perfis: todos },
  { to: "/relatorios", label: "Relatórios", icon: BsGraphUpArrow, perfis: ["ADMINISTRADOR", "GERENTE"] as PerfilUsuario[] },
  { to: "/usuarios", label: "Usuários", icon: BsPeople, perfis: ["ADMINISTRADOR"] as PerfilUsuario[] },
];

function Sidebar() {
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();
  const items = menu.filter((item) => usuario && item.perfis.includes(usuario.perfil));
  const iniciais = (usuario?.nome ?? "").split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  const logout = () => { sair(); navigate("/"); };
  const linkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${isActive ? "bg-[#315844] text-white" : "text-[#b7c6b1] hover:bg-[#294b3a] hover:text-white"}`;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[230px] flex-col bg-verdeEscuro px-4 py-6 md:flex">
        <div className="mb-9 flex items-center gap-2 px-2">
          <img src={logo} alt="" className="h-6 w-6 object-contain" />
          <h1 className="brand-font text-lg font-semibold text-white">StockFlow</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}><Icon className="text-base" />{label}</NavLink>
          ))}
        </nav>
        <button onClick={logout} title="Sair" className="flex items-center gap-3 rounded-lg bg-[#294b3a] p-3 text-left text-white">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#c76436] text-xs font-bold">{iniciais}</span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-xs">{usuario?.nome}</strong><small className="block text-[10px] text-verdeTexto">{usuario ? nomeDoPerfil[usuario.perfil] : ""}</small></span>
          <HiOutlineArrowRightOnRectangle />
        </button>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-center justify-around border-t border-[#d8d0c2] bg-[#203d30] px-2 md:hidden">
        {items.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} aria-label={label} className={({ isActive }) => `flex min-w-14 flex-col items-center gap-1 text-[9px] ${isActive ? "text-white" : "text-[#a9b9ad]"}`}>
            <Icon className="text-xl" /><span>{label === "Entradas e saídas" ? "Movimentar" : label === "Receber carga" ? "Receber" : label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;
