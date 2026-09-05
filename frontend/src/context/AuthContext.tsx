import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import type { UsuarioLogado } from "../types/estoque";
import { login as loginRequest } from "../services/authService";

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function carregarUsuarioSalvo(): UsuarioLogado | null {
  const bruto = localStorage.getItem("stockflow.usuario");
  return bruto ? (JSON.parse(bruto) as UsuarioLogado) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(carregarUsuarioSalvo);

  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario,
      entrar: async (email: string, senha: string) => {
        const usuarioLogado = await loginRequest(email, senha);
        localStorage.setItem("stockflow.token", usuarioLogado.token);
        localStorage.setItem("stockflow.usuario", JSON.stringify(usuarioLogado));
        setUsuario(usuarioLogado);
      },
      sair: () => {
        localStorage.removeItem("stockflow.token");
        localStorage.removeItem("stockflow.usuario");
        setUsuario(null);
      },
    }),
    [usuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return contexto;
}
