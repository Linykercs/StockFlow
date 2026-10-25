package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.SituacaoLote;
import br.com.stockflow.dto.request.BaixaLoteRequest;
import br.com.stockflow.dto.response.LoteResponse;
import br.com.stockflow.dto.response.MovimentacaoResponse;
import br.com.stockflow.service.LoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {

    private final LoteService loteService;

    public LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @GetMapping
    public List<LoteResponse> listar(@RequestParam(required = false) Long produtoId,
                                     @RequestParam(required = false) SituacaoLote situacao,
                                     @RequestParam(required = false) String vencimento) {
        return loteService.listar(produtoId, situacao, vencimento);
    }

    @PostMapping("/{id}/baixa")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoResponse baixar(@PathVariable Long id, @RequestBody @Valid BaixaLoteRequest dados,
                                       @AuthenticationPrincipal Usuario usuario) {
        return loteService.baixar(id, dados, usuario);
    }
}
