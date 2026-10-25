package br.com.stockflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfiguracaoRequest(
        @NotBlank(message = "informe o valor") @Size(max = 255) String valor) {
}
