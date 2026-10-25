// Chamadas ao backend. Em desenvolvimento o Vite repassa /api para o Spring Boot (ver vite.config.ts).
const BASE = import.meta.env.VITE_API_URL ?? "/api";
const CHAVE_TOKEN = "stockflow:token";

export class ErroApi extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

export const lerToken = () => {
  try { return localStorage.getItem(CHAVE_TOKEN); } catch { return null; }
};

export const salvarToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch { /* navegador sem localStorage: o login dura só até recarregar a página */ }
};

let aoExpirarSessao: () => void = () => {};
export const quandoSessaoExpirar = (callback: () => void) => { aoExpirarSessao = callback; };

async function requisicao<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const token = lerToken();
  const resposta = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: {
      ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // token vencido ou usuário inativado: volta para o login
    if (resposta.status === 401 && token) aoExpirarSessao();
    throw new ErroApi(resposta.status, dados?.mensagem ?? "Não foi possível falar com o servidor.");
  }
  return dados as T;
}

export const api = {
  get: <T>(caminho: string) => requisicao<T>("GET", caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisicao<T>("POST", caminho, corpo ?? {}),
  put: <T>(caminho: string, corpo: unknown) => requisicao<T>("PUT", caminho, corpo),
  delete: (caminho: string) => requisicao<void>("DELETE", caminho),
};

export const mensagemDeErro = (erro: unknown) =>
  erro instanceof Error ? erro.message : "Algo deu errado. Tente de novo.";
