package br.com.stockflow.dto.response;

public record LoginResponse(String token, UsuarioResponse usuario) {
}
