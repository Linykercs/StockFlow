package br.com.stockflow.controller;

import br.com.stockflow.dto.response.AlertaResponse;
import br.com.stockflow.dto.response.PainelResponse;
import br.com.stockflow.service.PainelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PainelController {

    private final PainelService painelService;

    public PainelController(PainelService painelService) {
        this.painelService = painelService;
    }

    @GetMapping("/alertas")
    public List<AlertaResponse> alertas() {
        return painelService.alertas();
    }

    @GetMapping("/painel")
    public PainelResponse painel() {
        return painelService.painel();
    }
}
