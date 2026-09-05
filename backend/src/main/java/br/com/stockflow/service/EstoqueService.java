package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.enums.StatusLote;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Calcula o status de um lote (badges ok/baixo/vencendo/vencido do design system). */
@Service
public class EstoqueService {

    private final int diasAlertaValidade;

    public EstoqueService(@Value("${stockflow.regras.dias-alerta-validade}") int diasAlertaValidade) {
        this.diasAlertaValidade = diasAlertaValidade;
    }

    public StatusLote calcularStatus(Lote lote) {
        if (lote.isVencido()) {
            return StatusLote.VENCIDO;
        }
        if (lote.isVencendoEm(diasAlertaValidade)) {
            return StatusLote.VENCENDO;
        }
        int estoqueMinimo = lote.getProduto().getEstoqueMinimo();
        if (estoqueMinimo > 0 && lote.getQuantidade() <= estoqueMinimo) {
            return StatusLote.BAIXO;
        }
        return StatusLote.EM_ESTOQUE;
    }
}
