package br.com.stockflow.dto.response;

import br.com.stockflow.domain.enums.MotivoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RelatorioPerdasResponse(
        LocalDate inicio,
        LocalDate fim,
        BigDecimal valorTotal,
        List<Mes> porMes,
        List<Item> itens) {

    // mes no formato "2026-10"
    public record Mes(String mes, BigDecimal valorTotal) {
    }

    public record Item(LocalDateTime dataHora, ReferenciaResponse produto, String lote, MotivoMovimentacao motivo,
                       BigDecimal quantidade, BigDecimal valorTotal, String observacao) {
    }
}
