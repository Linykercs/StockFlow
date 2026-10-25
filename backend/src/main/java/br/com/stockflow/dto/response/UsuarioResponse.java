package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.PerfilUsuario;

public record UsuarioResponse(Long id, String nome, String email, PerfilUsuario perfil, String setor, boolean ativo) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getPerfil(), usuario.getSetor(), usuario.isAtivo());
    }
}
