import type { Produto, StockMovement, StockUser } from "../types/Produto";

export const initialProducts: Produto[] = [
  {
    id: "p1", name: "Arroz Tio Prato Fino 5kg", barcode: "7896290303154", category: "Mercearia", unit: "PCT", minimumStock: 40, costPrice: 25.28, salePrice: 32.99,
    batches: [{ id: "b1", productId: "p1", code: "L-2380", receivedAt: "2026-09-18", expiresAt: "2026-10-22", quantity: 36, initialQuantity: 80 }],
  },
  {
    id: "p2", name: "Feijão Carioca Camil 1kg", barcode: "7896006711150", category: "Mercearia", unit: "PCT", minimumStock: 30, costPrice: 8.40, salePrice: 11.49,
    batches: [{ id: "b2", productId: "p2", code: "L-2374", receivedAt: "2026-10-03", expiresAt: "2026-10-27", quantity: 18, initialQuantity: 60 }],
  },
  {
    id: "p3", name: "Leite em pó integral 1kg", barcode: "7898215151107", category: "Laticínios", unit: "CX", minimumStock: 24, costPrice: 34.50, salePrice: 41.90,
    batches: [
      { id: "b3", productId: "p3", code: "L-2392", receivedAt: "2026-10-18", expiresAt: "2026-10-26", quantity: 42, initialQuantity: 80, prioritized: true },
      { id: "b4", productId: "p3", code: "L-2401", receivedAt: "2026-10-22", expiresAt: "2027-02-18", quantity: 68, initialQuantity: 68 },
    ],
  },
  {
    id: "p4", name: "Óleo de soja Soya 900ml", barcode: "7891107101620", category: "Mercearia", unit: "UN", minimumStock: 35, costPrice: 7.25, salePrice: 9.79,
    batches: [{ id: "b5", productId: "p4", code: "L-2389", receivedAt: "2026-10-15", expiresAt: "2027-01-12", quantity: 82, initialQuantity: 100 }],
  },
  {
    id: "p5", name: "Café Três Corações 500g", barcode: "7896005800145", category: "Mercearia", unit: "PCT", minimumStock: 20, costPrice: 18.50, salePrice: 23.90,
    batches: [{ id: "b6", productId: "p5", code: "L-2398", receivedAt: "2026-10-19", expiresAt: "2027-04-09", quantity: 54, initialQuantity: 60 }],
  },
  {
    id: "p6", name: "Detergente neutro Ypê 500ml", barcode: "7896098900203", category: "Limpeza", unit: "UN", minimumStock: 25, costPrice: 2.75, salePrice: 4.29,
    batches: [{ id: "b7", productId: "p6", code: "L-2368", receivedAt: "2026-09-10", expiresAt: "2028-09-10", quantity: 96, initialQuantity: 120 }],
  },
  {
    id: "p7", name: "Banana prata kg", barcode: "2000000001542", category: "Hortifrúti", unit: "KG", minimumStock: 25, costPrice: 4.30, salePrice: 6.99,
    batches: [{ id: "b8", productId: "p7", code: "L-2404", receivedAt: "2026-10-23", expiresAt: "2026-10-25", quantity: 14, initialQuantity: 35, prioritized: true }],
  },
  {
    id: "p8", name: "Álcool 70% 1L", barcode: "7891024035015", category: "Limpeza", unit: "L", minimumStock: 15, costPrice: 7.90, salePrice: 10.49,
    batches: [{ id: "b9", productId: "p8", code: "L-2406", receivedAt: "2026-10-23", expiresAt: "2028-03-20", quantity: 0, initialQuantity: 24 }],
  },
  {
    id: "p9", name: "Presunto cozido fatiado kg", barcode: "2000000003317", category: "Frios", unit: "KG", minimumStock: 12, costPrice: 29.90, salePrice: 39.90,
    batches: [{ id: "b10", productId: "p9", code: "L-2396", receivedAt: "2026-10-17", expiresAt: "2026-10-23", quantity: 9, initialQuantity: 30, blocked: true }],
  },
];

export const initialMovements: StockMovement[] = [
  { id: "m1", productId: "p1", productName: "Arroz Tio Prato Fino 5kg", batchCode: "L-2380", type: "Saída", quantity: 6, unitValue: 32.99, reason: "Venda / reposição de gôndola", user: "Katia Costa", createdAt: "2026-10-24T10:36:00" },
  { id: "m2", productId: "p6", productName: "Detergente neutro Ypê 500ml", batchCode: "L-2368", type: "Entrada", quantity: 120, unitValue: 2.75, reason: "Entrada por nota fiscal", user: "Katia Costa", createdAt: "2026-10-24T09:58:00" },
  { id: "m3", productId: "p2", productName: "Feijão Carioca Camil 1kg", batchCode: "L-2374", type: "Saída", quantity: 12, unitValue: 11.49, reason: "Venda / reposição de gôndola", user: "Amanda Garcia", createdAt: "2026-10-24T09:20:00" },
  { id: "m4", productId: "p3", productName: "Leite em pó integral 1kg", batchCode: "L-2392", type: "Entrada", quantity: 80, unitValue: 34.50, reason: "Entrada por nota fiscal", user: "Claud Duarte", createdAt: "2026-10-23T16:42:00" },
  { id: "m5", productId: "p7", productName: "Banana prata kg", batchCode: "L-2404", type: "Baixa", quantity: 3, unitValue: 4.30, reason: "Avaria", user: "Amanda Garcia", createdAt: "2026-10-23T15:18:00" },
  { id: "m6", productId: "p9", productName: "Presunto cozido fatiado kg", batchCode: "L-2396", type: "Baixa", quantity: 9, unitValue: 29.90, reason: "Produto vencido", user: "Claud Duarte", createdAt: "2026-10-23T11:06:00" },
  { id: "m7", productId: "p4", productName: "Óleo de soja Soya 900ml", batchCode: "L-2389", type: "Saída", quantity: 18, unitValue: 9.79, reason: "Venda / reposição de gôndola", user: "Amanda Garcia", createdAt: "2026-10-22T14:33:00" },
];

export const initialUsers: StockUser[] = [
  { id: "u1", name: "Lidyanne Mendonça Coelho", email: "lidyanne@irmaoscosta.com.br", role: "Administrador", status: "Ativo" },
  { id: "u2", name: "Amanda Moniele Garcia", email: "amanda@irmaoscosta.com.br", role: "Gerente de estoque", status: "Ativo" },
  { id: "u3", name: "Katia Santana da Costa", email: "katia@irmaoscosta.com.br", role: "Operador", status: "Ativo" },
  { id: "u4", name: "Claud Aparecido Duarte", email: "claud@irmaoscosta.com.br", role: "Operador", status: "Ativo" },
  { id: "u5", name: "Marisa Rocha", email: "marisa@irmaoscosta.com.br", role: "Operador", status: "Inativo" },
];
