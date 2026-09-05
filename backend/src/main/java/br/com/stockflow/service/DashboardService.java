package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.enums.StatusLote;
import br.com.stockflow.dto.response.DashboardResponse;
import br.com.stockflow.dto.response.LoteResponse;
import br.com.stockflow.repository.LoteRepository;
import br.com.stockflow.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProdutoRepository produtoRepository;
    private final LoteRepository loteRepository;
    private final EstoqueService estoqueService;

    public DashboardService(ProdutoRepository produtoRepository, LoteRepository loteRepository, EstoqueService estoqueService) {
        this.produtoRepository = produtoRepository;
        this.loteRepository = loteRepository;
        this.estoqueService = estoqueService;
    }

    public DashboardResponse gerar() {
        List<Lote> lotes = loteRepository.findAll();

        Map<StatusLote, Long> porStatus = new EnumMap<>(StatusLote.class);
        for (StatusLote status : StatusLote.values()) {
            porStatus.put(status, 0L);
        }

        List<LoteResponse> alertas = lotes.stream()
                .map(lote -> Map.entry(lote, estoqueService.calcularStatus(lote)))
                .peek(entry -> porStatus.merge(entry.getValue(), 1L, Long::sum))
                .filter(entry -> entry.getValue() != StatusLote.EM_ESTOQUE)
                .map(entry -> LoteResponse.de(entry.getKey(), entry.getValue()))
                .toList();

        return new DashboardResponse(
                produtoRepository.count(),
                porStatus.get(StatusLote.EM_ESTOQUE),
                porStatus.get(StatusLote.BAIXO),
                porStatus.get(StatusLote.VENCENDO),
                porStatus.get(StatusLote.VENCIDO),
                alertas
        );
    }
}
