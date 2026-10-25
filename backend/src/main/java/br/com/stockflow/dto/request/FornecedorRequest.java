package br.com.stockflow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FornecedorRequest(
        @NotBlank(message = "informe o nome") @Size(max = 120) String nome,
        @Pattern(regexp = "(\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})?", message = "use o formato 00.000.000/0000-00") String cnpj,
        @Size(max = 20) String telefone,
        @Email(message = "e-mail inválido") @Size(max = 160) String email) {
}
