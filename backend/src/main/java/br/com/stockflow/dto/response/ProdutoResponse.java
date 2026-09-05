package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.domain.enums.UnidadeMedida;

public record ProdutoResponse(
        Long id,
        String nome,
        String codigoBarras,
        UnidadeMedida unidadeMedida,
        Integer estoqueMinimo,
        int quantidadeTotal,
        String categoria,
        String fornecedor,
        boolean ativo
) {
    public static ProdutoResponse de(Produto produto) {
        return new ProdutoResponse(
                produto.getId(),
                produto.getNome(),
                produto.getCodigoBarras(),
                produto.getUnidadeMedida(),
                produto.getEstoqueMinimo(),
                produto.getQuantidadeTotal(),
                produto.getCategoria() != null ? produto.getCategoria().getNome() : null,
                produto.getFornecedor() != null ? produto.getFornecedor().getNome() : null,
                produto.isAtivo()
        );
    }
}
