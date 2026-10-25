package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.MotivoMovimentacao;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EntradaRequest(
        @NotNull(message = "informe o produto") Long produtoId,
        @NotBlank(message = "informe o código do lote") @Size(max = 40) String codigoLote,
        LocalDate dataValidade,
        @NotNull(message = "informe a quantidade") @Positive(message = "precisa ser maior que zero") BigDecimal quantidade,
        @NotNull(message = "informe o valor unitário") @PositiveOrZero(message = "não pode ser negativo") BigDecimal valorUnitario,
        @NotNull(message = "informe o motivo (RECEBIMENTO, DEVOLUCAO ou AJUSTE)") MotivoMovimentacao motivo,
        @Size(max = 255) String observacao) {
}
