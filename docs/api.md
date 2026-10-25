# API do StockFlow

Contrato entre o backend e o frontend. O backend implementa estas rotas e o front consome do jeito que está aqui.
Se precisar mudar algo, altere este arquivo no mesmo PR e avise o grupo.

## padrões

- Endereço local: `http://localhost:8080/api`.
- JSON com nomes em camelCase e em português, seguindo as colunas do banco (`quantidadeAtual`, `dataValidade`).
- Ids são números (`Long`).
- Datas no formato `2026-10-25` e data com hora no formato `2026-10-25T14:30:00`.
- Quantidade e valor são números com casas decimais (`12.5`, `32.99`).
- Enums em maiúsculo, iguais ao banco:
  - perfil: `ADMINISTRADOR`, `GERENTE`, `OPERADOR`
  - unidadeMedida: `UNIDADE`, `KG`, `LITRO`
  - situacao do lote: `ATIVO`, `BAIXADO`, `DESCARTADO`
  - tipo da movimentação: `ENTRADA`, `SAIDA`
  - motivo: `RECEBIMENTO`, `DEVOLUCAO`, `VENDA`, `PERDA`, `VENCIMENTO`, `AJUSTE`
  - status do recebimento: `EM_CONFERENCIA`, `COM_DIVERGENCIA`, `CONCLUIDO`, `CANCELADO`

### autenticação

Toda rota, menos o login, exige o cabeçalho `Authorization: Bearer <token>`.
Sem token ou com token vencido a resposta é `401`. Com perfil sem permissão, `403`.

### erros

Todo erro volta no mesmo formato:

```json
{
  "status": 400,
  "mensagem": "Estoque insuficiente no lote L-2380. Disponível: 36."
}
```

| Código | Quando |
|---|---|
| 400 | Dado inválido ou regra de negócio quebrada (RN01, RN02) |
| 401 | Sem login |
| 403 | Perfil sem permissão (RN04, RN05) |
| 404 | Registro não encontrado |
| 409 | Duplicado (e-mail, código do produto, código de barras, chave da nota) |

### lista paginada

Listas que podem crescer muito (movimentações) usam `?pagina=0&tamanho=20` e respondem assim:

```json
{
  "itens": [],
  "pagina": 0,
  "tamanho": 20,
  "totalItens": 134,
  "totalPaginas": 7
}
```

## permissões

| Rota | ADMINISTRADOR | GERENTE | OPERADOR |
|---|---|---|---|
| Login, consultar produtos, lotes e alertas | sim | sim | sim |
| Entrada, saída, baixa e recebimento | sim | sim | sim |
| Criar e editar produto, categoria e fornecedor | sim | sim | não |
| Alterar preço do produto (RN04) | sim | sim | não |
| Relatórios (RN05) | sim | sim | não |
| Usuários e configurações | sim | não | não |

## login (Kaic)

### POST /auth/login

```json
{ "email": "gerente@stockflow.com.br", "senha": "stockflow123" }
```

Resposta `200`:

```json
{
  "token": "eyJhbGciOi...",
  "usuario": { "id": 2, "nome": "Gerente StockFlow", "email": "gerente@stockflow.com.br", "perfil": "GERENTE", "setor": "Estoque" }
}
```

E-mail ou senha errados, ou usuário inativo: `401` com a mensagem "E-mail ou senha inválidos.".

### GET /auth/me

Devolve o `usuario` do token, no mesmo formato do login.

## usuários (Kaic, RF07)

Só ADMINISTRADOR.

| Rota | O que faz |
|---|---|
| `GET /usuarios` | Lista todos, ativos e inativos |
| `GET /usuarios/{id}` | Um usuário |
| `POST /usuarios` | Cria |
| `PUT /usuarios/{id}` | Edita. `senha` é opcional, só muda se vier preenchida |
| `DELETE /usuarios/{id}` | Inativa (`ativo = false`). Resposta `204` sem corpo |

Corpo do POST e do PUT:

```json
{ "nome": "Katia Costa", "email": "katia@irmaoscosta.com.br", "senha": "trocar123", "perfil": "OPERADOR", "setor": "Mercearia", "ativo": true }
```

A senha precisa ter pelo menos 6 caracteres. O administrador não consegue inativar o próprio usuário (`400`).

Resposta: o usuário sem a senha.

```json
{ "id": 4, "nome": "Katia Costa", "email": "katia@irmaoscosta.com.br", "perfil": "OPERADOR", "setor": "Mercearia", "ativo": true }
```

## categorias e fornecedores (Kaic)

| Rota | O que faz |
|---|---|
| `GET /categorias` | Lista as ativas |
| `POST /categorias` | `{ "nome": "Hortifrúti" }` |
| `GET /fornecedores` | Lista os ativos |
| `POST /fornecedores` | Cria |
| `PUT /fornecedores/{id}` | Edita |

Fornecedor:

```json
{ "id": 1, "nome": "Distribuidora Minas", "cnpj": "12.345.678/0001-90", "telefone": "(34) 3821-0000", "email": "vendas@distminas.com.br" }
```

## produtos (Kaic, RF01, RF08, RF09)

### GET /produtos

Filtros opcionais: `busca` (nome, código ou código de barras), `categoriaId`, `lote` (código do lote, RF09).

```json
[
  {
    "id": 1,
    "codigo": "MER-001",
    "codigoBarras": "7896290303154",
    "nome": "Arroz Tio Prato Fino 5kg",
    "categoria": { "id": 1, "nome": "Mercearia" },
    "fornecedor": { "id": 1, "nome": "Distribuidora Minas" },
    "unidadeMedida": "UNIDADE",
    "estoqueMinimo": 40,
    "precoEntrada": 25.28,
    "precoSaida": 32.99,
    "quantidadeTotal": 36,
    "quantidadeDisponivel": 36,
    "situacaoEstoque": "ABAIXO_DO_MINIMO"
  }
]
```

`quantidadeTotal` e `quantidadeDisponivel` vêm da view `vw_estoque_produto`. A disponível não conta lote vencido.
`situacaoEstoque` é calculada pelo backend: `SEM_ESTOQUE` (disponível = 0), `ABAIXO_DO_MINIMO` (disponível < mínimo) ou `EM_ESTOQUE`.

### GET /produtos/{id}

O mesmo produto com a lista dos lotes ativos (formato na seção de lotes).

### POST /produtos e PUT /produtos/{id}

ADMINISTRADOR e GERENTE.

```json
{
  "codigo": "MER-001",
  "codigoBarras": "7896290303154",
  "nome": "Arroz Tio Prato Fino 5kg",
  "categoriaId": 1,
  "fornecedorId": 1,
  "unidadeMedida": "UNIDADE",
  "estoqueMinimo": 40,
  "precoEntrada": 25.28,
  "precoSaida": 32.99
}
```

O produto nasce sem estoque. O primeiro lote entra pela entrada ou pelo recebimento.
No PUT, se `precoEntrada` ou `precoSaida` mudar, o backend grava uma linha em `historico_precos` na mesma transação (RN04).

### DELETE /produtos/{id}

ADMINISTRADOR e GERENTE. Inativa o produto (`ativo = false`) e responde `204` sem corpo. Lotes e movimentações continuam no histórico.

### GET /produtos/{id}/historico-precos

```json
[
  { "alteradoEm": "2026-10-20T09:12:00", "usuario": "Gerente StockFlow", "precoEntradaAnterior": 24.90, "precoEntradaNovo": 25.28, "precoSaidaAnterior": 31.99, "precoSaidaNovo": 32.99 }
]
```

## lotes (Cauã, RF03, RN02)

### GET /lotes

Filtros opcionais: `produtoId`, `situacao` (padrão `ATIVO`), `vencimento` (`VENCIDO` ou `VENCENDO`).

```json
[
  {
    "id": 10,
    "codigo": "L-2392",
    "produto": { "id": 3, "nome": "Leite em pó integral 1kg", "unidadeMedida": "UNIDADE" },
    "dataRecebimento": "2026-10-18",
    "dataValidade": "2026-10-26",
    "quantidadeAtual": 42,
    "precoCusto": 34.50,
    "situacao": "ATIVO",
    "situacaoValidade": "VENCENDO",
    "diasParaVencer": 1
  }
]
```

`situacaoValidade` é `VENCIDO`, `VENCENDO` (dentro dos dias da configuração `dias_alerta_vencimento`) ou `OK`.

### POST /lotes/{id}/baixa

Tira do estoque todo o saldo do lote vencido ou estragado e fecha o lote (RN02).

```json
{ "situacao": "DESCARTADO", "motivo": "VENCIMENTO", "observacao": "Embalagem estufada" }
```

`situacao` aceita `BAIXADO` ou `DESCARTADO`. `motivo` aceita `VENCIMENTO` ou `PERDA`.
Grava uma movimentação de `SAIDA` com a quantidade que restava, zera o lote e muda a situação. Resposta: a movimentação gravada.

## movimentações (Cauã, RF02, RF04, RN01, RN03)

O usuário e a data e hora de toda movimentação vêm do token e do servidor, nunca do corpo.

### POST /movimentacoes/entrada

```json
{
  "produtoId": 3,
  "codigoLote": "L-2401",
  "dataValidade": "2027-02-18",
  "quantidade": 68,
  "valorUnitario": 34.50,
  "motivo": "RECEBIMENTO",
  "observacao": null
}
```

Se o produto já tem lote com esse código, soma no lote. Senão, cria o lote.
`motivo` aceita `RECEBIMENTO`, `DEVOLUCAO` ou `AJUSTE`. Resposta `201`: a movimentação gravada.

### POST /movimentacoes/saida

```json
{
  "produtoId": 1,
  "quantidade": 6,
  "motivo": "VENDA",
  "loteIds": [4],
  "observacao": null
}
```

`motivo` aceita `VENDA`, `PERDA`, `VENCIMENTO` ou `AJUSTE`.
`loteIds` é opcional. Sem ele, o backend tira primeiro do lote que vence antes.

O backend recusa com `400`:

- quantidade maior que o saldo dos lotes (RN01);
- saída de lote vencido com motivo diferente de `VENCIMENTO` (RN02).

Se a saída passar por mais de um lote, grava uma movimentação por lote. Resposta `201`: a lista das movimentações gravadas.

### GET /movimentacoes

Paginada. Filtros opcionais: `inicio` e `fim` (datas), `tipo`, `motivo`, `produtoId`, `usuarioId`. Ordem da mais nova para a mais antiga.

Cada item:

```json
{
  "id": 51,
  "dataHora": "2026-10-24T10:36:00",
  "tipo": "SAIDA",
  "motivo": "VENDA",
  "produto": { "id": 1, "nome": "Arroz Tio Prato Fino 5kg" },
  "lote": { "id": 4, "codigo": "L-2380" },
  "quantidade": 6,
  "valorUnitario": 32.99,
  "valorTotal": 197.94,
  "usuario": { "id": 3, "nome": "Operador StockFlow" },
  "observacao": null
}
```

## recebimento pela nota (Cauã, telas 11 a 14)

O fluxo completo está no `guia-banco-para-o-backend.md`.

| Rota | O que faz |
|---|---|
| `POST /recebimentos` | Cria o recebimento com os itens da nota. Status `EM_CONFERENCIA` |
| `GET /recebimentos?status=` | Lista |
| `GET /recebimentos/{id}` | Recebimento com os itens |
| `GET /recebimentos/chave/{chaveAcesso}` | Busca pela chave lida no celular |
| `PUT /recebimentos/{id}/itens/{itemId}` | Grava a conferência de um item |
| `POST /recebimentos/{id}/concluir` | Cria os lotes, lança as entradas e fecha |
| `POST /recebimentos/{id}/cancelar` | Cancela sem mexer no estoque |

Corpo do POST:

```json
{
  "fornecedorId": 1,
  "numeroNota": "45872",
  "serieNota": "1",
  "chaveAcesso": "31261012345678000190550010000458721000458720",
  "dataEmissao": "2026-10-24",
  "itens": [
    { "produtoId": 3, "quantidadeNota": 80, "valorUnitario": 34.50 }
  ]
}
```

Conferência de um item:

```json
{ "quantidadeConferida": 74, "codigoLote": "L-2410", "dataValidade": "2027-04-22", "observacao": "6 caixas amassadas devolvidas" }
```

Se a conferida for diferente da quantidade da nota, `observacao` é obrigatória e o recebimento passa para `COM_DIVERGENCIA`.
Concluir só é aceito com todos os itens conferidos.

## painel e alertas (Cauã, RF05, RF06)

### GET /alertas

Lê a view `vw_alertas`.

```json
[
  { "tipo": "LOTE_VENCENDO", "produto": { "id": 3, "nome": "Leite em pó integral 1kg" }, "lote": { "id": 10, "codigo": "L-2392" }, "dataValidade": "2026-10-26", "quantidade": 42 },
  { "tipo": "ESTOQUE_BAIXO", "produto": { "id": 1, "nome": "Arroz Tio Prato Fino 5kg" }, "lote": null, "dataValidade": null, "quantidade": 36 }
]
```

`tipo` é `ESTOQUE_BAIXO`, `LOTE_VENCENDO` ou `LOTE_VENCIDO`.

### GET /painel

```json
{
  "valorTotalEstoque": 18420.75,
  "totalProdutos": 9,
  "produtosAbaixoDoMinimo": 3,
  "lotesVencendo": 2,
  "lotesVencidos": 1,
  "movimentacoesHoje": [
    { "dataHora": "2026-10-24T10:36:00", "tipo": "SAIDA", "produto": "Arroz Tio Prato Fino 5kg", "quantidade": 6 }
  ]
}
```

`valorTotalEstoque` soma `quantidadeAtual * precoCusto` dos lotes ativos.

## relatórios (Kaic, RF06, RN05)

Só ADMINISTRADOR e GERENTE. Todos aceitam `categoriaId`. Os que têm período aceitam `inicio` e `fim` (`2026-10-01`).
Sem datas, o período é dos últimos 6 meses: do dia 1 de cinco meses atrás até hoje. O dia final entra inteiro.

### GET /relatorios/estoque

Valor de custo = quantidade total x preço de entrada. Valor de venda = quantidade disponível x preço de saída.

```json
{
  "itens": [
    { "produtoId": 1, "codigo": "P001", "nome": "Arroz tipo 1 5 kg", "categoria": "Mercearia", "unidadeMedida": "UNIDADE",
      "estoqueMinimo": 40, "quantidadeTotal": 36, "quantidadeDisponivel": 30, "valorCusto": 680.40, "valorVenda": 837.00 }
  ],
  "valorTotalCusto": 1794.24,
  "valorTotalVenda": 2438.29
}
```

### GET /relatorios/movimentacoes

```json
{
  "inicio": "2026-05-01",
  "fim": "2026-10-25",
  "valorTotalEntradas": 609.40,
  "valorTotalSaidas": 361.84,
  "totais": [
    { "tipo": "ENTRADA", "motivo": "RECEBIMENTO", "registros": 2, "quantidade": 72.5, "valorTotal": 609.40 },
    { "tipo": "SAIDA", "motivo": "VENDA", "registros": 3, "quantidade": 19.915, "valorTotal": 326.44 }
  ]
}
```

### GET /relatorios/perdas

Saídas com motivo `PERDA` ou `VENCIMENTO`. `porMes` traz todos os meses do período, inclusive os sem perda, para o gráfico.

```json
{
  "inicio": "2026-05-01",
  "fim": "2026-10-25",
  "valorTotal": 35.40,
  "porMes": [ { "mes": "2026-09", "valorTotal": 0 }, { "mes": "2026-10", "valorTotal": 35.40 } ],
  "itens": [
    { "dataHora": "2026-10-24T15:15:31", "produto": { "id": 7, "nome": "Pão de forma 500 g" }, "lote": "LT-B-0140",
      "motivo": "VENCIMENTO", "quantidade": 3, "valorTotal": 18.60, "observacao": "Descarte de vencidos" }
  ]
}
```

### GET /relatorios/vencimentos

Lotes ativos com saldo, do que vence antes para o que vence depois. Cada item tem o formato da seção de lotes (com `situacaoValidade` e `diasParaVencer`).

### GET /relatorios/precos

Alterações de preço no período. A margem é quanto o preço de saída está acima do de entrada, em %.

```json
[
  { "alteradoEm": "2026-10-15T15:15:31", "produto": { "id": 1, "nome": "Arroz tipo 1 5 kg" }, "usuario": "Gerente StockFlow",
    "precoEntradaAnterior": 18.40, "precoEntradaNovo": 18.90, "precoSaidaAnterior": 26.90, "precoSaidaNovo": 27.90,
    "margemAnterior": 46.2, "margemNova": 47.6 }
]
```

## configurações (Kaic)

Só ADMINISTRADOR.

| Rota | O que faz |
|---|---|
| `GET /configuracoes` | Lista chave, valor e descrição |
| `PUT /configuracoes/{chave}` | `{ "valor": "10" }` |

Por enquanto só existe `dias_alerta_vencimento` (padrão 7).

## o que muda no front

O front de hoje usa dados fixos em `frontend/data/initialData.ts`. Para ligar na API, estas diferenças precisam ser ajustadas:

| No front hoje | Na API |
|---|---|
| ids em texto (`"p1"`, `"b3"`) | ids numéricos |
| campos em inglês (`name`, `batches`, `expiresAt`) | campos em português (`nome`, `lotes`, `dataValidade`) |
| unidades `PCT`, `UN`, `KG`, `L`, `CX` | `UNIDADE`, `KG`, `LITRO` (o documento de requisitos só prevê esses três) |
| perfis `"Gerente de estoque"` e outros | `ADMINISTRADOR`, `GERENTE`, `OPERADOR` |
| tipo `"Baixa"` | `SAIDA` com motivo `VENCIMENTO` ou `PERDA` |
| lote `prioritized` e `blocked` | não existe no banco. `blocked` corresponde a `situacao` diferente de `ATIVO` ou a `situacaoValidade = VENCIDO`. Prioridade precisa de migration se o grupo decidir manter |
| usuário da movimentação fixo (`"Amanda Garcia"`) | vem do token |
| login sem validação | `POST /auth/login`, guardar o token e mandar em toda chamada |
