package br.com.stockflow.dto.response;

import br.com.stockflow.repository.AlertaView;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AlertaResponse(String tipo, ReferenciaResponse produto, LoteResumoResponse lote,
                             LocalDate dataValidade, BigDecimal quantidade) {

    public static AlertaResponse de(AlertaView a) {
        var lote = a.getLoteId() == null ? null : new LoteResumoResponse(a.getLoteId(), a.getLoteCodigo());
        return new AlertaResponse(a.getTipo(), new ReferenciaResponse(a.getProdutoId(), a.getProdutoNome()),
                lote, a.getDataValidade(), a.getQuantidade());
    }
}
