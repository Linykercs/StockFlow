package br.com.stockflow.dto.response;

import java.util.List;

public record DashboardResponse(
        long totalProdutos,
        long lotesEmEstoque,
        long lotesEstoqueBaixo,
        long lotesVencendo,
        long lotesVencidos,
        List<LoteResponse> alertas
) {
}
