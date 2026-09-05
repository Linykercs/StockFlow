package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.LoginRequest;
import br.com.stockflow.dto.response.LoginResponse;
import br.com.stockflow.repository.UsuarioRepository;
import br.com.stockflow.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado nao encontrado"));

        String token = jwtService.gerarToken(usuario.getEmail(), Map.of("perfil", usuario.getPerfil().name()));

        return new LoginResponse(token, usuario.getNome(), usuario.getEmail(), usuario.getPerfil().name());
    }
}
