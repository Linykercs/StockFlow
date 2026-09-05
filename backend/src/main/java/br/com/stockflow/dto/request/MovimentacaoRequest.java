package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MovimentacaoRequest(
        @NotNull Long loteId,
        @NotNull TipoMovimentacao tipo,
        @NotNull @Positive Integer quantidade,
        String observacao
) {
}
