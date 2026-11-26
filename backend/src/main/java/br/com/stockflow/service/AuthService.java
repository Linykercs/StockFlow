package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.ConfirmarMfaRequest;
import br.com.stockflow.dto.request.LoginRequest;
import br.com.stockflow.dto.response.LoginDesafioResponse;
import br.com.stockflow.dto.response.LoginResponse;
import br.com.stockflow.dto.response.UsuarioResponse;
import br.com.stockflow.exception.NaoAutorizadoException;
import br.com.stockflow.repository.UsuarioRepository;
import br.com.stockflow.security.JwtService;
import br.com.stockflow.security.TotpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TotpService totpService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, TotpService totpService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.totpService = totpService;
    }

    // 1ª etapa: confere e-mail e senha. A autenticação só termina na 2ª etapa, com o código do autenticador.
    @Transactional
    public LoginDesafioResponse login(LoginRequest dados) {
        // mesma mensagem para e-mail inexistente, senha errada e usuário inativo,
        // para não revelar quais e-mails existem no sistema
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(dados.email().trim())
                .filter(Usuario::isAtivo)
                .filter(u -> passwordEncoder.matches(dados.senha(), u.getSenhaHash()))
                .orElseThrow(() -> new NaoAutorizadoException("E-mail ou senha inválidos."));

        String loginToken = jwtService.gerarTokenMfaPendente(usuario);

        if (!usuario.isMfaAtivo()) {
            // 1ª configuração: gera um segredo novo (só fica ativo quando o código for confirmado)
            String segredo = totpService.gerarSegredo();
            usuario.setMfaSecret(segredo);
            return LoginDesafioResponse.configurarMfa(loginToken, totpService.gerarUriOtpAuth(segredo, usuario.getEmail()));
        }

        return LoginDesafioResponse.informarCodigo(loginToken);
    }

    // 2ª etapa: confere o código de 6 dígitos do autenticador e só aí devolve o token de acesso de verdade
    @Transactional
    public LoginResponse confirmarMfa(ConfirmarMfaRequest dados) {
        Long usuarioId = jwtService.lerUsuarioIdMfaPendente(dados.loginToken());
        Usuario usuario = usuarioId == null ? null : usuarioRepository.findById(usuarioId).filter(Usuario::isAtivo).orElse(null);

        if (usuario == null || usuario.getMfaSecret() == null || !totpService.codigoValido(usuario.getMfaSecret(), dados.codigo())) {
            throw new NaoAutorizadoException("Código inválido ou login vencido. Faça login novamente.");
        }

        usuario.setMfaAtivo(true);
        return new LoginResponse(jwtService.gerarToken(usuario), UsuarioResponse.de(usuario));
    }
}
