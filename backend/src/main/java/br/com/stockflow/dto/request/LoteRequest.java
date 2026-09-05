package br.com.stockflow.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteRequest(
        @NotNull Long produtoId,
        @NotNull @Positive Integer quantidade,
        LocalDate dataValidade,
        BigDecimal precoCusto
) {
}
