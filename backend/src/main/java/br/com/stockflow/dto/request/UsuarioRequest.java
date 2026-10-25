package br.com.stockflow.dto.request;

import br.com.stockflow.domain.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// senha é obrigatória só no cadastro; na edição, vazia mantém a senha atual
public record UsuarioRequest(
        @NotBlank(message = "informe o nome") @Size(max = 120) String nome,
        @NotBlank(message = "informe o e-mail") @Email(message = "e-mail inválido") @Size(max = 160) String email,
        @Size(min = 6, message = "a senha precisa ter pelo menos 6 caracteres") String senha,
        @NotNull(message = "informe o perfil") PerfilUsuario perfil,
        @Size(max = 60) String setor,
        Boolean ativo) {
}
