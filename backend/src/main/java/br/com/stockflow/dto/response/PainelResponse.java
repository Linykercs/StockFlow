package br.com.stockflow.dto.response;

import br.com.stockflow.domain.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PainelResponse(
        BigDecimal valorTotalEstoque,
        long totalProdutos,
        long produtosAbaixoDoMinimo,
        long lotesVencendo,
        long lotesVencidos,
        List<MovimentoDoDia> movimentacoesHoje) {

    public record MovimentoDoDia(LocalDateTime dataHora, TipoMovimentacao tipo, String produto, BigDecimal quantidade) {
    }
}
