import { useState, type FormEvent } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import logo from "../src/assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { mensagemDeErro } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const login = async (destino: string) => {
    if (!email.trim() || !password.trim()) { setError("Informe seu e-mail e senha para continuar."); return; }
    setSending(true);
    try {
      await entrar(email.trim(), password);
      navigate(destino);
    } catch (erro) {
      setError(mensagemDeErro(erro));
    } finally {
      setSending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login("/painel");
  };

  return (
    <main className="min-h-screen bg-bege md:grid md:grid-cols-[43%_57%]">
      <section className="flex min-h-[220px] flex-col justify-center bg-verdeEscuro px-8 py-12 text-white md:min-h-screen md:px-[12%]">
        <div className="mb-5 flex items-center gap-3">
          <img src={logo} alt="" className="h-8 w-8" />
          <h1 className="brand-font text-2xl font-semibold">StockFlow</h1>
        </div>
        <p className="max-w-[340px] text-[15px] leading-6 text-verdeTexto">Sistema de Gestão de Estoque para supermercado.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <h2 className="page-title">Entrar no sistema</h2>
          <p className="page-subtitle mb-7">Acesse com seu usuário do supermercado.</p>
          <div className="field mb-4">
            <label htmlFor="email">E-mail</label>
            <input id="email" className="control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <div className="relative">
              <input id="password" className="control pr-11" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-pretoClaro">
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-pretoClaro"><input type="checkbox" className="accent-verdeEscuro" defaultChecked /> Manter conectado</label>
            <span className="text-pretoClaro">Esqueceu a senha? Fale com o administrador.</span>
          </div>
          {error && <p className="mt-4 rounded-md bg-vermelhoClaro p-3 text-xs text-vermelhoEscuro">{error}</p>}
          <button className="btn btn-primary mt-6 w-full" type="submit" disabled={sending}>{sending ? "Entrando..." : "Entrar"}</button>
          <button type="button" onClick={() => login("/recebimento")} disabled={sending} className="mt-4 w-full text-center text-xs font-semibold text-verdeClaro underline-offset-4 hover:underline">Entrar no modo de recebimento móvel</button>
        </form>
      </section>
    </main>
  );
}

export default Login;
