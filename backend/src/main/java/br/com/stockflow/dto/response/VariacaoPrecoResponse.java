package br.com.stockflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// margem em %: quanto o preço de saída está acima do de entrada
public record VariacaoPrecoResponse(
        LocalDateTime alteradoEm,
        ReferenciaResponse produto,
        String usuario,
        BigDecimal precoEntradaAnterior,
        BigDecimal precoEntradaNovo,
        BigDecimal precoSaidaAnterior,
        BigDecimal precoSaidaNovo,
        BigDecimal margemAnterior,
        BigDecimal margemNova) {
}
