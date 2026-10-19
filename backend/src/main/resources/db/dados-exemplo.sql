-- Dados de exemplo para desenvolvimento local. Não é migration do Flyway: rodar à mão depois do V1.
-- Senha de todos os usuários: stockflow123 (hash BCrypt gerado pelo pgcrypto, compatível com o Spring Security).
-- Precisa da extensão pgcrypto, criada uma vez pelo superusuário: CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (nome, email, senha_hash, perfil, setor) VALUES
    ('Administrador StockFlow', 'admin@stockflow.com.br',    crypt('stockflow123', gen_salt('bf', 10)), 'ADMINISTRADOR', NULL),
    ('Gerente StockFlow',       'gerente@stockflow.com.br',  crypt('stockflow123', gen_salt('bf', 10)), 'GERENTE',       'Estoque'),
    ('Operador StockFlow',      'operador@stockflow.com.br', crypt('stockflow123', gen_salt('bf', 10)), 'OPERADOR',      'Recebimento');

INSERT INTO categorias (nome) VALUES ('Mercearia'), ('Laticínios'), ('Frios'), ('Padaria');

INSERT INTO fornecedores (nome, cnpj, telefone) VALUES
    ('Distribuidora Vale Verde', '12.345.678/0001-90', '(34) 3333-1000'),
    ('Laticínios Serra Azul',    '98.765.432/0001-10', '(34) 3333-2000');

INSERT INTO produtos (codigo, codigo_barras, nome, categoria_id, fornecedor_id, unidade_medida, estoque_minimo, preco_entrada, preco_saida) VALUES
    ('P001', '7891000100103', 'Arroz tipo 1 5 kg',      1, 1, 'UNIDADE', 40, 18.90, 27.90),
    ('P002', '7891000100110', 'Feijão carioca 1 kg',    1, 1, 'UNIDADE', 40,  6.50,  9.49),
    ('P003', '7891000100127', 'Leite integral 1 L',     2, 2, 'LITRO',   30,  3.49,  5.29),
    ('P004', '7891000100134', 'Margarina 500 g',        2, 2, 'UNIDADE', 20,  5.10,  7.99),
    ('P005', '7891000100158', 'Queijo muçarela',        3, 2, 'KG',       5, 32.00, 49.90),
    ('P006', '7891000100165', 'Presunto fatiado',       3, 2, 'KG',       3, 28.00, 42.90),
    ('P007', '7891000100172', 'Pão de forma 500 g',     4, 1, 'UNIDADE', 12,  6.20,  9.90);

INSERT INTO historico_precos (produto_id, usuario_id, preco_entrada_anterior, preco_entrada_novo, preco_saida_anterior, preco_saida_novo, alterado_em) VALUES
    (1, 2, 18.40, 18.90, 26.90, 27.90, now() - INTERVAL '10 days');

INSERT INTO recebimentos (fornecedor_id, usuario_id, numero_nota, serie_nota, data_emissao, status, criado_em, concluido_em) VALUES
    (2, 3, '45871', '1', CURRENT_DATE - 7, 'CONCLUIDO', now() - INTERVAL '7 days', now() - INTERVAL '7 days');
INSERT INTO recebimento_itens (recebimento_id, produto_id, quantidade_nota, quantidade_conferida, valor_unitario, codigo_lote, data_validade) VALUES
    (1, 3, 60, 60, 3.49, 'LT-L-0912', CURRENT_DATE + 2),
    (1, 5, 12.5, 12.5, 32.00, 'LT-Q-0441', CURRENT_DATE + 6);

INSERT INTO lotes (produto_id, recebimento_id, codigo, data_recebimento, data_validade, quantidade_atual, preco_custo) VALUES
    (1, NULL, 'LT-A-0128', CURRENT_DATE - 47, CURRENT_DATE + 5,   18,    18.40),
    (1, NULL, 'LT-A-0131', CURRENT_DATE - 29, CURRENT_DATE + 88,  12,    18.90),
    (1, NULL, 'LT-A-0119', CURRENT_DATE - 110, CURRENT_DATE - 4,   6,    17.80),
    (2, NULL, 'LT-F-0201', CURRENT_DATE - 20, CURRENT_DATE + 200, 62,     6.50),
    (3, 1,    'LT-L-0912', CURRENT_DATE - 7,  CURRENT_DATE + 2,   48,     3.49),
    (4, NULL, 'LT-M-0144', CURRENT_DATE - 6,  CURRENT_DATE + 7,   16,     5.10),
    (5, 1,    'LT-Q-0441', CURRENT_DATE - 7,  CURRENT_DATE + 6,   10.585, 32.00),
    (6, NULL, 'LT-P-0145', CURRENT_DATE - 4,  CURRENT_DATE + 3,    2.400, 28.00),
    (7, NULL, 'LT-B-0140', CURRENT_DATE - 5,  CURRENT_DATE - 1,    9,     6.20);

INSERT INTO movimentacoes (lote_id, usuario_id, recebimento_id, tipo, motivo, quantidade, valor_unitario, observacao, data_hora) VALUES
    (5, 3, 1,    'ENTRADA', 'RECEBIMENTO', 60,     3.49, 'Nota 45871',            now() - INTERVAL '7 days'),
    (7, 3, 1,    'ENTRADA', 'RECEBIMENTO', 12.5,  32.00, 'Nota 45871',            now() - INTERVAL '7 days'),
    (5, 3, NULL, 'SAIDA',   'VENDA',       12,     5.29, 'Reposição da gôndola',  now() - INTERVAL '2 hours'),
    (1, 3, NULL, 'SAIDA',   'VENDA',        6,    27.90, 'Reposição da gôndola',  now() - INTERVAL '3 hours'),
    (7, 3, NULL, 'SAIDA',   'VENDA',        1.915, 49.90, NULL,                   now() - INTERVAL '5 hours'),
    (8, 3, NULL, 'SAIDA',   'PERDA',        0.600, 28.00, 'Embalagem violada',    now() - INTERVAL '1 day'),
    (9, 2, NULL, 'SAIDA',   'VENCIMENTO',   3,     6.20, 'Descarte de vencidos',  now() - INTERVAL '1 day');
