package br.com.stockflow.controller;

import br.com.stockflow.dto.request.ConfiguracaoRequest;
import br.com.stockflow.dto.response.ConfiguracaoResponse;
import br.com.stockflow.service.ConfiguracaoService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuracoes")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ConfiguracaoController {

    private final ConfiguracaoService configuracaoService;

    public ConfiguracaoController(ConfiguracaoService configuracaoService) {
        this.configuracaoService = configuracaoService;
    }

    @GetMapping
    public List<ConfiguracaoResponse> listar() {
        return configuracaoService.listar();
    }

    @PutMapping("/{chave}")
    public ConfiguracaoResponse alterar(@PathVariable String chave, @RequestBody @Valid ConfiguracaoRequest dados) {
        return configuracaoService.alterar(chave, dados);
    }
}
