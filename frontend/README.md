# StockFlow

Interface de gestão de estoque, lotes e validades para o Supermercado Irmãos Costa. O projeto é uma SPA em React, TypeScript, Vite e Tailwind CSS.

## Funcionalidades

- painel com alertas, resumo financeiro e movimentos recentes;
- cadastro, edição, busca, filtros e exclusão de produtos;
- entrada e saída de estoque integradas aos lotes;
- acompanhamento de vencimentos, priorização e baixa de lotes;
- histórico de movimentações com filtros e exportação CSV;
- relatórios gerenciais e impressão em PDF;
- gestão de usuários e matriz de permissões;
- fluxo móvel de conferência e recebimento de carga.

Os dados vêm da API do backend (`services/api.ts`). O login guarda o token no navegador e cada tela mostra só o que o perfil do usuário pode ver. Só a marcação de "priorizar venda" dos lotes fica no `localStorage`.

Para rodar, o backend precisa estar na porta 8080 (veja o README da raiz). O `vite.config.ts` repassa `/api` e `/docs` para ele.

## Execução

```bash
npm install
npm run dev
```

Validação:

```bash
npm run lint
npm run build
```
