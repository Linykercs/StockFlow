package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.UnidadeMedida;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProdutoRequest(
        @NotBlank String nome,
        String codigoBarras,
        @NotNull UnidadeMedida unidadeMedida,
        @NotNull @PositiveOrZero Integer estoqueMinimo,
        Long categoriaId,
        Long fornecedorId
) {
}
