package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.dto.request.LoteRequest;
import br.com.stockflow.dto.response.LoteResponse;
import br.com.stockflow.exception.RecursoNaoEncontradoException;
import br.com.stockflow.repository.LoteRepository;
import br.com.stockflow.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LoteService {

    private final LoteRepository loteRepository;
    private final ProdutoRepository produtoRepository;
    private final EstoqueService estoqueService;

    public LoteService(LoteRepository loteRepository, ProdutoRepository produtoRepository, EstoqueService estoqueService) {
        this.loteRepository = loteRepository;
        this.produtoRepository = produtoRepository;
        this.estoqueService = estoqueService;
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> listarPorProduto(Long produtoId) {
        return loteRepository.findByProdutoId(produtoId).stream()
                .map(lote -> LoteResponse.de(lote, estoqueService.calcularStatus(lote)))
                .toList();
    }

    public LoteResponse cadastrar(LoteRequest request) {
        Produto produto = produtoRepository.findById(request.produtoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado: " + request.produtoId()));

        Lote lote = Lote.builder()
                .produto(produto)
                .quantidade(request.quantidade())
                .dataValidade(request.dataValidade())
                .precoCusto(request.precoCusto())
                .build();

        loteRepository.save(lote);
        return LoteResponse.de(lote, estoqueService.calcularStatus(lote));
    }
}
