package br.com.stockflow.controller;

import br.com.stockflow.dto.request.MovimentacaoRequest;
import br.com.stockflow.dto.response.MovimentacaoResponse;
import br.com.stockflow.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    @GetMapping
    public List<MovimentacaoResponse> listarRecentes() {
        return movimentacaoService.listarRecentes();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoResponse registrar(@Valid @RequestBody MovimentacaoRequest request, Authentication authentication) {
        return movimentacaoService.registrar(request, authentication.getName());
    }
}
