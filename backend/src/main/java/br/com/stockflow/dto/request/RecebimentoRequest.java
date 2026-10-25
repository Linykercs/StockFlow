package br.com.stockflow.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecebimentoRequest(
        Long fornecedorId,
        @NotBlank(message = "informe o número da nota") @Size(max = 20) String numeroNota,
        @Size(max = 5) String serieNota,
        @Pattern(regexp = "(\\d{44})?", message = "a chave de acesso tem 44 números") String chaveAcesso,
        LocalDate dataEmissao,
        @NotEmpty(message = "a nota precisa ter pelo menos um item") List<@Valid Item> itens) {

    public record Item(
            @NotNull(message = "informe o produto") Long produtoId,
            @NotNull(message = "informe a quantidade da nota") @Positive(message = "precisa ser maior que zero") BigDecimal quantidadeNota,
            @NotNull(message = "informe o valor unitário") @PositiveOrZero(message = "não pode ser negativo") BigDecimal valorUnitario) {
    }
}
