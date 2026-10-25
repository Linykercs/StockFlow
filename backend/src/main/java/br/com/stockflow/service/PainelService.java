package br.com.stockflow.service;

import br.com.stockflow.dto.response.AlertaResponse;
import br.com.stockflow.dto.response.PainelResponse;
import br.com.stockflow.repository.AlertaView;
import br.com.stockflow.repository.LoteRepository;
import br.com.stockflow.repository.MovimentacaoRepository;
import br.com.stockflow.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

// RF05 (alertas) e painel do gerente
@Service
public class PainelService {

    private final LoteRepository loteRepository;
    private final ProdutoRepository produtoRepository;
    private final MovimentacaoRepository movimentacaoRepository;

    public PainelService(LoteRepository loteRepository, ProdutoRepository produtoRepository,
                         MovimentacaoRepository movimentacaoRepository) {
        this.loteRepository = loteRepository;
        this.produtoRepository = produtoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    // vencidos primeiro, depois os que estão vencendo, depois estoque baixo
    @Transactional(readOnly = true)
    public List<AlertaResponse> alertas() {
        return loteRepository.buscarAlertas().stream().map(AlertaResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public PainelResponse painel() {
        List<AlertaView> alertas = loteRepository.buscarAlertas();

        var hoje = movimentacaoRepository.buscarDesde(LocalDate.now().atStartOfDay()).stream()
                .map(m -> new PainelResponse.MovimentoDoDia(m.getDataHora(), m.getTipo(),
                        m.getLote().getProduto().getNome(), m.getQuantidade()))
                .toList();

        return new PainelResponse(
                loteRepository.somarValorDoEstoque().setScale(2, RoundingMode.HALF_UP),
                produtoRepository.countByAtivoTrue(),
                contar(alertas, "ESTOQUE_BAIXO"),
                contar(alertas, "LOTE_VENCENDO"),
                contar(alertas, "LOTE_VENCIDO"),
                hoje);
    }

    private long contar(List<AlertaView> alertas, String tipo) {
        return alertas.stream().filter(a -> tipo.equals(a.getTipo())).count();
    }
}
