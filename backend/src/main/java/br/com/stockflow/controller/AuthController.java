package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.ConfirmarMfaRequest;
import br.com.stockflow.dto.request.LoginRequest;
import br.com.stockflow.dto.response.LoginDesafioResponse;
import br.com.stockflow.dto.response.LoginResponse;
import br.com.stockflow.dto.response.UsuarioResponse;
import br.com.stockflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // 1ª etapa: confere e-mail e senha, devolve o desafio do autenticador (RF?? MFA)
    @PostMapping("/login")
    public LoginDesafioResponse login(@RequestBody @Valid LoginRequest dados) {
        return authService.login(dados);
    }

    // 2ª etapa: confere o código de 6 dígitos do autenticador e devolve o token de acesso
    @PostMapping("/login/confirmar")
    public LoginResponse confirmarMfa(@RequestBody @Valid ConfirmarMfaRequest dados) {
        return authService.confirmarMfa(dados);
    }

    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.de(usuario);
    }
}
