package br.com.stockflow.security;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// Lê o "Authorization: Bearer <token>" de cada requisição e deixa o usuário logado disponível
// nos controllers com @AuthenticationPrincipal Usuario usuario
@Component
public class JwtFiltro extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtFiltro(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String cabecalho = request.getHeader("Authorization");
        if (cabecalho != null && cabecalho.startsWith("Bearer ")) {
            Long usuarioId = jwtService.lerUsuarioId(cabecalho.substring(7));
            if (usuarioId != null) {
                // busca no banco a cada requisição para um usuário inativado perder o acesso na hora
                usuarioRepository.findById(usuarioId)
                        .filter(Usuario::isAtivo)
                        .ifPresent(this::autenticar);
            }
        }
        chain.doFilter(request, response);
    }

    private void autenticar(Usuario usuario) {
        var perfil = new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name());
        var autenticacao = new UsernamePasswordAuthenticationToken(usuario, null, List.of(perfil));
        SecurityContextHolder.getContext().setAuthentication(autenticacao);
    }
}
