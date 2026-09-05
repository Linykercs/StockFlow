package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.domain.enums.StatusLote;
import br.com.stockflow.domain.enums.UnidadeMedida;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class EstoqueServiceTest {

    private final EstoqueService estoqueService = new EstoqueService(7);

    @Test
    void loteSemProblemasFicaEmEstoque() {
        Lote lote = loteCom(50, LocalDate.now().plusMonths(2), 10);
        assertThat(estoqueService.calcularStatus(lote)).isEqualTo(StatusLote.EM_ESTOQUE);
    }

    @Test
    void loteComValidadeVencidaFicaVencido() {
        Lote lote = loteCom(50, LocalDate.now().minusDays(1), 10);
        assertThat(estoqueService.calcularStatus(lote)).isEqualTo(StatusLote.VENCIDO);
    }

    @Test
    void loteVencendoEmMenosDe7DiasFicaVencendo() {
        Lote lote = loteCom(50, LocalDate.now().plusDays(3), 10);
        assertThat(estoqueService.calcularStatus(lote)).isEqualTo(StatusLote.VENCENDO);
    }

    @Test
    void loteAbaixoDoEstoqueMinimoFicaBaixo() {
        Lote lote = loteCom(5, LocalDate.now().plusMonths(2), 10);
        assertThat(estoqueService.calcularStatus(lote)).isEqualTo(StatusLote.BAIXO);
    }

    private Lote loteCom(int quantidade, LocalDate validade, int estoqueMinimo) {
        Produto produto = Produto.builder()
                .nome("Produto teste")
                .unidadeMedida(UnidadeMedida.UNIDADE)
                .estoqueMinimo(estoqueMinimo)
                .build();
        return Lote.builder()
                .produto(produto)
                .quantidade(quantidade)
                .dataValidade(validade)
                .build();
    }
}
