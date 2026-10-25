package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.ProdutoRequest;
import br.com.stockflow.dto.response.HistoricoPrecoResponse;
import br.com.stockflow.dto.response.ProdutoResponse;
import br.com.stockflow.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public List<ProdutoResponse> listar(@RequestParam(required = false) String busca,
                                        @RequestParam(required = false) Long categoriaId,
                                        @RequestParam(required = false) String lote) {
        return produtoService.listar(busca, categoriaId, lote);
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable Long id) {
        return produtoService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public ProdutoResponse criar(@RequestBody @Valid ProdutoRequest dados) {
        return produtoService.criar(dados);
    }

    // RN04: só administrador e gerente editam, e com isso só eles alteram preço
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public ProdutoResponse editar(@PathVariable Long id, @RequestBody @Valid ProdutoRequest dados,
                                  @AuthenticationPrincipal Usuario logado) {
        return produtoService.editar(id, dados, logado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public void excluir(@PathVariable Long id) {
        produtoService.excluir(id);
    }

    @GetMapping("/{id}/historico-precos")
    public List<HistoricoPrecoResponse> historicoDePrecos(@PathVariable Long id) {
        return produtoService.historicoDePrecos(id);
    }
}
