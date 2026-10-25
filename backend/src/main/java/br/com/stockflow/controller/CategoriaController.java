package br.com.stockflow.controller;

import br.com.stockflow.dto.request.CategoriaRequest;
import br.com.stockflow.dto.response.ReferenciaResponse;
import br.com.stockflow.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<ReferenciaResponse> listar() {
        return categoriaService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public ReferenciaResponse criar(@RequestBody @Valid CategoriaRequest dados) {
        return categoriaService.criar(dados);
    }
}
