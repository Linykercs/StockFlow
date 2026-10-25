package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.HistoricoPreco;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistoricoPrecoResponse(
        LocalDateTime alteradoEm,
        String usuario,
        BigDecimal precoEntradaAnterior,
        BigDecimal precoEntradaNovo,
        BigDecimal precoSaidaAnterior,
        BigDecimal precoSaidaNovo) {

    public static HistoricoPrecoResponse de(HistoricoPreco historico) {
        return new HistoricoPrecoResponse(historico.getAlteradoEm(), historico.getUsuario().getNome(),
                historico.getPrecoEntradaAnterior(), historico.getPrecoEntradaNovo(),
                historico.getPrecoSaidaAnterior(), historico.getPrecoSaidaNovo());
    }
}
