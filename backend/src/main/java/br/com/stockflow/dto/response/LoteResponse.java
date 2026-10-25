package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.enums.SituacaoLote;
import br.com.stockflow.domain.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record LoteResponse(
        Long id,
        String codigo,
        ProdutoDoLote produto,
        LocalDate dataRecebimento,
        LocalDate dataValidade,
        BigDecimal quantidadeAtual,
        BigDecimal precoCusto,
        SituacaoLote situacao,
        String situacaoValidade,
        Long diasParaVencer) {

    public record ProdutoDoLote(Long id, String nome, UnidadeMedida unidadeMedida) {
    }

    // diasAlerta vem da configuração dias_alerta_vencimento (RF05)
    public static LoteResponse de(Lote lote, int diasAlerta) {
        var produto = lote.getProduto();
        Long dias = lote.getDataValidade() == null ? null
                : ChronoUnit.DAYS.between(LocalDate.now(), lote.getDataValidade());

        String situacaoValidade = "OK";
        if (dias != null && dias < 0) {
            situacaoValidade = "VENCIDO";
        } else if (dias != null && dias <= diasAlerta) {
            situacaoValidade = "VENCENDO";
        }

        return new LoteResponse(lote.getId(), lote.getCodigo(),
                new ProdutoDoLote(produto.getId(), produto.getNome(), produto.getUnidadeMedida()),
                lote.getDataRecebimento(), lote.getDataValidade(), lote.getQuantidadeAtual(), lote.getPrecoCusto(),
                lote.getSituacao(), situacaoValidade, dias);
    }
}
