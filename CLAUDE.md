# StockFlow

Sistema de estoque para o Supermercado Irmãos Costa, feito no Projeto Integrador III (Unipam, entrega em 20/11/2026).
Leia o `README.md` para a situação geral e o passo a passo do banco.

## quem cuida de cada parte

| Parte | Responsável |
|---|---|
| Banco de dados e Figma | Linyker |
| Backend: login, usuários, categorias, fornecedores, produtos, preços e relatórios | Kaic |
| Backend: lotes, entrada, saída, baixa, movimentações, recebimento, alertas e painel | Cauã |
| Frontend | Amanda |

Mexa só na parte de quem está pedindo. Se a tarefa precisar mudar a parte de outra pessoa (por exemplo, uma coluna nova no banco), pare e avise em vez de alterar.

## stack

- Backend: Java 21, Spring Boot 3, Spring Data JPA, Spring Security com JWT, Flyway, PostgreSQL 16. Pacote base `br.com.stockflow`.
- Frontend: React 19, TypeScript, Vite, Tailwind 4, React Router.
- Banco local: `localhost:5432`, banco, usuário e senha `stockflow`.

## onde estão as coisas

```
backend/src/main/java/br/com/stockflow/
  config/  controller/  domain/entity/  domain/enums/  dto/request/  dto/response/
  exception/  repository/  security/  service/
backend/src/main/resources/db/
  migration/V1__schema_inicial.sql    schema (Flyway)
  dados-exemplo.sql                   dados de teste
frontend/
  pages/  Components/  context/  data/  types/  utils/  layout/   código das telas
  src/App.tsx                         rotas
docs/
  api.md                              contrato da API (rotas, JSON, permissões)
  guia-banco-para-o-backend.md        regras que o backend precisa cumprir no banco
  dicionario-de-dados.md              todas as colunas
```

## regras do projeto

- A API segue o `docs/api.md`. Se precisar de rota ou campo novo, atualize o `api.md` no mesmo PR e avise o grupo.
- O schema só muda por migration nova (`V2__descricao.sql`). Nunca editar o `V1`. Mudança de banco passa pelo Linyker.
- Antes de escrever entidade ou service, leia o `docs/guia-banco-para-o-backend.md`. Ele diz o que o banco garante e o que o código precisa validar (RN01 a RN05).
- Quantidade e dinheiro são `BigDecimal` no Java e `number` no front. Nunca `double`.
- Excluir é marcar `ativo = false`. Nada de `DELETE` em produto, usuário, categoria ou fornecedor.
- O usuário de uma movimentação vem do token, nunca do corpo da requisição.
- Controller só recebe e devolve DTO. Regra de negócio fica no service.
- Erros passam por um `@RestControllerAdvice` e voltam no formato do `api.md`.

## como escrever

O professor lê o código e os commits, então tudo precisa parecer escrito por um aluno que entende o que fez.

- Nomes de classe, método, variável e rota em português, igual ao banco (`Produto`, `quantidadeAtual`, `/api/movimentacoes`). Termos técnicos do framework ficam em inglês (`Controller`, `Repository`, `Service`).
- Comentário só quando o motivo não é óbvio pelo código, por exemplo citando a regra (`// RN02: lote vencido não sai por venda`). Sem comentário explicando o que cada linha faz.
- Nada de emoji, nada de texto de enfeite em README ou PR.
- Commit curto, em português, no imperativo: `adiciona cadastro de produto`, `corrige saldo do lote na saída`. Sem `Co-Authored-By` e sem rodapé de ferramenta.
- PR com o que foi feito e como testar, em poucas linhas.
- Código simples. Sem camada, interface ou padrão que o projeto ainda não usa.

## fluxo de trabalho

1. Atualizar a `main` (`git pull`) e criar uma branch: `feat/produtos`, `feat/saida`, `fix/login`.
2. Fazer a tarefa e testar (backend pelo Postman ou Insomnia, front no navegador).
3. Abrir PR para a `main`. Outra pessoa do grupo revisa antes do merge.
4. Nunca dar push direto na `main`.

Ao terminar uma tarefa, explique para quem pediu o que foi feito e por quê, em poucas linhas, para a pessoa conseguir defender o código na apresentação.
