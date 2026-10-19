# Dicionário de dados

Tabelas do banco do StockFlow (PostgreSQL 16), geradas a partir do schema em
[`V1__schema_inicial.sql`](../backend/src/main/resources/db/migration/V1__schema_inicial.sql).
Os diagramas estão em [`banco-de-dados.md`](banco-de-dados.md) e em [`modelo-de-dados.drawio`](modelo-de-dados.drawio).

Legenda da coluna Chave: PK chave primária, FK chave estrangeira (com a tabela de destino), UK valor único.

## usuarios

Contas de acesso ao sistema, com perfil e setor (RF07).

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `nome` | VARCHAR(120) | sim |  |  | Nome completo. |
| `email` | VARCHAR(160) | sim | UK |  | E-mail usado no login. Não se repete. |
| `senha_hash` | VARCHAR(255) | sim |  |  | Senha guardada como hash BCrypt, nunca em texto puro (RNF02). |
| `perfil` | VARCHAR(20) | sim |  |  | ADMINISTRADOR, GERENTE ou OPERADOR. Define o que o usuário pode fazer. |
| `setor` | VARCHAR(60) | não |  |  | Setor de trabalho do gerente ou do operador. |
| `ativo` | BOOLEAN | sim |  | TRUE | Falso quando o registro foi desativado. Nada é apagado de verdade. |
| `criado_em` | TIMESTAMP | sim |  | agora | Data e hora em que o registro foi criado. |
| `atualizado_em` | TIMESTAMP | sim |  | agora | Data e hora da última alteração. O backend atualiza. |

## categorias

Agrupamento dos produtos (Mercearia, Laticínios...).

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `nome` | VARCHAR(80) | sim | UK |  | Nome da categoria. Não se repete. |
| `ativo` | BOOLEAN | sim |  | TRUE | Falso quando o registro foi desativado. Nada é apagado de verdade. |

## fornecedores

Empresas que vendem os produtos ao supermercado.

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `nome` | VARCHAR(120) | sim |  |  | Razão social ou nome fantasia. |
| `cnpj` | VARCHAR(18) | não | UK |  | CNPJ com máscara (00.000.000/0000-00). Não se repete. |
| `telefone` | VARCHAR(20) | não |  |  | Telefone de contato. |
| `email` | VARCHAR(160) | não |  |  | E-mail de contato. |
| `ativo` | BOOLEAN | sim |  | TRUE | Falso quando o registro foi desativado. Nada é apagado de verdade. |

## produtos

Cadastro de produtos com código, unidade e preços (RF01, RF08). A exclusão é lógica.

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `codigo` | VARCHAR(30) | sim | UK |  | Código interno do produto. Não se repete. |
| `codigo_barras` | VARCHAR(14) | não | UK |  | Código de barras (EAN). Não se repete. |
| `nome` | VARCHAR(150) | sim |  |  | Nome do produto. |
| `categoria_id` | BIGINT | não | FK (categorias) |  | Categoria do produto. |
| `fornecedor_id` | BIGINT | não | FK (fornecedores) |  | Fornecedor principal do produto. |
| `unidade_medida` | VARCHAR(10) | sim |  |  | UNIDADE, KG ou LITRO (quantidade, peso ou litros, RF01). |
| `estoque_minimo` | NUMERIC(12,3) | sim |  | 0 | Abaixo dessa quantidade o produto gera alerta de estoque baixo (RF05). |
| `preco_entrada` | NUMERIC(12,2) | sim |  | 0 | Valor de compra atual, por unidade de medida (RF08). |
| `preco_saida` | NUMERIC(12,2) | sim |  | 0 | Valor de venda atual, por unidade de medida (RF08). |
| `ativo` | BOOLEAN | sim |  | TRUE | Falso quando o registro foi desativado. Nada é apagado de verdade. |
| `criado_em` | TIMESTAMP | sim |  | agora | Data e hora em que o registro foi criado. |
| `atualizado_em` | TIMESTAMP | sim |  | agora | Data e hora da última alteração. O backend atualiza. |

## historico_precos

Registro de cada alteração de preço de um produto e de quem alterou (RF08, RN04).

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `produto_id` | BIGINT | sim | FK (produtos) |  | Produto que teve o preço alterado. |
| `usuario_id` | BIGINT | sim | FK (usuarios) |  | Quem alterou. Precisa ser administrador ou gerente (RN04). |
| `preco_entrada_anterior` | NUMERIC(12,2) | sim |  |  | Valor de compra antes da alteração. |
| `preco_entrada_novo` | NUMERIC(12,2) | sim |  |  | Valor de compra depois da alteração. |
| `preco_saida_anterior` | NUMERIC(12,2) | sim |  |  | Valor de venda antes da alteração. |
| `preco_saida_novo` | NUMERIC(12,2) | sim |  |  | Valor de venda depois da alteração. |
| `alterado_em` | TIMESTAMP | sim |  | agora | Data e hora da alteração. |

## recebimentos

Recebimento de mercadoria pela nota fiscal, do início da conferência até a entrada no estoque.

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `fornecedor_id` | BIGINT | não | FK (fornecedores) |  | Fornecedor que emitiu a nota. |
| `usuario_id` | BIGINT | sim | FK (usuarios) |  | Usuário que fez a conferência. |
| `numero_nota` | VARCHAR(20) | sim |  |  | Número da nota fiscal. |
| `serie_nota` | VARCHAR(5) | não |  |  | Série da nota fiscal. |
| `chave_acesso` | CHAR(44) | não | UK |  | Chave de acesso da NF-e, com 44 dígitos. Não se repete. |
| `data_emissao` | DATE | não |  |  | Data de emissão da nota. |
| `status` | VARCHAR(20) | sim |  | EM_CONFERENCIA | EM_CONFERENCIA, COM_DIVERGENCIA, CONCLUIDO ou CANCELADO. |
| `criado_em` | TIMESTAMP | sim |  | agora | Data e hora em que o registro foi criado. |
| `concluido_em` | TIMESTAMP | não |  |  | Data e hora em que a entrada foi gravada no estoque. |

## recebimento_itens

Itens de uma nota: quantidade da nota contra a conferida.

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `recebimento_id` | BIGINT | sim | FK (recebimentos) |  | Recebimento a que o item pertence. Apagar o recebimento apaga os itens. |
| `produto_id` | BIGINT | sim | FK (produtos) |  | Produto do item. |
| `quantidade_nota` | NUMERIC(12,3) | sim |  |  | Quantidade que veio na nota. Maior que zero. |
| `quantidade_conferida` | NUMERIC(12,3) | não |  |  | Quantidade contada na conferência. Vazia até conferir; diferente da nota indica divergência. |
| `valor_unitario` | NUMERIC(12,2) | sim |  |  | Valor unitário na nota. Vira o preço de custo do lote. |
| `codigo_lote` | VARCHAR(40) | não |  |  | Código do lote impresso na embalagem. |
| `data_validade` | DATE | não |  |  | Validade informada na conferência. |
| `observacao` | VARCHAR(255) | não |  |  | Explicação da divergência, quando houver. |

## lotes

Lotes de cada produto, com recebimento, validade e saldo (RF03, RN01, RN02).

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `produto_id` | BIGINT | sim | FK (produtos) |  | Produto do lote. |
| `recebimento_id` | BIGINT | não | FK (recebimentos) |  | Recebimento que originou o lote. Vazio quando o lote foi cadastrado à mão. |
| `codigo` | VARCHAR(40) | não |  |  | Código do lote. Não se repete dentro do mesmo produto. |
| `data_recebimento` | DATE | sim |  | hoje | Data em que o lote chegou (RF03). |
| `data_validade` | DATE | não |  |  | Data de validade. Vazia para produto que não vence (RF03, RN02). |
| `quantidade_atual` | NUMERIC(12,3) | sim |  | 0 | Saldo do lote. Nunca fica negativo (RN01). |
| `preco_custo` | NUMERIC(12,2) | não |  |  | Valor pago por unidade de medida neste lote. |
| `situacao` | VARCHAR(12) | sim |  | ATIVO | ATIVO, BAIXADO ou DESCARTADO. Lote vencido é baixado ou descartado (RN02). |
| `criado_em` | TIMESTAMP | sim |  | agora | Data e hora em que o registro foi criado. |

## movimentacoes

Entradas e saídas de estoque, sempre ligadas a um lote e a um usuário (RF02, RF04, RN03).

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `id` | BIGSERIAL | sim | PK | automático | Identificador gerado pelo banco. |
| `lote_id` | BIGINT | sim | FK (lotes) |  | Lote que entrou ou saiu. |
| `usuario_id` | BIGINT | sim | FK (usuarios) |  | Usuário responsável. Obrigatório (RN03). |
| `recebimento_id` | BIGINT | não | FK (recebimentos) |  | Recebimento que gerou a entrada, quando veio de uma nota. |
| `tipo` | VARCHAR(10) | sim |  |  | ENTRADA ou SAIDA. |
| `motivo` | VARCHAR(20) | sim |  |  | Entrada: RECEBIMENTO, DEVOLUCAO ou AJUSTE. Saída: VENDA, PERDA, VENCIMENTO ou AJUSTE. |
| `quantidade` | NUMERIC(12,3) | sim |  |  | Quantidade movimentada. Maior que zero; aceita fração para kg e litro. |
| `valor_unitario` | NUMERIC(12,2) | sim |  |  | Valor por unidade de medida no momento da movimentação (RF04). |
| `valor_total` | NUMERIC(14,2) | não |  | calculado | Quantidade vezes valor unitário. Calculado pelo banco, não pode ser gravado. |
| `observacao` | VARCHAR(255) | não |  |  | Comentário livre. |
| `data_hora` | TIMESTAMP | sim |  | agora | Data e hora da movimentação (RN03). |

## configuracoes

Parâmetros gerais do sistema, alterados pelo administrador.

| Coluna | Tipo | Obrigatória | Chave | Padrão | Descrição |
|---|---|---|---|---|---|
| `chave` | VARCHAR(60) | sim | PK |  | Nome do parâmetro. |
| `valor` | VARCHAR(255) | sim |  |  | Valor do parâmetro, guardado como texto. |
| `descricao` | VARCHAR(255) | não |  |  | Para que serve o parâmetro. |
| `atualizado_em` | TIMESTAMP | sim |  | agora | Data e hora da última alteração. O backend atualiza. |

## views

| View | O que mostra |
|---|---|
| `vw_estoque_produto` | Por produto ativo: estoque mínimo, quantidade total dos lotes ativos e quantidade disponível (sem lotes vencidos). |
| `vw_alertas` | Alertas do RF05: `ESTOQUE_BAIXO` (disponível abaixo do mínimo), `LOTE_VENCENDO` (vence em até `dias_alerta_vencimento` dias) e `LOTE_VENCIDO`. |

## configurações iniciais

| Chave | Valor | Uso |
|---|---|---|
| `dias_alerta_vencimento` | 7 | Prazo, em dias, para um lote entrar como vencendo nos alertas. |
