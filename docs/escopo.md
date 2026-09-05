# Escopo do Projeto Integrador — StockFlow

## Identificação

- **Projeto:** StockFlow — Sistema de Gestão de Estoque para Supermercado
- **Cliente (estudo de caso):** Supermercado Irmãos Costa
- **Período:** 16/08/2026 a 20/11/2026
- **Equipe:** Cauã Aparecido da Silva Duarte, Kaic Santana da Costa, Linyker Mendes Coelho, Amanda Moniele Garcia Silva
- **Protótipo:** alta fidelidade, no Figma (ver link no README) — 3 perfis de usuário, 10 requisitos funcionais

> Esses dados vêm da capa do Figma do projeto. O detalhamento completo dos 10 requisitos
> funcionais e das regras de negócio (RNxx) deve ser copiado aqui a partir do documento de
> especificação da disciplina — este arquivo cobre o que já dá pra confirmar pelo protótipo.

## Perfis de usuário

| Perfil | Acesso |
|---|---|
| Administrador | Acesso completo: usuários, produtos, categorias, fornecedores, lotes e movimentações |
| Gerente | Cadastro de produtos e lotes, registro de movimentações, relatórios |
| Operador | Registro de entrada/saída de estoque no dia a dia |

## Regras de negócio identificadas no protótipo

- **RN01** — Uma saída de estoque não pode ultrapassar a quantidade disponível no lote.
  O campo de quantidade exibe erro e informa o estoque disponível.
- **RN02** — Um lote vencido não aceita novas movimentações (nem entrada, nem saída).
- **RNF04** — Alto contraste na interface, pensado para uso por operadores (requisito não funcional).

## Domínio modelado (versão inicial)

- **Usuário** — nome, email, senha, perfil (Administrador/Gerente/Operador)
- **Categoria** — agrupamento simples de produtos
- **Fornecedor** — nome, CNPJ, telefone
- **Produto** — nome, código de barras, unidade de medida, estoque mínimo, categoria, fornecedor
- **Lote** — vinculado a um produto, com quantidade, data de validade, data de entrada e preço de custo
- **Movimentação de estoque** — entrada ou saída de um lote, associada ao usuário que registrou

O status de cada lote (em estoque / baixo / vencendo / vencido) é calculado dinamicamente
a partir da quantidade, do estoque mínimo do produto e da data de validade — não é um campo
salvo no banco.

## Fora do escopo desta primeira versão

- Fluxo de "conferência pendente" (badge `aguardando` do design system) — depende de definir
  o processo de conferência de estoque com a equipe.
- Relatórios avançados / exportação.
- Cadastro de múltiplos supermercados (multi-tenant).

## Próximos passos sugeridos

1. Colar aqui a lista completa dos 10 requisitos funcionais da proposta da disciplina.
2. Numerar e detalhar as regras de negócio (RN03 em diante) conforme forem aparecendo no Figma.
3. Ajustar o modelo de dados se o domínio real do cliente tiver categorias/fornecedores mais
   específicos do que o genérico assumido aqui.
