package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import br.com.stockflow.dto.request.EntradaRequest;
import br.com.stockflow.dto.request.SaidaRequest;
import br.com.stockflow.dto.response.MovimentacaoResponse;
import br.com.stockflow.dto.response.PaginaResponse;
import br.com.stockflow.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// RN03: o usuário vem do token (@AuthenticationPrincipal), nunca do corpo da requisição
@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    @PostMapping("/entrada")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoResponse entrada(@RequestBody @Valid EntradaRequest dados, @AuthenticationPrincipal Usuario usuario) {
        return movimentacaoService.entrada(dados, usuario);
    }

    @PostMapping("/saida")
    @ResponseStatus(HttpStatus.CREATED)
    public List<MovimentacaoResponse> saida(@RequestBody @Valid SaidaRequest dados, @AuthenticationPrincipal Usuario usuario) {
        return movimentacaoService.saida(dados, usuario);
    }

    @GetMapping
    public PaginaResponse<MovimentacaoResponse> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) TipoMovimentacao tipo,
            @RequestParam(required = false) MotivoMovimentacao motivo,
            @RequestParam(required = false) Long produtoId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {
        return movimentacaoService.listar(inicio, fim, tipo, motivo, produtoId, usuarioId, pagina, tamanho);
    }
}
