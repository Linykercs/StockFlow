# Guia do banco para o backend

O que quem implementar o backend precisa saber para usar o banco do StockFlow sem quebrar regra.
Tabelas e colunas estão no [dicionário de dados](dicionario-de-dados.md).

## configuração do Spring

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/stockflow
    username: stockflow
    password: stockflow
  jpa:
    hibernate:
      ddl-auto: validate   # o schema vem do Flyway; o Hibernate só confere
  flyway:
    enabled: true
```

O Flyway executa o `V1__schema_inicial.sql` sozinho quando o sistema sobe com o banco vazio.
Quem já criou as tabelas à mão pelo README tem duas saídas:

- apagar e recriar o banco vazio (`DROP DATABASE stockflow;` e o passo 2 do README), ou
- adicionar `spring.flyway.baseline-on-migrate: true` e `spring.flyway.baseline-version: 1`, para o Flyway aceitar o banco que já existe.

Mudança de schema daqui para frente entra como migration nova (`V2__...sql`). Não editar o V1 depois que alguém já rodou.

## mapeamento JPA

| No banco | Na entidade |
|---|---|
| `BIGSERIAL` | `Long` com `@GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `NUMERIC` (quantidades e valores) | `BigDecimal`, nunca `double` ou `Integer` (kg e litro têm fração) |
| `VARCHAR` com lista fechada (perfil, unidade_medida, situacao, tipo, motivo, status) | enum com `@Enumerated(EnumType.STRING)`, valores escritos igual ao banco |
| `TIMESTAMP` | `LocalDateTime` |
| `DATE` | `LocalDate` |
| `movimentacoes.valor_total` | `@Column(insertable = false, updatable = false)`, porque o banco calcula |

Valores dos enums:

- `PerfilUsuario`: ADMINISTRADOR, GERENTE, OPERADOR
- `UnidadeMedida`: UNIDADE, KG, LITRO
- `SituacaoLote`: ATIVO, BAIXADO, DESCARTADO
- `TipoMovimentacao`: ENTRADA, SAIDA
- `MotivoMovimentacao`: RECEBIMENTO, DEVOLUCAO, VENDA, PERDA, VENCIMENTO, AJUSTE
- `StatusRecebimento`: EM_CONFERENCIA, COM_DIVERGENCIA, CONCLUIDO, CANCELADO

## o que o banco garante e o que fica no código

O banco recusa alguns erros sozinho. Os outros dependem do backend.

| Regra | O banco garante | O backend precisa fazer |
|---|---|---|
| RN01 estoque suficiente | `lotes.quantidade_atual` nunca negativa | Conferir o saldo antes da saída e devolver uma mensagem clara. Travar o lote na transação (`@Lock(PESSIMISTIC_WRITE)`) para duas saídas ao mesmo tempo não passarem do saldo |
| RN02 lote vencido | Nada (a data muda todo dia) | Recusar saída de lote com `data_validade` anterior a hoje. A única saída aceita é a baixa ou o descarte, com motivo `VENCIMENTO`, que também muda `situacao` para BAIXADO ou DESCARTADO quando zerar |
| RN03 usuário, data e hora | `usuario_id` e `data_hora` obrigatórios | Pegar o usuário do token JWT, nunca do corpo da requisição |
| RN04 preços | Nada | Só ADMINISTRADOR e GERENTE alteram `preco_entrada` e `preco_saida`. Toda alteração grava uma linha em `historico_precos` na mesma transação |
| RN05 relatórios | Nada | Endpoints de relatório só para ADMINISTRADOR e GERENTE |
| Motivo combina com o tipo | Entrada só com RECEBIMENTO, DEVOLUCAO ou AJUSTE; saída só com VENDA, PERDA, VENCIMENTO ou AJUSTE | Mostrar só os motivos válidos na tela |

## registrar uma movimentação

O banco **não** atualiza o saldo do lote sozinho. Cada movimentação faz duas coisas na mesma transação (`@Transactional`):

1. altera `lotes.quantidade_atual` (soma na entrada, subtrai na saída);
2. grava a linha em `movimentacoes`.

Se uma das duas falhar, nenhuma fica gravada.

Sugestão para `valor_unitario`: na saída, o `preco_saida` do produto no momento; na entrada, o `preco_custo` do lote. O valor fica gravado na movimentação, então mudar o preço do produto depois não altera o histórico.

## fluxo do recebimento pela nota (telas 11 a 14)

1. Ler a nota: criar `recebimentos` com status EM_CONFERENCIA e um `recebimento_itens` por produto, com `quantidade_nota` e `valor_unitario`.
2. Conferir: preencher `quantidade_conferida`, `codigo_lote` e `data_validade` de cada item.
3. Se algum item tiver `quantidade_conferida` diferente de `quantidade_nota`, mudar o status para COM_DIVERGENCIA e pedir a `observacao`.
4. Concluir, numa transação só, para cada item:
   - criar o lote (`produto_id`, `recebimento_id`, `codigo`, `data_validade`, `preco_custo` = `valor_unitario`, `quantidade_atual` = 0);
   - registrar a movimentação de ENTRADA com motivo RECEBIMENTO e `quantidade_conferida`, que leva o saldo do lote para a quantidade conferida;
   - no fim, status CONCLUIDO e `concluido_em` preenchido.

## consultas prontas

- `vw_estoque_produto`: estoque total e disponível de cada produto. Usar nas listas de produtos e no painel.
- `vw_alertas`: alertas de estoque baixo, lote vencendo e lote vencido (RF05). O prazo de "vencendo" vem de `configuracoes.dias_alerta_vencimento` (7), que o administrador pode mudar.

As duas podem ser mapeadas como entidade somente leitura (`@Immutable`) ou lidas com consulta nativa.

## outros cuidados

- Excluir produto, usuário, categoria ou fornecedor é marcar `ativo = false`. `DELETE` quebraria o histórico de lotes e movimentações.
- Senhas com `BCryptPasswordEncoder`. Os usuários de exemplo do `dados-exemplo.sql` já usam BCrypt e entram com `stockflow123`.
- `produtos.atualizado_em` e `usuarios.atualizado_em` não mudam sozinhos: usar `@UpdateTimestamp` ou atualizar no service.
- Busca de produto por lote (RF09): juntar `produtos` com `lotes` pelo `lotes.codigo`.
