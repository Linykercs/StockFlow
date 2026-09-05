# API — StockFlow Backend

Base URL local: `http://localhost:8080`. Documentação interativa (Swagger UI) em `/docs`
depois de subir a aplicação.

Autenticação via JWT: faça login em `POST /api/auth/login` e envie o token retornado no
header `Authorization: Bearer <token>` nas demais chamadas.

Usuários de desenvolvimento criados automaticamente (ver `DataSeeder`), senha `stockflow123`:

| Email | Perfil |
|---|---|
| admin@stockflow.com.br | ADMINISTRADOR |
| gerente@stockflow.com.br | GERENTE |
| operador@stockflow.com.br | OPERADOR |

## Endpoints

| Método | Rota | Quem acessa | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | público | Autentica e retorna o token JWT |
| GET | `/api/produtos` | autenticado | Lista produtos |
| GET | `/api/produtos/{id}` | autenticado | Detalha um produto |
| POST | `/api/produtos` | Gerente/Admin | Cadastra produto |
| PUT | `/api/produtos/{id}` | Gerente/Admin | Atualiza produto |
| DELETE | `/api/produtos/{id}` | Admin | Inativa produto |
| GET | `/api/lotes?produtoId=` | autenticado | Lista lotes de um produto |
| POST | `/api/lotes` | Gerente/Admin | Cadastra lote |
| GET | `/api/movimentacoes` | autenticado | Últimas 50 movimentações |
| POST | `/api/movimentacoes` | autenticado | Registra entrada/saída (aplica RN01 e RN02) |
| GET | `/api/dashboard` | autenticado | Resumo de estoque + alertas |
