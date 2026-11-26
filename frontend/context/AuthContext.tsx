/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, lerToken, quandoSessaoExpirar, salvarToken } from "../services/api";
import type { ApiLoginDesafio, ApiUsuario } from "../types/Api";

interface AuthContextValue {
  usuario: ApiUsuario | null;
  carregando: boolean;
  // 1ª etapa: confere e-mail e senha, devolve o desafio do autenticador (MFA)
  entrar: (email: string, senha: string) => Promise<ApiLoginDesafio>;
  // 2ª etapa: confere o código de 6 dígitos e só aí conclui o login
  confirmarMfa: (loginToken: string, codigo: string) => Promise<void>;
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

  const entrar = (email: string, senha: string) => api.post<ApiLoginDesafio>("/auth/login", { email, senha });

  const confirmarMfa = async (loginToken: string, codigo: string) => {
    const resposta = await api.post<{ token: string; usuario: ApiUsuario }>("/auth/login/confirmar", { loginToken, codigo });
    salvarToken(resposta.token);
    setUsuario(resposta.usuario);
  };

  return <AuthContext.Provider value={{ usuario, carregando, entrar, confirmarMfa, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

export const nomeDoPerfil = { ADMINISTRADOR: "Administrador", GERENTE: "Gerente de estoque", OPERADOR: "Operador" } as const;

export const podeGerenciar = (usuario: ApiUsuario | null) => usuario?.perfil === "ADMINISTRADOR" || usuario?.perfil === "GERENTE";
