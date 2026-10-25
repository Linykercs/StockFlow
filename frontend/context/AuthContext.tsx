/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, lerToken, quandoSessaoExpirar, salvarToken } from "../services/api";
import type { ApiUsuario } from "../types/Api";

interface AuthContextValue {
  usuario: ApiUsuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<ApiUsuario | null>(null);
  const [carregando, setCarregando] = useState(() => Boolean(lerToken()));

  const sair = useCallback(() => {
    salvarToken(null);
    setUsuario(null);
  }, []);

  // ao abrir a página com um token salvo, confere se ele ainda vale
  useEffect(() => {
    quandoSessaoExpirar(sair);
    if (!lerToken()) return;
    api.get<ApiUsuario>("/auth/me")
      .then(setUsuario)
      .catch(sair)
      .finally(() => setCarregando(false));
  }, [sair]);

  const entrar = async (email: string, senha: string) => {
    const resposta = await api.post<{ token: string; usuario: ApiUsuario }>("/auth/login", { email, senha });
    salvarToken(resposta.token);
    setUsuario(resposta.usuario);
  };

  return <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

export const nomeDoPerfil = { ADMINISTRADOR: "Administrador", GERENTE: "Gerente de estoque", OPERADOR: "Operador" } as const;

export const podeGerenciar = (usuario: ApiUsuario | null) => usuario?.perfil === "ADMINISTRADOR" || usuario?.perfil === "GERENTE";
