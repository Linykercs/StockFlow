package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.UsuarioRequest;
import br.com.stockflow.dto.response.UsuarioResponse;
import br.com.stockflow.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponse buscar(@PathVariable Long id) {
        return usuarioService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse criar(@RequestBody @Valid UsuarioRequest dados) {
        return usuarioService.criar(dados);
    }

    @PutMapping("/{id}")
    public UsuarioResponse editar(@PathVariable Long id, @RequestBody @Valid UsuarioRequest dados,
                                  @AuthenticationPrincipal Usuario logado) {
        return usuarioService.editar(id, dados, logado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inativar(@PathVariable Long id, @AuthenticationPrincipal Usuario logado) {
        usuarioService.inativar(id, logado);
    }
}
