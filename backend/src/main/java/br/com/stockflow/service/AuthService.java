package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.LoginRequest;
import br.com.stockflow.dto.response.LoginResponse;
import br.com.stockflow.dto.response.UsuarioResponse;
import br.com.stockflow.exception.NaoAutorizadoException;
import br.com.stockflow.repository.UsuarioRepository;
import br.com.stockflow.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest dados) {
        // mesma mensagem para e-mail inexistente, senha errada e usuário inativo,
        // para não revelar quais e-mails existem no sistema
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(dados.email().trim())
                .filter(Usuario::isAtivo)
                .filter(u -> passwordEncoder.matches(dados.senha(), u.getSenhaHash()))
                .orElseThrow(() -> new NaoAutorizadoException("E-mail ou senha inválidos."));

        return new LoginResponse(jwtService.gerarToken(usuario), UsuarioResponse.de(usuario));
    }
}
