package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.SituacaoLote;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BaixaLoteRequest(
        @NotNull(message = "informe a situação (BAIXADO ou DESCARTADO)") SituacaoLote situacao,
        @NotNull(message = "informe o motivo (VENCIMENTO ou PERDA)") MotivoMovimentacao motivo,
        @Size(max = 255) String observacao) {
}
