package br.com.stockflow.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ConferenciaItemRequest(
        @NotNull(message = "informe a quantidade conferida") @PositiveOrZero(message = "não pode ser negativa") BigDecimal quantidadeConferida,
        @Size(max = 40) String codigoLote,
        LocalDate dataValidade,
        @Size(max = 255) String observacao) {
}
