package br.com.stockflow.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ConfirmarMfaRequest(
        @NotBlank(message = "faça login novamente") String loginToken,
        @NotBlank(message = "informe o código do autenticador") String codigo) {
}
