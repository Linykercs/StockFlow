package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.SituacaoLote;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import br.com.stockflow.dto.request.BaixaLoteRequest;
import br.com.stockflow.dto.response.LoteResponse;
import br.com.stockflow.dto.response.MovimentacaoResponse;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.exception.RegraNegocioException;
import br.com.stockflow.repository.LoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// RF03 (rastreio por lote) e RN02 (baixa de lote vencido)
@Service
public class LoteService {

    private final LoteRepository loteRepository;
    private final MovimentacaoService movimentacaoService;
    private final ConfiguracaoService configuracaoService;

    public LoteService(LoteRepository loteRepository, MovimentacaoService movimentacaoService,
                       ConfiguracaoService configuracaoService) {
        this.loteRepository = loteRepository;
        this.movimentacaoService = movimentacaoService;
        this.configuracaoService = configuracaoService;
    }

    // vencimento: VENCIDO ou VENCENDO, filtrado depois de calcular a situação de cada lote
    @Transactional(readOnly = true)
    public List<LoteResponse> listar(Long produtoId, SituacaoLote situacao, String vencimento) {
        if (vencimento != null && !vencimento.equals("VENCIDO") && !vencimento.equals("VENCENDO")) {
            throw new RegraNegocioException("O filtro vencimento aceita VENCIDO ou VENCENDO.");
        }
        int diasAlerta = configuracaoService.diasAlertaVencimento();
        return loteRepository.buscar(situacao == null ? SituacaoLote.ATIVO : situacao, produtoId).stream()
                .map(l -> LoteResponse.de(l, diasAlerta))
                .filter(l -> vencimento == null || vencimento.equals(l.situacaoValidade()))
                .toList();
    }

    // Tira todo o saldo do lote e fecha o lote (BAIXADO ou DESCARTADO)
    @Transactional
    public MovimentacaoResponse baixar(Long id, BaixaLoteRequest dados, Usuario usuario) {
        if (dados.situacao() == SituacaoLote.ATIVO) {
            throw new RegraNegocioException("Na baixa, a situação precisa ser BAIXADO ou DESCARTADO.");
        }
        if (dados.motivo() != MotivoMovimentacao.VENCIMENTO && dados.motivo() != MotivoMovimentacao.PERDA) {
            throw new RegraNegocioException("A baixa aceita o motivo VENCIMENTO ou PERDA.");
        }

        Lote lote = loteRepository.buscarParaAtualizar(id)
                .orElseThrow(() -> new NaoEncontradoException("Lote " + id + " não encontrado."));
        if (lote.getSituacao() != SituacaoLote.ATIVO) {
            throw new RegraNegocioException("O lote " + lote.getCodigo() + " já foi baixado.");
        }
        if (lote.getQuantidadeAtual().signum() == 0) {
            throw new RegraNegocioException("O lote " + lote.getCodigo() + " está sem saldo.");
        }
        if (dados.motivo() == MotivoMovimentacao.VENCIMENTO && !lote.isVencido()) {
            throw new RegraNegocioException("O lote " + lote.getCodigo() + " ainda não venceu. Para avaria, use o motivo PERDA.");
        }

        var custo = lote.getPrecoCusto() != null ? lote.getPrecoCusto() : lote.getProduto().getPrecoEntrada();
        var movimentacao = movimentacaoService.registrar(lote, TipoMovimentacao.SAIDA, dados.motivo(),
                lote.getQuantidadeAtual(), custo, usuario, null, dados.observacao());
        lote.setSituacao(dados.situacao());
        return MovimentacaoResponse.de(movimentacao);
    }
}
