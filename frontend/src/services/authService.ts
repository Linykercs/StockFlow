import { api } from "./api";
import type { UsuarioLogado } from "../types/estoque";

interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  perfil: UsuarioLogado["perfil"];
}

export async function login(email: string, senha: string): Promise<UsuarioLogado> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, senha });
  return { nome: data.nome, email: data.email, perfil: data.perfil, token: data.token };
}
