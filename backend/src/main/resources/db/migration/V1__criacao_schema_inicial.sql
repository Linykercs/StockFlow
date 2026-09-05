-- Schema inicial do StockFlow: usuarios, categorias, fornecedores, produtos, lotes e movimentacoes.

CREATE TABLE usuarios (
    id            BIGSERIAL PRIMARY KEY,
    nome          VARCHAR(120)  NOT NULL,
    email         VARCHAR(160)  NOT NULL UNIQUE,
    senha_hash    VARCHAR(255)  NOT NULL,
    perfil        VARCHAR(20)   NOT NULL,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
    id     BIGSERIAL PRIMARY KEY,
    nome   VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE fornecedores (
    id        BIGSERIAL PRIMARY KEY,
    nome      VARCHAR(120) NOT NULL,
    cnpj      VARCHAR(20),
    telefone  VARCHAR(20)
);

CREATE TABLE produtos (
    id               BIGSERIAL PRIMARY KEY,
    nome             VARCHAR(150) NOT NULL,
    codigo_barras    VARCHAR(50) UNIQUE,
    unidade_medida   VARCHAR(20)  NOT NULL,
    estoque_minimo   INTEGER      NOT NULL DEFAULT 0,
    categoria_id     BIGINT REFERENCES categorias(id),
    fornecedor_id    BIGINT REFERENCES fornecedores(id),
    ativo            BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em        TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE lotes (
    id              BIGSERIAL PRIMARY KEY,
    produto_id      BIGINT       NOT NULL REFERENCES produtos(id),
    quantidade      INTEGER      NOT NULL DEFAULT 0,
    data_validade   DATE,
    data_entrada    DATE         NOT NULL DEFAULT CURRENT_DATE,
    preco_custo     NUMERIC(12,2)
);

CREATE TABLE movimentacoes_estoque (
    id            BIGSERIAL PRIMARY KEY,
    lote_id       BIGINT       NOT NULL REFERENCES lotes(id),
    usuario_id    BIGINT       NOT NULL REFERENCES usuarios(id),
    tipo          VARCHAR(10)  NOT NULL,
    quantidade    INTEGER      NOT NULL,
    observacao    VARCHAR(255),
    data_hora     TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_lotes_produto ON lotes(produto_id);
CREATE INDEX idx_lotes_validade ON lotes(data_validade);
CREATE INDEX idx_movimentacoes_lote ON movimentacoes_estoque(lote_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(data_hora);
