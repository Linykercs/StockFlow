import { useState, type FormEvent } from "react";
import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import ConfirmModal from "../Components/ConfirmModal";
import Toast from "../Components/Toast";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import { mensagemDeErro } from "../services/api";
import type { PerfilUsuario } from "../types/Api";
import type { StockUser, UserInput } from "../types/Produto";

const emptyUser: UserInput = { name: "", email: "", password: "", profile: "OPERADOR", sector: "", status: "Ativo" };
const permissions = [
  { action: "Cadastrar e editar produtos", admin: "Sim", manager: "Sim", operator: "Não" },
  { action: "Registrar entradas e saídas", admin: "Sim", manager: "Sim", operator: "Sim" },
  { action: "Registrar lotes e dar baixa", admin: "Sim", manager: "Sim", operator: "Sim" },
  { action: "Alterar valores e variação de preço", admin: "Sim", manager: "Sim", operator: "Não" },
  { action: "Visualizar relatórios gerenciais", admin: "Sim", manager: "Sim", operator: "Não" },
  { action: "Gerenciar usuários e acessos", admin: "Sim", manager: "Não", operator: "Não" },
];

function Usuarios() {
  const { usuario } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useStock();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockUser | null>(null);
  const [form, setForm] = useState<UserInput>(emptyUser);
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState<StockUser | null>(null);
  const [toast, setToast] = useState("");
  const openCreate = () => { setEditing(null); setForm(emptyUser); setFormError(""); setFormOpen(true); };
  const openEdit = (user: StockUser) => { setEditing(user); setForm({ name: user.name, email: user.email, password: "", profile: user.profile, sector: user.sector, status: user.status }); setFormError(""); setFormOpen(true); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      if (editing) await updateUser(editing.id, form); else await addUser(form);
      setFormOpen(false);
      setToast(editing ? "Usuário atualizado." : "Usuário criado.");
    } catch (erro) {
      setFormError(mensagemDeErro(erro));
    }
  };
  const remove = async () => {
    if (!toDelete) return;
    try {
      await deleteUser(toDelete.id);
      setToast("Usuário inativado.");
    } catch (erro) {
      setToast(mensagemDeErro(erro));
    }
    setToDelete(null);
  };

  return (
    <div className="page-shell">
      <header className="page-header"><div><h1 className="page-title">Usuários e permissões</h1><span className="page-subtitle">{users.length} usuários cadastrados · {users.filter((item) => item.status === "Ativo").length} ativos</span></div><button className="btn btn-primary" onClick={openCreate}>+ Novo usuário</button></header>
      <div className="table-wrap mb-5"><table className="data-table"><thead><tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Setor</th><th>Status</th><th aria-label="Ações" /></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="font-semibold">{user.name}</td><td>{user.email}</td><td><span className={`badge ${user.role === "Administrador" ? "badge-yellow" : "badge-green"}`}>{user.role}</span></td><td>{user.sector || "—"}</td><td><span className={`badge ${user.status === "Ativo" ? "badge-green" : "badge-red"}`}>{user.status}</span></td><td><div className="flex justify-end gap-1"><button className="btn btn-ghost icon-btn" title="Editar" onClick={() => openEdit(user)}><HiOutlinePencilSquare /></button>{user.status === "Ativo" && String(usuario?.id) !== user.id && <button className="btn btn-ghost icon-btn text-vermelhoEscuro" title="Inativar" onClick={() => setToDelete(user)}><HiOutlineTrash /></button>}</div></td></tr>)}</tbody></table></div>
      <section className="card overflow-hidden"><div className="border-b border-[#eee8dd] p-5"><h2 className="section-title">Matriz de permissões por perfil</h2></div><div className="table-wrap border-0"><table className="data-table"><thead><tr><th>Funcionalidade</th><th>Administrador</th><th>Gerente</th><th>Operador</th></tr></thead><tbody>{permissions.map((item) => <tr key={item.action}><td className="font-semibold">{item.action}</td>{[item.admin, item.manager, item.operator].map((value, index) => <td key={index} className={value === "Sim" ? "font-semibold text-[#39794d]" : "text-pretoClaro"}>{value}</td>)}</tr>)}</tbody></table></div></section>
      {formOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setFormOpen(false)}><form className="modal" onSubmit={submit}><h2 className="page-title mb-1">{editing ? "Editar usuário" : "Novo usuário"}</h2><p className="mb-6 text-sm text-pretoClaro">Defina os dados de acesso e o perfil.</p>{formError && <p className="mb-4 rounded-md bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro">{formError}</p>}<div className="grid gap-4"><div className="field"><label htmlFor="userName">Nome completo</label><input id="userName" className="control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div><div className="field"><label htmlFor="userEmail">E-mail</label><input id="userEmail" className="control" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div><div className="field"><label htmlFor="userPassword">{editing ? "Nova senha (deixe em branco para manter)" : "Senha (mínimo 6 caracteres)"}</label><input id="userPassword" className="control" type="password" minLength={6} required={!editing} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" /></div><div className="grid grid-cols-2 gap-4"><div className="field"><label>Perfil</label><select className="control" value={form.profile} onChange={(event) => setForm({ ...form, profile: event.target.value as PerfilUsuario })}><option value="ADMINISTRADOR">Administrador</option><option value="GERENTE">Gerente de estoque</option><option value="OPERADOR">Operador</option></select></div><div className="field"><label>Setor</label><input className="control" value={form.sector} onChange={(event) => setForm({ ...form, sector: event.target.value })} placeholder="Ex.: Mercearia" /></div></div><div className="field"><label>Status</label><select className="control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Ativo" | "Inativo" })}><option>Ativo</option><option>Inativo</option></select></div></div><div className="mt-7 flex justify-end gap-3"><button className="btn btn-secondary" type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="btn btn-primary">Salvar usuário</button></div></form></div>}
      <ConfirmModal open={Boolean(toDelete)} title="Inativar este usuário?" confirmLabel="Inativar usuário" onClose={() => setToDelete(null)} onConfirm={remove} description={<>O acesso de <strong>{toDelete?.name}</strong> será bloqueado. O histórico de movimentações já registrado permanecerá preservado.</>} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

export default Usuarios;
