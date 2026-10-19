# StockFlow

Sistema de gestão de estoque para supermercado, desenvolvido no Projeto Integrador III.

Cliente (estudo de caso): Supermercado Irmãos Costa.
Equipe: Cauã Aparecido da Silva Duarte, Kaic Santana da Costa, Linyker Mendes Coelho e Amanda Moniele Garcia Silva.
Período: 16/08/2026 a 20/11/2026.

Protótipo no Figma: https://www.figma.com/design/IZ7Ym9kOcdTrWE07atfkR6 (página "01 Telas").

## situação

| Parte | Situação |
|---|---|
| Banco de dados | Pronto: schema, modelos conceitual e lógico, dados de exemplo |
| Backend (Java 21, Spring Boot 3) | A fazer |
| Frontend (React, TypeScript, Vite) | A fazer |

## estrutura

```
backend/
  src/main/resources/db/
    migration/V1__schema_inicial.sql   schema do banco, executado pelo Flyway
    dados-exemplo.sql                  dados de teste para o banco local
frontend/
docs/
  banco-de-dados.md                    tabelas, diagrama e onde cada requisito fica no banco
  modelo-de-dados.drawio               modelo conceitual (Chen) e modelo lógico
```

O modelo de dados abre direto no draw.io por este link:
[abrir modelo-de-dados.drawio](https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FLinykercs%2FStockFlow%2Fmain%2Fdocs%2Fmodelo-de-dados.drawio)

## banco de dados local

O projeto usa PostgreSQL 16, com banco `stockflow`, usuário `stockflow` e senha `stockflow`.

### 1. instalar o PostgreSQL

No Windows, pelo PowerShell:

```powershell
winget install --id PostgreSQL.PostgreSQL.16
```

O instalador pede uma senha para o usuário `postgres` (o administrador do servidor). Guarde essa senha, ela é usada no passo 2.

Em outros sistemas, baixe em https://www.postgresql.org/download/.

### 2. criar o banco e o usuário

Rode como `postgres`. No Windows, o `psql` fica em `C:\Program Files\PostgreSQL\16\bin\psql.exe`.

```sql
CREATE ROLE stockflow LOGIN PASSWORD 'stockflow';
CREATE DATABASE stockflow OWNER stockflow ENCODING 'UTF8' TEMPLATE template0;
```

Depois, conectado no banco `stockflow`, ainda como `postgres`:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

A extensão `pgcrypto` gera o hash das senhas dos usuários de exemplo.

### 3. criar as tabelas e carregar os dados de exemplo

Conectado no banco `stockflow` com o usuário `stockflow`, rode os dois arquivos nesta ordem:

1. `backend/src/main/resources/db/migration/V1__schema_inicial.sql`
2. `backend/src/main/resources/db/dados-exemplo.sql`

Pelo terminal (Windows):

```powershell
$env:PGPASSWORD = 'stockflow'
$psql = 'C:\Program Files\PostgreSQL\16\bin\psql.exe'
& $psql -h localhost -U stockflow -d stockflow -f backend/src/main/resources/db/migration/V1__schema_inicial.sql
& $psql -h localhost -U stockflow -d stockflow -f backend/src/main/resources/db/dados-exemplo.sql
```

Também dá para abrir cada arquivo num cliente como o Beekeeper Studio ou o DBeaver e executar o conteúdo.

### 4. conferir

Conecte no cliente de banco com host `localhost`, porta `5432`, usuário `stockflow`, senha `stockflow` e banco `stockflow`. Devem aparecer 10 tabelas e 2 views. Para testar:

```sql
SELECT * FROM vw_alertas;
```

A consulta deve trazer produtos com estoque baixo, lotes vencendo e lotes vencidos.

Os usuários de exemplo são `admin@stockflow.com.br`, `gerente@stockflow.com.br` e `operador@stockflow.com.br`, todos com a senha `stockflow123`.

### recriar do zero

Para apagar tudo e começar de novo, rode como `postgres`:

```sql
DROP DATABASE stockflow;
```

E repita os passos 2 e 3.

Quando o backend existir, o Flyway vai criar as tabelas sozinho ao subir o sistema. Nesse caso, rode só o passo 2 e deixe o banco vazio; os dados de exemplo entram depois.
