package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Recebimento;
import br.com.stockflow.domain.entity.RecebimentoItem;
import br.com.stockflow.domain.enums.StatusRecebimento;
import br.com.stockflow.domain.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RecebimentoResponse(
        Long id,
        ReferenciaResponse fornecedor,
        ReferenciaResponse usuario,
        String numeroNota,
        String serieNota,
        String chaveAcesso,
        LocalDate dataEmissao,
        StatusRecebimento status,
        LocalDateTime criadoEm,
        LocalDateTime concluidoEm,
        int totalItens,
        int itensConferidos,
        BigDecimal valorNota,
        List<Item> itens) {

    public record Item(
            Long id,
            Long produtoId,
            String produtoNome,
            UnidadeMedida unidadeMedida,
            BigDecimal quantidadeNota,
            BigDecimal quantidadeConferida,
            BigDecimal valorUnitario,
            String codigoLote,
            LocalDate dataValidade,
            String observacao,
            boolean divergente) {

        static Item de(RecebimentoItem item) {
            var produto = item.getProduto();
            return new Item(item.getId(), produto.getId(), produto.getNome(), produto.getUnidadeMedida(),
                    item.getQuantidadeNota(), item.getQuantidadeConferida(), item.getValorUnitario(),
                    item.getCodigoLote(), item.getDataValidade(), item.getObservacao(), RecebimentoResponse.divergente(item));
        }
    }

    // item conferido com quantidade diferente da nota
    public static boolean divergente(RecebimentoItem item) {
        return item.getQuantidadeConferida() != null
                && item.getQuantidadeConferida().compareTo(item.getQuantidadeNota()) != 0;
    }

    public static RecebimentoResponse de(Recebimento r) {
        var fornecedor = r.getFornecedor() == null ? null
                : new ReferenciaResponse(r.getFornecedor().getId(), r.getFornecedor().getNome());
        int conferidos = (int) r.getItens().stream().filter(i -> i.getQuantidadeConferida() != null).count();
        BigDecimal valorNota = r.getItens().stream()
                .map(i -> i.getQuantidadeNota().multiply(i.getValorUnitario()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return new RecebimentoResponse(r.getId(), fornecedor,
                new ReferenciaResponse(r.getUsuario().getId(), r.getUsuario().getNome()),
                r.getNumeroNota(), r.getSerieNota(), r.getChaveAcesso(), r.getDataEmissao(), r.getStatus(),
                r.getCriadoEm(), r.getConcluidoEm(), r.getItens().size(), conferidos, valorNota,
                r.getItens().stream().map(Item::de).toList());
    }
}
