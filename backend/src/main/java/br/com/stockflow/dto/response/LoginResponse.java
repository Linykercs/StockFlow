package br.com.stockflow.dto.response;

public record LoginResponse(
        String token,
        String nome,
        String email,
        String perfil
) {
}
