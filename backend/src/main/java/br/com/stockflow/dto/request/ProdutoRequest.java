package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.UnidadeMedida;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProdutoRequest(
        @NotBlank(message = "informe o código") @Size(max = 30) String codigo,
        @Pattern(regexp = "(\\d{8,14})?", message = "o código de barras tem de 8 a 14 números") String codigoBarras,
        @NotBlank(message = "informe o nome") @Size(max = 150) String nome,
        Long categoriaId,
        Long fornecedorId,
        @NotNull(message = "informe a unidade (UNIDADE, KG ou LITRO)") UnidadeMedida unidadeMedida,
        @NotNull(message = "informe o estoque mínimo") @PositiveOrZero(message = "não pode ser negativo") BigDecimal estoqueMinimo,
        @NotNull(message = "informe o preço de entrada") @PositiveOrZero(message = "não pode ser negativo") BigDecimal precoEntrada,
        @NotNull(message = "informe o preço de saída") @PositiveOrZero(message = "não pode ser negativo") BigDecimal precoSaida) {
}
