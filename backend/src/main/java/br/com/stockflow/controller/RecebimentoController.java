package br.com.stockflow.controller;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.StatusRecebimento;
import br.com.stockflow.dto.request.ConferenciaItemRequest;
import br.com.stockflow.dto.request.RecebimentoRequest;
import br.com.stockflow.dto.response.RecebimentoResponse;
import br.com.stockflow.service.RecebimentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recebimentos")
public class RecebimentoController {

    private final RecebimentoService recebimentoService;

    public RecebimentoController(RecebimentoService recebimentoService) {
        this.recebimentoService = recebimentoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecebimentoResponse criar(@RequestBody @Valid RecebimentoRequest dados, @AuthenticationPrincipal Usuario usuario) {
        return recebimentoService.criar(dados, usuario);
    }

    @GetMapping
    public List<RecebimentoResponse> listar(@RequestParam(required = false) StatusRecebimento status) {
        return recebimentoService.listar(status);
    }

    @GetMapping("/{id}")
    public RecebimentoResponse buscar(@PathVariable Long id) {
        return recebimentoService.buscar(id);
    }

    @GetMapping("/chave/{chaveAcesso}")
    public RecebimentoResponse buscarPorChave(@PathVariable String chaveAcesso) {
        return recebimentoService.buscarPorChave(chaveAcesso);
    }

    @PutMapping("/{id}/itens/{itemId}")
    public RecebimentoResponse conferirItem(@PathVariable Long id, @PathVariable Long itemId,
                                            @RequestBody @Valid ConferenciaItemRequest dados) {
        return recebimentoService.conferirItem(id, itemId, dados);
    }

    @PostMapping("/{id}/concluir")
    public RecebimentoResponse concluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return recebimentoService.concluir(id, usuario);
    }

    @PostMapping("/{id}/cancelar")
    public RecebimentoResponse cancelar(@PathVariable Long id) {
        return recebimentoService.cancelar(id);
    }
}
