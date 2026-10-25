package br.com.stockflow.controller;

import br.com.stockflow.dto.response.*;
import br.com.stockflow.service.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

// RN05: relatórios só para administrador e gerente
@RestController
@RequestMapping("/api/relatorios")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/estoque")
    public RelatorioEstoqueResponse estoque(@RequestParam(required = false) Long categoriaId) {
        return relatorioService.estoque(categoriaId);
    }

    @GetMapping("/movimentacoes")
    public RelatorioMovimentacoesResponse movimentacoes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Long categoriaId) {
        return relatorioService.movimentacoes(inicio, fim, categoriaId);
    }

    @GetMapping("/perdas")
    public RelatorioPerdasResponse perdas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Long categoriaId) {
        return relatorioService.perdas(inicio, fim, categoriaId);
    }

    @GetMapping("/vencimentos")
    public List<LoteResponse> vencimentos(@RequestParam(required = false) Long categoriaId) {
        return relatorioService.vencimentos(categoriaId);
    }

    @GetMapping("/precos")
    public List<VariacaoPrecoResponse> precos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Long categoriaId) {
        return relatorioService.precos(inicio, fim, categoriaId);
    }
}
