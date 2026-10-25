package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.MotivoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

// loteIds é opcional: sem ele, a saída tira primeiro do lote que vence antes
public record SaidaRequest(
        @NotNull(message = "informe o produto") Long produtoId,
        @NotNull(message = "informe a quantidade") @Positive(message = "precisa ser maior que zero") BigDecimal quantidade,
        @NotNull(message = "informe o motivo (VENDA, PERDA, VENCIMENTO ou AJUSTE)") MotivoMovimentacao motivo,
        List<Long> loteIds,
        @Size(max = 255) String observacao) {
}
