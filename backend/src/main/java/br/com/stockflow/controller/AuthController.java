package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.LoginRequest;
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

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest dados) {
        return authService.login(dados);
    }

    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.de(usuario);
    }
}
