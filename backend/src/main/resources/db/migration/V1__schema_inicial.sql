-- Schema inicial do StockFlow, alinhado ao Documento de Requisitos (RF01 a RF10, RN01 a RN05).
-- Valores de enum ficam em VARCHAR com CHECK para mapear direto em @Enumerated(EnumType.STRING).

-- RF07: contas de usuário com perfil. Gerente e operador têm setor (papéis de usuário, seção 2.4).
CREATE TABLE usuarios (
    id             BIGSERIAL     PRIMARY KEY,
    nome           VARCHAR(120)  NOT NULL,
    email          VARCHAR(160)  NOT NULL UNIQUE,
    senha_hash     VARCHAR(255)  NOT NULL,
    perfil         VARCHAR(20)   NOT NULL CHECK (perfil IN ('ADMINISTRADOR', 'GERENTE', 'OPERADOR')),
    setor          VARCHAR(60),
    ativo          BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMP     NOT NULL DEFAULT now(),
    atualizado_em  TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
    id     BIGSERIAL    PRIMARY KEY,
    nome   VARCHAR(80)  NOT NULL UNIQUE,
    ativo  BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE fornecedores (
    id        BIGSERIAL     PRIMARY KEY,
    nome      VARCHAR(120)  NOT NULL,
    cnpj      VARCHAR(18)   UNIQUE,
    telefone  VARCHAR(20),
    email     VARCHAR(160),
    ativo     BOOLEAN       NOT NULL DEFAULT TRUE
);

-- RF01 e RF08: produto com código, categoria, unidade (quantidade, peso ou litros) e valores de entrada e saída.
-- Exclusão é lógica (ativo = false) para não perder lotes, movimentações e relatórios.
-- Quantidades em NUMERIC(12,3) porque produto vendido por kg ou litro tem fração.
CREATE TABLE produtos (
    id              BIGSERIAL      PRIMARY KEY,
    codigo          VARCHAR(30)    NOT NULL UNIQUE,
    codigo_barras   VARCHAR(14)    UNIQUE,
    nome            VARCHAR(150)   NOT NULL,
    categoria_id    BIGINT         REFERENCES categorias(id),
    fornecedor_id   BIGINT         REFERENCES fornecedores(id),
    unidade_medida  VARCHAR(10)    NOT NULL CHECK (unidade_medida IN ('UNIDADE', 'KG', 'LITRO')),
    estoque_minimo  NUMERIC(12,3)  NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
    preco_entrada   NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (preco_entrada >= 0),
    preco_saida     NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (preco_saida >= 0),
    ativo           BOOLEAN        NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP      NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMP      NOT NULL DEFAULT now()
);

-- RF08 e RN04: toda alteração de preço fica registrada com quem alterou. A permissão
-- (só administrador ou gerente) é validada no backend antes de gravar aqui.
CREATE TABLE historico_precos (
    id                       BIGSERIAL      PRIMARY KEY,
    produto_id               BIGINT         NOT NULL REFERENCES produtos(id),
    usuario_id               BIGINT         NOT NULL REFERENCES usuarios(id),
    preco_entrada_anterior   NUMERIC(12,2)  NOT NULL,
    preco_entrada_novo       NUMERIC(12,2)  NOT NULL,
    preco_saida_anterior     NUMERIC(12,2)  NOT NULL,
    preco_saida_novo         NUMERIC(12,2)  NOT NULL,
    alterado_em              TIMESTAMP      NOT NULL DEFAULT now()
);

-- Recebimento de mercadoria pela nota (telas 11 a 14 do protótipo, dentro de RF02 e RF03).
CREATE TABLE recebimentos (
    id             BIGSERIAL    PRIMARY KEY,
    fornecedor_id  BIGINT       REFERENCES fornecedores(id),
    usuario_id     BIGINT       NOT NULL REFERENCES usuarios(id),
    numero_nota    VARCHAR(20)  NOT NULL,
    serie_nota     VARCHAR(5),
    chave_acesso   CHAR(44)     UNIQUE,
    data_emissao   DATE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'EM_CONFERENCIA'
                   CHECK (status IN ('EM_CONFERENCIA', 'COM_DIVERGENCIA', 'CONCLUIDO', 'CANCELADO')),
    criado_em      TIMESTAMP    NOT NULL DEFAULT now(),
    concluido_em   TIMESTAMP
);

-- Item da nota: a quantidade da nota contra a conferida aponta a divergência.
CREATE TABLE recebimento_itens (
    id                    BIGSERIAL      PRIMARY KEY,
    recebimento_id        BIGINT         NOT NULL REFERENCES recebimentos(id) ON DELETE CASCADE,
    produto_id            BIGINT         NOT NULL REFERENCES produtos(id),
    quantidade_nota       NUMERIC(12,3)  NOT NULL CHECK (quantidade_nota > 0),
    quantidade_conferida  NUMERIC(12,3)  CHECK (quantidade_conferida >= 0),
    valor_unitario        NUMERIC(12,2)  NOT NULL CHECK (valor_unitario >= 0),
    codigo_lote           VARCHAR(40),
    data_validade         DATE,
    observacao            VARCHAR(255)
);

-- RF03: lote com datas de recebimento e validade para rastreabilidade.
-- RN01: quantidade_atual nunca fica negativa (o backend valida antes, o CHECK é a última barreira).
-- RN02: lote vencido é sinalizado e pode ser baixado ou descartado (situacao).
CREATE TABLE lotes (
    id                BIGSERIAL      PRIMARY KEY,
    produto_id        BIGINT         NOT NULL REFERENCES produtos(id),
    recebimento_id    BIGINT         REFERENCES recebimentos(id),
    codigo            VARCHAR(40),
    data_recebimento  DATE           NOT NULL DEFAULT CURRENT_DATE,
    data_validade     DATE,
    quantidade_atual  NUMERIC(12,3)  NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
    preco_custo       NUMERIC(12,2)  CHECK (preco_custo >= 0),
    situacao          VARCHAR(12)    NOT NULL DEFAULT 'ATIVO' CHECK (situacao IN ('ATIVO', 'BAIXADO', 'DESCARTADO')),
    criado_em         TIMESTAMP      NOT NULL DEFAULT now()
);

-- RF02, RF04 e RN03: toda entrada ou saída tem lote, usuário responsável, data, hora e valores.
-- O motivo separa venda de perda e vencimento para o relatório de perdas (RF06).
CREATE TABLE movimentacoes (
    id              BIGSERIAL      PRIMARY KEY,
    lote_id         BIGINT         NOT NULL REFERENCES lotes(id),
    usuario_id      BIGINT         NOT NULL REFERENCES usuarios(id),
    recebimento_id  BIGINT         REFERENCES recebimentos(id),
    tipo            VARCHAR(10)    NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    motivo          VARCHAR(20)    NOT NULL CHECK (motivo IN ('RECEBIMENTO', 'DEVOLUCAO', 'VENDA', 'PERDA', 'VENCIMENTO', 'AJUSTE')),
    quantidade      NUMERIC(12,3)  NOT NULL CHECK (quantidade > 0),
    valor_unitario  NUMERIC(12,2)  NOT NULL CHECK (valor_unitario >= 0),
    valor_total     NUMERIC(14,2)  GENERATED ALWAYS AS (round(quantidade * valor_unitario, 2)) STORED,
    observacao      VARCHAR(255),
    data_hora       TIMESTAMP      NOT NULL DEFAULT now(),
    CHECK (
        (tipo = 'ENTRADA' AND motivo IN ('RECEBIMENTO', 'DEVOLUCAO', 'AJUSTE'))
        OR (tipo = 'SAIDA' AND motivo IN ('VENDA', 'PERDA', 'VENCIMENTO', 'AJUSTE'))
    )
);

-- Configuração geral do sistema (serviço do administrador, seção 2.4).
CREATE TABLE configuracoes (
    chave          VARCHAR(60)   PRIMARY KEY,
    valor          VARCHAR(255)  NOT NULL,
    descricao      VARCHAR(255),
    atualizado_em  TIMESTAMP     NOT NULL DEFAULT now()
);

INSERT INTO configuracoes (chave, valor, descricao) VALUES
    ('dias_alerta_vencimento', '7', 'Lotes que vencem em até esta quantidade de dias geram alerta (RF05)');

CREATE INDEX idx_produtos_nome ON produtos (lower(nome));
CREATE INDEX idx_produtos_categoria ON produtos (categoria_id);
CREATE INDEX idx_historico_precos_produto ON historico_precos (produto_id, alterado_em);
CREATE INDEX idx_recebimento_itens_recebimento ON recebimento_itens (recebimento_id);
CREATE INDEX idx_lotes_produto ON lotes (produto_id);
CREATE INDEX idx_lotes_validade ON lotes (data_validade) WHERE situacao = 'ATIVO';
CREATE UNIQUE INDEX uq_lotes_produto_codigo ON lotes (produto_id, codigo) WHERE codigo IS NOT NULL;
CREATE INDEX idx_movimentacoes_lote ON movimentacoes (lote_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes (data_hora);
CREATE INDEX idx_movimentacoes_usuario ON movimentacoes (usuario_id);

-- Estoque por produto somando lotes ativos. Lote vencido conta no total mas não no disponível (RN02).
CREATE VIEW vw_estoque_produto AS
SELECT
    p.id                                                                      AS produto_id,
    p.codigo,
    p.nome,
    p.unidade_medida,
    p.estoque_minimo,
    COALESCE(SUM(l.quantidade_atual), 0)                                      AS quantidade_total,
    COALESCE(SUM(l.quantidade_atual) FILTER (
        WHERE l.data_validade IS NULL OR l.data_validade >= CURRENT_DATE), 0)  AS quantidade_disponivel
FROM produtos p
LEFT JOIN lotes l ON l.produto_id = p.id AND l.situacao = 'ATIVO'
WHERE p.ativo
GROUP BY p.id;

-- RF05: alertas de estoque baixo, lote perto do vencimento e lote vencido.
CREATE VIEW vw_alertas AS
WITH cfg AS (
    SELECT valor::int AS dias FROM configuracoes WHERE chave = 'dias_alerta_vencimento'
)
SELECT 'ESTOQUE_BAIXO' AS tipo, e.produto_id, NULL::bigint AS lote_id, NULL::date AS data_validade,
       e.quantidade_disponivel AS quantidade
FROM vw_estoque_produto e
WHERE e.quantidade_disponivel < e.estoque_minimo
UNION ALL
SELECT CASE WHEN l.data_validade < CURRENT_DATE THEN 'LOTE_VENCIDO' ELSE 'LOTE_VENCENDO' END,
       l.produto_id, l.id, l.data_validade, l.quantidade_atual
FROM lotes l
JOIN produtos p ON p.id = l.produto_id AND p.ativo
CROSS JOIN cfg
WHERE l.situacao = 'ATIVO'
  AND l.quantidade_atual > 0
  AND l.data_validade IS NOT NULL
  AND l.data_validade <= CURRENT_DATE + cfg.dias;
