package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.enums.StatusLote;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        Integer quantidade,
        LocalDate dataValidade,
        LocalDate dataEntrada,
        BigDecimal precoCusto,
        StatusLote status
) {
    public static LoteResponse de(Lote lote, StatusLote status) {
        return new LoteResponse(
                lote.getId(),
                lote.getProduto().getId(),
                lote.getProduto().getNome(),
                lote.getQuantidade(),
                lote.getDataValidade(),
                lote.getDataEntrada(),
                lote.getPrecoCusto(),
                status
        );
    }
}
