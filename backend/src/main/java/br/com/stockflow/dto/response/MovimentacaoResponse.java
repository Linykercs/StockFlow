package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Movimentacao;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimentacaoResponse(
        Long id,
        LocalDateTime dataHora,
        TipoMovimentacao tipo,
        MotivoMovimentacao motivo,
        ReferenciaResponse produto,
        LoteResumoResponse lote,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal valorTotal,
        ReferenciaResponse usuario,
        String observacao) {

    public static MovimentacaoResponse de(Movimentacao m) {
        var lote = m.getLote();
        var produto = lote.getProduto();
        return new MovimentacaoResponse(m.getId(), m.getDataHora(), m.getTipo(), m.getMotivo(),
                new ReferenciaResponse(produto.getId(), produto.getNome()),
                new LoteResumoResponse(lote.getId(), lote.getCodigo()),
                m.getQuantidade(), m.getValorUnitario(), m.getValorTotal(),
                new ReferenciaResponse(m.getUsuario().getId(), m.getUsuario().getNome()),
                m.getObservacao());
    }
}
