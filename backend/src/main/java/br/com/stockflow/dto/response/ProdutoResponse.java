package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.EstoqueProduto;
import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.domain.enums.UnidadeMedida;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

// lotes só vem preenchido no GET /produtos/{id}; na lista fica de fora do JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProdutoResponse(
        Long id,
        String codigo,
        String codigoBarras,
        String nome,
        ReferenciaResponse categoria,
        ReferenciaResponse fornecedor,
        UnidadeMedida unidadeMedida,
        BigDecimal estoqueMinimo,
        BigDecimal precoEntrada,
        BigDecimal precoSaida,
        BigDecimal quantidadeTotal,
        BigDecimal quantidadeDisponivel,
        String situacaoEstoque,
        List<LoteResponse> lotes) {

    public static ProdutoResponse de(Produto produto, EstoqueProduto estoque, List<LoteResponse> lotes) {
        BigDecimal total = estoque == null ? BigDecimal.ZERO : estoque.getQuantidadeTotal();
        BigDecimal disponivel = estoque == null ? BigDecimal.ZERO : estoque.getQuantidadeDisponivel();

        String situacao = "EM_ESTOQUE";
        if (disponivel.signum() == 0) {
            situacao = "SEM_ESTOQUE";
        } else if (disponivel.compareTo(produto.getEstoqueMinimo()) < 0) {
            situacao = "ABAIXO_DO_MINIMO";
        }

        var categoria = produto.getCategoria() == null ? null
                : new ReferenciaResponse(produto.getCategoria().getId(), produto.getCategoria().getNome());
        var fornecedor = produto.getFornecedor() == null ? null
                : new ReferenciaResponse(produto.getFornecedor().getId(), produto.getFornecedor().getNome());

        return new ProdutoResponse(produto.getId(), produto.getCodigo(), produto.getCodigoBarras(), produto.getNome(),
                categoria, fornecedor, produto.getUnidadeMedida(), produto.getEstoqueMinimo(),
                produto.getPrecoEntrada(), produto.getPrecoSaida(), total, disponivel, situacao, lotes);
    }
}
