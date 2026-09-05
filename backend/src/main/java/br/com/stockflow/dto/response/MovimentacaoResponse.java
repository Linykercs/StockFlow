package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.MovimentacaoEstoque;
import br.com.stockflow.domain.enums.TipoMovimentacao;

import java.time.LocalDateTime;

public record MovimentacaoResponse(
        Long id,
        Long loteId,
        String produtoNome,
        TipoMovimentacao tipo,
        Integer quantidade,
        String observacao,
        String usuarioNome,
        LocalDateTime dataHora
) {
    public static MovimentacaoResponse de(MovimentacaoEstoque mov) {
        return new MovimentacaoResponse(
                mov.getId(),
                mov.getLote().getId(),
                mov.getLote().getProduto().getNome(),
                mov.getTipo(),
                mov.getQuantidade(),
                mov.getObservacao(),
                mov.getUsuario().getNome(),
                mov.getDataHora()
        );
    }
}
