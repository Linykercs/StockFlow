package br.com.stockflow.dto.response;

import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RelatorioMovimentacoesResponse(
        LocalDate inicio,
        LocalDate fim,
        BigDecimal valorTotalEntradas,
        BigDecimal valorTotalSaidas,
        List<Total> totais) {

    public record Total(TipoMovimentacao tipo, MotivoMovimentacao motivo, long registros,
                        BigDecimal quantidade, BigDecimal valorTotal) {
    }
}
