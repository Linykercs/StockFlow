package br.com.stockflow.controller;

import br.com.stockflow.dto.request.LoteRequest;
import br.com.stockflow.dto.response.LoteResponse;
import br.com.stockflow.service.LoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public List<LoteResponse> listarPorProduto(@RequestParam Long produtoId) {
        return loteService.listarPorProduto(produtoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public LoteResponse cadastrar(@Valid @RequestBody LoteRequest request) {
        return loteService.cadastrar(request);
    }
}
