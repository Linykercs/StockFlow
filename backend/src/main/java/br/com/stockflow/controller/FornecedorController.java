package br.com.stockflow.controller;

import br.com.stockflow.dto.request.FornecedorRequest;
import br.com.stockflow.dto.response.FornecedorResponse;
import br.com.stockflow.service.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @GetMapping
    public List<FornecedorResponse> listar() {
        return fornecedorService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public FornecedorResponse criar(@RequestBody @Valid FornecedorRequest dados) {
        return fornecedorService.criar(dados);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public FornecedorResponse editar(@PathVariable Long id, @RequestBody @Valid FornecedorRequest dados) {
        return fornecedorService.editar(id, dados);
    }
}
