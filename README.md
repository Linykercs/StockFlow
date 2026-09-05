# StockFlow

Sistema de Gestão de Estoque para Supermercado — projeto integrador.

- **Cliente (estudo de caso):** Supermercado Irmãos Costa
- **Equipe:** Cauã Aparecido da Silva Duarte, Kaic Santana da Costa, Linyker Mendes Coelho, Amanda Moniele Garcia Silva
- **Design:** [Figma — StockFlow](https://www.figma.com/design/IZ7Ym9kOcdTrWE07atfkR6)
- **Escopo detalhado:** [`docs/escopo.md`](docs/escopo.md)
- **API:** [`docs/api.md`](docs/api.md)

## Stack

- **Backend:** Java 21, Spring Boot 3 (Web, Security, Data JPA), PostgreSQL, Flyway, JWT
- **Frontend:** React 18 + TypeScript + Vite, React Router, Axios
- **Infra local:** Docker Compose (Postgres + backend + frontend)

## Estrutura

```
stockflow/
├── backend/    # API Spring Boot
├── frontend/   # SPA React
├── docs/       # Escopo, regras de negócio e documentação da API
└── docker-compose.yml
```

## Rodando com Docker Compose (mais simples)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080 (Swagger em `/docs`)
- Postgres: localhost:5432 (`stockflow` / `stockflow`)

## Rodando localmente sem Docker

### Backend

Requer Java 21 e um Postgres rodando localmente (ou ajuste `DB_URL`/`DB_USER`/`DB_PASSWORD`).

```bash
cd backend
./mvnw spring-boot:run
```

As migrations do Flyway criam o schema automaticamente. Usuários de exemplo são criados no
primeiro start (ver [`docs/api.md`](docs/api.md) para credenciais).

### Frontend

Requer Node 22+.

```bash
cd frontend
npm install
npm run dev
```

O Vite já está configurado para redirecionar `/api` para `http://localhost:8080`.

## Design system

As cores, tipografia (Bitter + DM Sans) e os componentes base (botões, campos, badges de
status) seguem a página "Design System" do Figma e estão implementados em
`frontend/src/styles/tokens.css` e `frontend/src/components/ui/`.

## Regras de negócio já implementadas

- **RN01** — uma saída de estoque não pode ultrapassar a quantidade disponível no lote.
- **RN02** — um lote vencido não aceita novas movimentações.

Veja [`docs/escopo.md`](docs/escopo.md) para o restante do escopo e o que falta completar.
