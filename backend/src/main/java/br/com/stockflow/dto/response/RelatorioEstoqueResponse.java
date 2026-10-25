package br.com.stockflow.dto.response;

import br.com.stockflow.domain.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioEstoqueResponse(List<Item> itens, BigDecimal valorTotalCusto, BigDecimal valorTotalVenda) {

    public record Item(
            Long produtoId,
            String codigo,
            String nome,
            String categoria,
            UnidadeMedida unidadeMedida,
            BigDecimal estoqueMinimo,
            BigDecimal quantidadeTotal,
            BigDecimal quantidadeDisponivel,
            BigDecimal valorCusto,
            BigDecimal valorVenda) {
    }
}
